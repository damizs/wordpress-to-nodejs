import InstagramImportSetting from '#models/instagram_import_setting'

export interface InstagramPost {
  id: string
  shortcode: string
  thumbnailSrc: string
  displayUrl: string
  caption: string
  takenAtTimestamp: number
  isVideo: boolean
}

export default class InstagramScraperService {
  private lastError: string = ''

  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ]

  getLastError(): string {
    return this.lastError
  }

  async getPostsFromProfile(profileUrl: string): Promise<InstagramPost[]> {
    if (!this.validateProfileUrl(profileUrl)) {
      throw new Error('URL do perfil inválida')
    }

    const username = this.extractUsername(profileUrl)
    this.lastError = ''

    console.log(`[Instagram Scraper] Buscando posts de @${username}`)

    // 1. Prioridade: RapidAPI
    const rapidApiKey = await InstagramImportSetting.get('rapidapi_key')
    if (rapidApiKey) {
      try {
        const posts = await this.scrapeWithRapidApi(username, rapidApiKey)
        if (posts.length > 0) {
          console.log(`[Instagram Scraper] Sucesso via RapidAPI - ${posts.length} posts`)
          return posts
        }
      } catch (error: any) {
        this.lastError = `RapidAPI: ${error.message}`
        console.error(`[Instagram Scraper] RapidAPI Error: ${error.message}`)
      }
    }

    // 2. Fallback: Cookie de sessão
    const sessionId = await InstagramImportSetting.get('instagram_sessionid')
    if (sessionId) {
      try {
        const posts = await this.scrapeWithCookie(username, sessionId)
        if (posts.length > 0) {
          console.log(`[Instagram Scraper] Sucesso via Cookie - ${posts.length} posts`)
          return posts
        }
      } catch (error: any) {
        this.lastError += ` | Cookie: ${error.message}`
        console.error(`[Instagram Scraper] Cookie Error: ${error.message}`)
      }
    }

    // 3. Fallback: Mirrors públicos
    try {
      const posts = await this.scrapeViaMirrors(username)
      if (posts.length > 0) {
        console.log(`[Instagram Scraper] Sucesso via Mirror - ${posts.length} posts`)
        return posts
      }
    } catch (error: any) {
      this.lastError += ` | Mirror: ${error.message}`
      console.error(`[Instagram Scraper] Mirror Error: ${error.message}`)
    }

    console.error(`[Instagram Scraper] Todos os métodos falharam: ${this.lastError}`)
    return []
  }

  private async scrapeWithRapidApi(username: string, apiKey: string): Promise<InstagramPost[]> {
    const url = `https://instagram-public-bulk-scraper.p.rapidapi.com/v2/user_posts?username_or_id=${encodeURIComponent(username)}&count=12`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'instagram-public-bulk-scraper.p.rapidapi.com',
      },
    })

    if (response.status === 401 || response.status === 403) {
      throw new Error('API Key inválida ou sem créditos')
    }

    if (response.status === 429) {
      throw new Error('Limite de requisições atingido')
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json() as {
      data?: { items?: any[] }
      items?: any[]
    }

    // Extrair items
    let items: any[] = []
    if (data?.data?.items && Array.isArray(data.data.items)) {
      items = data.data.items
    } else if (data?.items && Array.isArray(data.items)) {
      items = data.items
    }

    return items.slice(0, 12).map((item: any) => this.parseRapidApiItem(item)).filter(Boolean) as InstagramPost[]
  }

  private parseRapidApiItem(item: any): InstagramPost | null {
    // Extrair caption
    let caption = ''
    if (item.caption?.text) {
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
    if (!imageUrl && item.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url) {
      imageUrl = item.carousel_media[0].image_versions2.candidates[0].url
    }

    if (!imageUrl) return null

    return {
      id: item.id || item.pk || this.hashString(imageUrl),
      shortcode: item.code || '',
      thumbnailSrc: imageUrl,
      displayUrl: imageUrl,
      caption,
      takenAtTimestamp: item.taken_at || Math.floor(Date.now() / 1000),
      isVideo: item.media_type === 2,
    }
  }

  private async scrapeWithCookie(username: string, sessionId: string): Promise<InstagramPost[]> {
    const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`
    
    const userAgent = await InstagramImportSetting.get('instagram_useragent') ||
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'

    const response = await fetch(url, {
      headers: {
        'Cookie': `sessionid=${sessionId}`,
        'User-Agent': userAgent,
        'X-IG-App-ID': '936619743392459',
        'X-Requested-With': 'XMLHttpRequest',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json() as {
      data?: {
        user?: {
          edge_owner_to_timeline_media?: {
            edges?: any[]
          }
        }
      }
    }
    const edges = data?.data?.user?.edge_owner_to_timeline_media?.edges || []

    return edges.slice(0, 12).map((edge: any) => {
      const node = edge.node
      let caption = ''
      if (node.edge_media_to_caption?.edges?.[0]?.node?.text) {
        caption = node.edge_media_to_caption.edges[0].node.text
      }

      return {
        id: node.id,
        shortcode: node.shortcode,
        thumbnailSrc: node.thumbnail_src || node.display_url,
        displayUrl: node.display_url,
        caption,
        takenAtTimestamp: node.taken_at_timestamp,
        isVideo: node.is_video,
      }
    })
  }

  private async scrapeViaMirrors(username: string): Promise<InstagramPost[]> {
    const mirrors = [
      { name: 'imginn', url: `https://imginn.com/${username}/` },
      { name: 'picuki', url: `https://www.picuki.com/profile/${username}` },
    ]

    for (const mirror of mirrors) {
      try {
        const response = await fetch(mirror.url, {
          headers: { 'User-Agent': this.getRandomUserAgent() },
        })

        if (!response.ok) continue

        const html = await response.text()
        const posts = this.parseHtmlForImages(html)

        if (posts.length > 0) {
          return posts
        }
      } catch (error) {
        continue
      }
    }

    return []
  }

  private parseHtmlForImages(html: string): InstagramPost[] {
    const posts: InstagramPost[] = []
    
    // Regex simples para encontrar URLs de imagens do Instagram
    const imgRegex = /<img[^>]+src=["']([^"']+instagram[^"']+|[^"']+cdninstagram[^"']+)["'][^>]*>/gi
    let match

    while ((match = imgRegex.exec(html)) !== null && posts.length < 12) {
      const src = match[1]
      if (src.includes('profile') || src.includes('logo') || src.includes('icon')) continue

      posts.push({
        id: this.hashString(src),
        shortcode: '',
        thumbnailSrc: src,
        displayUrl: src,
        caption: '',
        takenAtTimestamp: Math.floor(Date.now() / 1000),
        isVideo: false,
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
    return Math.abs(hash).toString(16)
  }
}
