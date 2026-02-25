import InstagramSettings from '#models/instagram_settings'

export interface ProcessedContent {
  title: string
  content: string
  tokensUsed: number
}

interface OpenAIResponse {
  choices: Array<{ message: { content: string } }>
  usage?: { total_tokens: number }
  error?: { message: string }
}

interface ClaudeResponse {
  content: Array<{ text: string }>
  usage?: { input_tokens: number; output_tokens: number }
  error?: { message: string }
}

interface GeminiResponse {
  candidates?: Array<{ content: { parts: Array<{ text: string }> } }>
  error?: { message: string }
}

export default class AIProcessorService {
  private settings: InstagramSettings | null = null

  static DEFAULT_PROMPT = `Você é um redator profissional de portais institucionais governamentais (câmaras e prefeituras).
Com base na legenda do Instagram abaixo, gere:
1. Um título jornalístico chamativo e informativo (máximo 80 caracteres, SEM truncar com reticências)
2. Um conteúdo de notícia em tom formal e institucional (2 a 3 parágrafos)

REGRAS IMPORTANTES:
- Use linguagem clara e objetiva
- Evite emojis e informalidade
- Mantenha tom institucional
- NÃO use entidades HTML (como &hellip; &amp; etc) - use caracteres normais
- NÃO corte o título com reticências, faça um título COMPLETO
- Se o título ficar muito grande, reformule para caber em 80 caracteres

Legenda do Instagram:
{CAPTION}

Responda APENAS em formato JSON válido:
{
  "titulo": "...",
  "conteudo": "..."
}`

  async processCaption(caption: string): Promise<ProcessedContent> {
    this.settings = await InstagramSettings.getSettings()

    if (!this.settings.aiApiKey) {
      throw new Error('API Key não configurada.')
    }

    const prompt = this.buildPrompt(caption)

    switch (this.settings.aiProvider) {
      case 'openai':
        return this.callOpenAI(prompt)
      case 'claude':
        return this.callClaude(prompt)
      case 'gemini':
        return this.callGemini(prompt)
      default:
        throw new Error('Provedor de IA inválido.')
    }
  }

  private buildPrompt(caption: string): string {
    const customPrompt = this.settings?.aiPrompt || AIProcessorService.DEFAULT_PROMPT
    return customPrompt.replace('{CAPTION}', caption)
  }

  private async callOpenAI(prompt: string): Promise<ProcessedContent> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.settings!.aiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.settings!.aiModel || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that outputs JSON.' },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json() as { error?: { message: string } }
      throw new Error(errorData.error?.message || 'Erro na API OpenAI')
    }

    const data = await response.json() as OpenAIResponse
    const content = data.choices[0].message.content
    const result = JSON.parse(content)

    return {
      title: result.titulo || result.title || '',
      content: result.conteudo || result.content || '',
      tokensUsed: data.usage?.total_tokens || 0,
    }
  }

  private async callClaude(prompt: string): Promise<ProcessedContent> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.settings!.aiApiKey!,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.settings!.aiModel || 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json() as { error?: { message: string } }
      throw new Error(errorData.error?.message || 'Erro na API Claude')
    }

    const data = await response.json() as ClaudeResponse
    let content = data.content[0].text

    // Extrair JSON
    content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    const jsonMatch = content.match(/\{.*\}/s)
    if (jsonMatch) {
      content = jsonMatch[0]
    }

    const result = JSON.parse(content)

    return {
      title: result.titulo || result.title || '',
      content: result.conteudo || result.content || '',
      tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    }
  }

  private async callGemini(prompt: string): Promise<ProcessedContent> {
    const model = this.settings!.aiModel || 'gemini-2.0-flash'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.settings!.aiApiKey}`

    console.log(`[AIProcessor] Chamando Gemini com modelo ${model}`)

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json() as { error?: { message: string } }
      throw new Error(errorData.error?.message || 'Erro na API Gemini')
    }

    const data = await response.json() as GeminiResponse

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Resposta inesperada da API Gemini')
    }

    let content = data.candidates[0].content.parts[0].text

    // Extrair JSON (remover markdown)
    content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    const jsonMatch = content.match(/\{.*\}/s)
    if (jsonMatch) {
      content = jsonMatch[0]
    }

    const result = JSON.parse(content)

    console.log(`[AIProcessor] Título gerado: ${result.titulo || result.title}`)

    return {
      title: result.titulo || result.title || '',
      content: result.conteudo || result.content || '',
      tokensUsed: 0,
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.processCaption('Teste de conexão com a IA.')
      return { success: true }
    } catch (error) {
      const err = error as Error
      return { success: false, error: err.message }
    }
  }
}
