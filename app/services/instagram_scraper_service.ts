interface InstagramPost {
  id: string
  shortcode: string
  thumbnailSrc: string
  displayUrl: string
  caption: string
  takenAtTimestamp: number
  isVideo: boolean
}

interface RapidApiResponse {
  status?: string
  message?: string
  data?: {
    items?: RapidApiItem[]
  }
  items?: RapidApiItem[]
}

interface RapidApiItem {
  id?: string
  pk?: string
  code?: string
  caption?: { text: string } | string
  display_uri?: string
  thumbnail_url?: string
  image_versions2?: {
    candidates?: Array<{ url: string }>
  }
  carousel_media?: Array<{
    image_versions2?: {
      candidates?: Array<{ url: string }>
    }
  }>
  taken_at?: number
  media_type?: number
}

export default class InstagramScraperService {
  private lastError: string = ''
  
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ]

  async getPostsFromProfile(profileUrl: string, rapidapiKey?: string): Promise<InstagramPost[]> {
    if (!this.validateProfileUrl(profileUrl)) {
      throw new Error('URL do perfil inválida.')
    }

    const username = this.extractUsername(profileUrl)
    this.lastError = ''

    console.log(`[Instagram Scraper] Buscando posts de @${username}`)

    // 1. PRIORIDADE: Tentar via RapidAPI
    if (rapidapiKey) {
      try {
        const posts = await this.scrapeWithRapidApi(username, rapidapiKey)
        if (posts.length > 0) {
          console.log(`[Instagram Scraper] Sucesso via RapidAPI - ${posts.length} posts`)
          return posts
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido'
        this.lastError = `RapidAPI: ${message}`
        console.error(`[Instagram Scraper] RapidAPI Error: ${message}`)
      }
    }

    // 2. Fallback: Mirrors públicos
    try {
      const posts = await this.scrapeViaMirrors(username)
      if (posts.length > 0) {
        console.log(`[Instagram Scraper] Sucesso via mirror - ${posts.length} posts`)
        return posts
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      this.lastError += ` | Mirror: ${message}`
      console.error(`[Instagram Scraper] Mirror Error: ${message}`)
    }

    // 3. Último recurso: Mock Data
    console.log(`[Instagram Scraper] Todos os métodos falharam. Retornando mock.`)
    return this.getMockData()
  }

  getLastError(): string {
    return this.lastError
  }

  /**
   * Busca posts via RapidAPI Instagram Public Bulk Scraper
   */
  private async scrapeWithRapidApi(username: string, apiKey: string): Promise<InstagramPost[]> {
    const url = `https://instagram-public-bulk-scraper.p.rapidapi.com/v2/user_posts?username_or_id=${encodeURIComponent(username)}&count=12`

    console.log(`[RapidAPI] Chamando: ${url}`)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'instagram-public-bulk-scraper.p.rapidapi.com'
      }
    })

    console.log(`[RapidAPI] HTTP ${response.status}`)

    if (response.status === 401 || response.status === 403) {
      throw new Error('API Key inválida ou sem créditos')
    }

    if (response.status === 429) {
      throw new Error('Limite de requisições da API atingido')
    }

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`RapidAPI retornou código ${response.status}: ${text.substring(0, 200)}`)
    }

    const data = await response.json() as RapidApiResponse

    // Verificar erro na resposta
    if (data.status && data.status !== 'ok') {
      throw new Error(`API retornou erro: ${data.message || 'desconhecido'}`)
    }

    // Extrair items
    let items: RapidApiItem[] = []
    if (data.data?.items && Array.isArray(data.data.items)) {
      items = data.data.items
    } else if (data.items && Array.isArray(data.items)) {
      items = data.items
    } else {
      throw new Error('Formato de resposta inesperado')
    }

    console.log(`[RapidAPI] Encontrados ${items.length} items`)

    const posts: InstagramPost[] = []
    for (const item of items) {
      if (posts.length >= 12) break

      // Extrair caption
      let caption = ''
      if (item.caption && typeof item.caption === 'object' && 'text' in item.caption) {
        caption = item.caption.text
      } else if (typeof item.caption === 'string') {
        caption = item.caption
      }

      // Extrair imagem
      let imageUrl = ''
      if (item.display_uri) {
        imageUrl = item.display_uri
      } else if (item.image_versions2?.candidates?.[0]?.url) {
        imageUrl = item.image_versions2.candidates[0].url
      } else if (item.thumbnail_url) {
        imageUrl = item.thumbnail_url
      }

      // Para carrosséis
      if (!imageUrl && item.carousel_media?.[0]) {
        const carouselItem = item.carousel_media[0]
        if (carouselItem.image_versions2?.candidates?.[0]?.url) {
          imageUrl = carouselItem.image_versions2.candidates[0].url
        }
      }

      if (!imageUrl) continue

      const isVideo = item.media_type === 2

      posts.push({
        id: item.id || item.pk || this.hashString(imageUrl),
        shortcode: item.code || '',
        thumbnailSrc: imageUrl,
        displayUrl: imageUrl,
        caption,
        takenAtTimestamp: item.taken_at || Math.floor(Date.now() / 1000),
        isVideo
      })
    }

    return posts
  }

  /**
   * Busca via mirrors públicos
   */
  private async scrapeViaMirrors(username: string): Promise<InstagramPost[]> {
    const mirrors = [
      { name: 'imginn', url: `https://imginn.com/${username}/` },
      { name: 'picuki', url: `https://www.picuki.com/profile/${username}` }
    ]

    for (const mirror of mirrors) {
      try {
        const response = await fetch(mirror.url, {
          headers: {
            'User-Agent': this.getRandomUserAgent()
          }
        })

        if (!response.ok) continue

        const html = await response.text()
        const posts = this.parseGenericHtml(html)

        if (posts.length > 0) {
          return posts
        }
      } catch {
        continue
      }
    }

    return []
  }

  /**
   * Parse genérico de HTML de mirrors
   */
  private parseGenericHtml(html: string): InstagramPost[] {
    const posts: InstagramPost[] = []
    
    // Regex para encontrar URLs de imagens do Instagram
    const imgRegex = /<img[^>]+src="([^"]+(?:instagram|cdninstagram|scontent)[^"]+)"/gi
    const matches = html.matchAll(imgRegex)

    for (const match of matches) {
      if (posts.length >= 12) break
      
      const src = match[1]
      if (!src || src.includes('profile') || src.includes('logo')) continue

      posts.push({
        id: this.hashString(src),
        shortcode: '',
        thumbnailSrc: src,
        displayUrl: src,
        caption: '',
        takenAtTimestamp: Math.floor(Date.now() / 1000),
        isVideo: false
      })
    }

    return posts
  }

  private getMockData(): InstagramPost[] {
    const posts: InstagramPost[] = []
    for (let i = 0; i < 12; i++) {
      posts.push({
        id: `mock_${i}_${Date.now()}`,
        shortcode: `MOCK${i}`,
        thumbnailSrc: `https://picsum.photos/300/300?random=${i}`,
        displayUrl: `https://picsum.photos/600/600?random=${i}`,
        caption: `Esta é uma simulação. O Instagram bloqueou o acesso direto. Post ${i}.`,
        takenAtTimestamp: Math.floor(Date.now() / 1000) - (i * 86400),
        isVideo: false
      })
    }
    return posts
  }

  private validateProfileUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return parsed.hostname.includes('instagram.com')
    } catch {
      return false
    }
  }

  private extractUsername(url: string): string {
    try {
      const parsed = new URL(url)
      return parsed.pathname.replace(/\//g, '')
    } catch {
      return url
    }
  }

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)]
  }

  private hashString(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString()
  }
}
