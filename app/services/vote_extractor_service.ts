/**
 * Vote Extractor Service
 * Extrai votações nominais das atas das sessões usando IA.
 *
 * - Se a sessão tem o texto da ata (campo minutes), envia o texto.
 * - Se só tem o PDF, envia o arquivo direto para modelos multimodais
 *   (Gemini/Claude leem PDF, inclusive escaneado). OpenAI exige texto.
 *
 * Reaproveita a configuração de IA do módulo Instagram
 * (ai_provider / ai_api_key / ai_model em instagram_settings).
 */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import app from '@adonisjs/core/services/app'
import InstagramSetting from '#models/instagram_setting'
import type PlenarySession from '#models/plenary_session'

export interface ExtractedVote {
  vereador: string
  voto: 'sim' | 'nao' | 'abstencao' | 'ausente' | 'nao_votou'
}

export interface ExtractedVoting {
  materia: string
  descricao: string | null
  resultado: 'aprovado' | 'rejeitado' | 'retirado' | 'adiado' | 'outro'
  unanime: boolean
  votos: ExtractedVote[]
}

const VALID_VOTES = new Set(['sim', 'nao', 'abstencao', 'ausente', 'nao_votou'])
const VALID_RESULTS = new Set(['aprovado', 'rejeitado', 'retirado', 'adiado', 'outro'])

function buildPrompt(councilorNames: string[]): string {
  return `Você é um assistente especializado em documentos legislativos de câmaras municipais brasileiras.
Analise a ata de sessão plenária fornecida e extraia TODAS as votações de matérias (projetos de lei, requerimentos, moções, pareceres, contas, etc).

Vereadores da Câmara (use EXATAMENTE estes nomes ao identificar votos):
${councilorNames.map((n) => `- ${n}`).join('\n')}

REGRAS:
- Para cada matéria votada, identifique: título/identificação da matéria, resultado e o voto de cada vereador.
- Votos possíveis: "sim", "nao", "abstencao", "ausente", "nao_votou" (ex.: presidente que só vota em desempate).
- Se a ata diz que a votação foi unânime ou "aprovado por todos", marque "unanime": true e registre "sim" para todos os vereadores presentes (ausentes como "ausente").
- Se a ata não detalha votos individuais nem diz que foi unânime, liste apenas os votos que conseguir identificar.
- Resultados possíveis: "aprovado", "rejeitado", "retirado", "adiado", "outro".
- Se não houver NENHUMA votação na ata, retorne {"votacoes": []}.
- NÃO invente votos: só registre o que estiver na ata.

Responda APENAS com JSON válido neste formato:
{
  "votacoes": [
    {
      "materia": "Projeto de Lei nº 12/2025 - ...",
      "descricao": "breve resumo da matéria ou null",
      "resultado": "aprovado",
      "unanime": true,
      "votos": [
        { "vereador": "Nome do Vereador", "voto": "sim" }
      ]
    }
  ]
}`
}

/** Remove tags HTML do texto da ata salvo no editor. */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

function parseResponse(raw: string): ExtractedVoting[] {
  let content = raw.replace(/^```json\s*/m, '').replace(/\s*```\s*$/m, '')
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (jsonMatch) content = jsonMatch[0]

  const parsed = JSON.parse(content)
  const list = Array.isArray(parsed?.votacoes) ? parsed.votacoes : []

  return list
    .filter((v: any) => v && typeof v.materia === 'string' && v.materia.trim())
    .map((v: any): ExtractedVoting => {
      const votos = Array.isArray(v.votos) ? v.votos : []
      return {
        materia: String(v.materia).trim().slice(0, 500),
        descricao: v.descricao ? String(v.descricao).trim() : null,
        resultado: VALID_RESULTS.has(v.resultado) ? v.resultado : 'outro',
        unanime: Boolean(v.unanime),
        votos: votos
          .filter((x: any) => x && typeof x.vereador === 'string' && x.vereador.trim())
          .map((x: any): ExtractedVote => ({
            vereador: String(x.vereador).trim(),
            voto: VALID_VOTES.has(x.voto) ? x.voto : 'nao_votou',
          })),
      }
    })
}

