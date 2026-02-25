interface AiResult {
  title: string
  content: string
  tokensUsed: number
}

interface AiConfig {
  provider: 'openai' | 'claude' | 'gemini'
  apiKey: string
  model: string
  prompt?: string
}

interface OpenAiResponse {
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

export default class AiProcessorService {
  private config: AiConfig

  static readonly DEFAULT_PROMPT = `Você é um redator profissional de portais institucionais governamentais (câmaras e prefeituras).
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

  constructor(config: AiConfig) {
    this.config = config
  }

  async processCaption(caption: string): Promise<AiResult> {
    if (!this.config.apiKey) {
      throw new Error('API Key não configurada.')
    }

    const prompt = this.buildPrompt(caption)

    switch (this.config.provider) {
      case 'openai':
        return this.callOpenAi(prompt)
      case 'claude':
        return this.callClaude(prompt)
      case 'gemini':
        return this.callGemini(prompt)
      default:
        throw new Error('Provedor de IA inválido.')
    }
  }

  private buildPrompt(caption: string): string {
    const template = this.config.prompt || AiProcessorService.DEFAULT_PROMPT
    return template.replace('{CAPTION}', caption)
  }

  private async callOpenAi(prompt: string): Promise<AiResult> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that outputs JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      })
    })

    const data = await response.json() as OpenAiResponse

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || 'Erro na API OpenAI')
    }

    const content = data.choices[0].message.content
    const usage = data.usage?.total_tokens || 0

    const result = JSON.parse(content)

    return {
      title: result.titulo || result.title || '',
      content: result.conteudo || result.content || '',
      tokensUsed: usage
    }
  }

  private async callClaude(prompt: string): Promise<AiResult> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    })

    const data = await response.json() as ClaudeResponse

    if (!response.ok || data.error) {
      throw new Error(data.error?.message || 'Erro na API Claude')
    }

    let content = data.content[0].text

    // Extrair JSON
    content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    const jsonMatch = content.match(/\{.*\}/s)
    if (jsonMatch) {
      content = jsonMatch[0]
    }

    const usage = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
    const result = JSON.parse(content)

    return {
      title: result.titulo || result.title || '',
      content: result.conteudo || result.content || '',
      tokensUsed: usage
    }
  }

  private async callGemini(prompt: string): Promise<AiResult> {
    const model = this.config.model || 'gemini-2.0-flash'
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey}`

    console.log(`[Gemini] Chamando API com modelo ${model}`)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      })
    })

    const data = await response.json() as GeminiResponse

    if (!response.ok || data.error) {
      console.error('[Gemini] Error:', data.error)
      throw new Error(data.error?.message || 'Erro na API Gemini')
    }

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('[Gemini] Resposta inesperada:', data)
      throw new Error('Resposta inesperada da API Gemini')
    }

    let content = data.candidates[0].content.parts[0].text
    console.log(`[Gemini] Resposta bruta: ${content.substring(0, 200)}...`)

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
      tokensUsed: 0
    }
  }

  async testConnection(): Promise<boolean | string> {
    try {
      await this.processCaption('Teste de conexão.')
      return true
    } catch (error) {
      if (error instanceof Error) {
        return error.message
      }
      return 'Erro desconhecido'
    }
  }
}
