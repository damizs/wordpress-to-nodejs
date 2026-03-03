import InstagramSetting from '#models/instagram_setting'

export interface AIProcessResult {
  title: string
  content: string
  tokensUsed: number
}

export default class AIProcessorService {
  private provider: string
  private apiKey: string
  private model: string

  constructor(config?: { provider?: string; apiKey?: string; model?: string }) {
    this.provider = config?.provider || ''
    this.apiKey = config?.apiKey || ''
    this.model = config?.model || ''
  }

  /**
   * Initialize from database settings
   */
  async init(): Promise<void> {
    this.provider = this.provider || await InstagramSetting.get('ai_provider', 'gemini') || 'gemini'
    this.apiKey = this.apiKey || await InstagramSetting.get('ai_api_key', '') || ''
    this.model = this.model || await InstagramSetting.get('ai_model', 'gemini-2.0-flash') || 'gemini-2.0-flash'
  }

  /**
   * Process Instagram caption and generate news content
   */
  async processCaption(caption: string): Promise<AIProcessResult> {
    await this.init()

    if (!this.apiKey) {
      throw new Error('API Key não configurada.')
    }

    const prompt = await this.buildPrompt(caption)

    switch (this.provider) {
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

  /**
   * Test AI connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.init()
      await this.processCaption('Teste de conexão com a IA.')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  /**
   * Build the prompt with caption
   */
  private async buildPrompt(caption: string): Promise<string> {
    let customPrompt = await InstagramSetting.get('ai_prompt')
    if (!customPrompt) {
      customPrompt = InstagramSetting.DEFAULT_PROMPT
    }
    return customPrompt.replace('{CAPTION}', caption)
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string): Promise<AIProcessResult> {
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
      const error: any = await response.json()
      throw new Error(error.error?.message || 'Erro na API OpenAI')
    }

    const data: any = await response.json()
    const content = data.choices[0].message.content
    const tokensUsed = data.usage?.total_tokens || 0

    const result = JSON.parse(content)
    return this.normalizeResult(result, tokensUsed)
  }

  /**
   * Call Anthropic Claude API
   */
  private async callClaude(prompt: string): Promise<AIProcessResult> {
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
        messages: [
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!response.ok) {
      const error: any = await response.json()
      throw new Error(error.error?.message || 'Erro na API Claude')
    }

    const data: any = await response.json()
    let content = data.content[0].text
    const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)

    // Extract JSON from response
    content = this.extractJson(content)
    const result = JSON.parse(content)
    return this.normalizeResult(result, tokensUsed)
  }

  /**
   * Call Google Gemini API
   */
  private async callGemini(prompt: string): Promise<AIProcessResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`

    console.log(`Gemini: Calling API with model ${this.model}`)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const error: any = await response.json()
      console.error('Gemini API Error:', error)
      throw new Error(error.error?.message || 'Erro na API Gemini')
    }

    const data: any = await response.json()
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Gemini: Unexpected response:', data)
      throw new Error('Resposta inesperada da API Gemini')
    }

    let content = data.candidates[0].content.parts[0].text
    console.log('Gemini Raw Response:', content.substring(0, 500))

    // Extract JSON
    content = this.extractJson(content)
    const result = JSON.parse(content)

    console.log('Gemini: Title generated:', result.titulo || result.title)

    return this.normalizeResult(result, 0)
  }

  /**
   * Extract JSON from text (remove markdown code blocks)
   */
  private extractJson(text: string): string {
    // Remove markdown code blocks
    text = text.replace(/^```json\s*/i, '')
    text = text.replace(/\s*```$/i, '')
    
    // Find JSON object
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      return match[0]
    }
    
    return text
  }

  /**
   * Normalize result keys (Portuguese to English)
   */
  private normalizeResult(result: any, tokensUsed: number): AIProcessResult {
    return {
      title: result.titulo || result.title || '',
      content: result.conteudo || result.content || '',
      tokensUsed,
    }
  }
}