export default class VoteExtractorService {
  private provider = ''
  private apiKey = ''
  private model = ''

  private async init(): Promise<void> {
    this.provider = (await InstagramSetting.get('ai_provider', 'gemini')) || 'gemini'
    this.apiKey = (await InstagramSetting.get('ai_api_key')) || ''
    this.model = (await InstagramSetting.get('ai_model', 'gemini-2.0-flash')) || 'gemini-2.0-flash'
  }

  async extractFromSession(
    session: PlenarySession,
    councilorNames: string[]
  ): Promise<ExtractedVoting[]> {
    await this.init()

    if (!this.apiKey) {
      throw new Error(
        'API Key de IA não configurada. Configure em Notícias → Automação Instagram → Configurações.'
      )
    }

    const prompt = buildPrompt(councilorNames)
    const minutesText = session.minutes ? stripHtml(session.minutes) : ''

    // Texto da ata suficiente (> 200 chars) dispensa o PDF
    if (minutesText.length > 200) {
      return this.callWithText(prompt, minutesText)
    }

    if (session.fileUrl) {
      const pdfPath = join(app.publicPath(), session.fileUrl.replace(/^\//, ''))
      const pdfBase64 = (await readFile(pdfPath)).toString('base64')
      return this.callWithPdf(prompt, pdfBase64)
    }

    if (minutesText) {
      return this.callWithText(prompt, minutesText)
    }

    throw new Error('Esta sessão não tem texto de ata nem arquivo PDF anexado.')
  }

  private async callWithText(prompt: string, ataText: string): Promise<ExtractedVoting[]> {
    const fullPrompt = `${prompt}\n\nTEXTO DA ATA:\n${ataText.slice(0, 100_000)}`
    switch (this.provider) {
      case 'openai':
        return this.callOpenai(fullPrompt)
      case 'claude':
        return this.callClaude([{ type: 'text', text: fullPrompt }])
      case 'gemini':
        return this.callGemini([{ text: fullPrompt }])
      default:
        throw new Error(`Provedor de IA inválido: ${this.provider}`)
    }
  }

  private async callWithPdf(prompt: string, pdfBase64: string): Promise<ExtractedVoting[]> {
    switch (this.provider) {
      case 'claude':
        return this.callClaude([
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
          },
          { type: 'text', text: prompt },
        ])
      case 'gemini':
        return this.callGemini([
          { inline_data: { mime_type: 'application/pdf', data: pdfBase64 } },
          { text: prompt },
        ])
      default:
        throw new Error(
          'A leitura direta de PDF requer Gemini ou Claude como provedor de IA. ' +
            'Cole o texto da ata no campo "Ata" da sessão ou troque o provedor nas configurações.'
        )
    }
  }

  private async callOpenai(prompt: string): Promise<ExtractedVoting[]> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant that outputs JSON.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    })
    const data = (await response.json()) as any
    if (!response.ok) {
      throw new Error(data?.error?.message || `OpenAI error: ${response.status}`)
    }
    return parseResponse(data.choices[0].message.content)
  }

  private async callClaude(content: any[]): Promise<ExtractedVoting[]> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 8192,
        messages: [{ role: 'user', content }],
      }),
    })
    const data = (await response.json()) as any
    if (!response.ok) {
      throw new Error(data?.error?.message || `Claude error: ${response.status}`)
    }
    return parseResponse(data.content[0].text)
  }

  private async callGemini(parts: any[]): Promise<ExtractedVoting[]> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    })
    const data = (await response.json()) as any
    if (!response.ok) {
      throw new Error(data?.error?.message || `Gemini error: ${response.status}`)
    }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Resposta inesperada da API Gemini')
    return parseResponse(text)
  }
}
