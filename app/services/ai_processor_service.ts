import InstagramImportSetting from '#models/instagram_import_setting'

export interface AIResult {
  title: string
  content: string
  tokensUsed: number
}

export default class AIProcessorService {
  private provider: string
  private apiKey: string
  private model: string

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

  constructor(config?: { provider?: string; apiKey?: string; model?: string }) {
    this.provider = config?.provider || 'gemini'
    this.apiKey = config?.apiKey || ''
    this.model = config?.model || 'gemini-2.0-flash'
  }

  async init(): Promise<void> {
    if (!this.apiKey) {
      this.provider = await InstagramImportSetting.get('ai_provider') || 'gemini'
      this.apiKey = await InstagramImportSetting.get('ai_api_key') || ''
      this.model = await InstagramImportSetting.get('ai_model') || 'gemini-2.0-flash'
    }
  }

  async processCaption(caption: string): Promise<AIResult> {
    await this.init()

    if (!this.apiKey) {
      throw new Error('API Key não configurada')
    }

    const customPrompt = await InstagramImportSetting.get('ai_prompt')
    const prompt = (customPrompt || AIProcessorService.DEFAULT_PROMPT).replace('{CAPTION}', caption)

    switch (this.provider) {
      case 'openai':
        return this.callOpenAI(prompt)
      case 'claude':
        return this.callClaude(prompt)
      case 'gemini':
      default:
        return this.callGemini(prompt)
    }
  }

  private async callOpenAI(prompt: string): Promise<AIResult> {
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

    if (!response.ok) {
      const error = await response.json() as { error?: { message?: string } }
      throw new Error(error.error?.message || `HTTP ${response.status}`)
    }

    const data = await response.json() as {
      choices: { message: { content: string } }[]
      usage?: { total_tokens: number }
    }
    const content = data.choices[0].message.content
    const usage = data.usage?.total_tokens || 0

    const result = JSON.parse(content)
    return {
      title: result.titulo || result.title || '',
      content: result.conteudo || result.content || '',
      tokensUsed: usage,
    }
  }

  private async callClaude(prompt: string): Promise<AIResult> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const error = await response.json() as { error?: { message?: string } }
      throw new Error(error.error?.message || `HTTP ${response.status}`)
    }

    const data = await response.json() as {
      content: { text: string }[]
      usage?: { input_tokens: number; output_tokens: number }
    }
    let content = data.content[0].text

    // Extrair JSON
    content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    const jsonMatch = content.match(/\{.*\}/s)
    if (jsonMatch) content = jsonMatch[0]

    const usage = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
    const result = JSON.parse(content)

    return {
      title: result.titulo || result.title || '',
      content: result.conteudo || result.content || '',
      tokensUsed: usage,
    }
  }

  private async callGemini(prompt: string): Promise<AIResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    })

    if (!response.ok) {
      const error = await response.json() as { error?: { message?: string } }
      throw new Error(error.error?.message || `HTTP ${response.status}`)
    }

    const data = await response.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    let content = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!content) {
      throw new Error('Resposta vazia da API Gemini')
    }

    // Extrair JSON
    content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    const jsonMatch = content.match(/\{.*\}/s)
    if (jsonMatch) content = jsonMatch[0]

    const result = JSON.parse(content)

    return {
      title: result.titulo || result.title || '',
      content: result.conteudo || result.content || '',
      tokensUsed: 0, // Gemini não retorna tokens no endpoint gratuito
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.processCaption('Teste de conexão com a API.')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}
