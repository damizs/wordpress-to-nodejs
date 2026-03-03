/**
 * Instagram Scraper Service
 * Busca posts de perfis do Instagram via RapidAPI, Cookie ou Mirrors
 */

import InstagramSetting from '#models/instagram_setting'

export interface InstagramPost {
  id: string
  shortcode: string
  thumbnailSrc: string
  displayUrl: string
  caption: string
  takenAtTimestamp: number
  isVideo: boolean
}

interface DebugInfo {
  method: string
  maxRequested: number
  totalPosts: number
  totalIterations: number
  stopReason?: string
  iterations: any[]
}

export default class InstagramScraperService {
  private lastError: string = ''
  private debugInfo: DebugInfo = {
    method: '',
    maxRequested: 0,
    totalPosts: 0,
    totalIterations: 0,
    iterations: []
  }

  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ]

  getLastError(): string {
    return this.lastError
  }

  getDebugInfo(): DebugInfo {
    return this.debugInfo
  }

  async getPostsFromProfile(profileUrl: string, limit?: number): Promise<InstagramPost[]> {
    if (!this.validateProfileUrl(profileUrl)) {
      throw new Error('URL do perfil inválida.')
    }

    const maxPosts = limit ?? parseInt(await InstagramSetting.get('posts_fetch_count', '50') || '50')
    const username = this.extractUsername(profileUrl)
    let posts: InstagramPost[] = []
    this.lastError = ''

    console.log(`IAP Scraper: Buscando até ${maxPosts} posts de @${username}`)

    // 1. PRIORIDADE: Tentar via RapidAPI (mais confiável)
    const rapidapiKey = await InstagramSetting.get('rapidapi_key')
    if (rapidapiKey) {
      try {
        posts = await this.scrapeWithRapidapi(username, rapidapiKey, maxPosts)
        if (posts.length > 0) {
          console.log(`IAP Scraper: Sucesso via RapidAPI - ${posts.length} posts`)
          return posts
        }
      } catch (error: any) {
        this.lastError = `RapidAPI: ${error.message}`
        console.error(`IAP RapidAPI Error: ${error.message}`)
      }
    }

    // 2. Fallback: Tentar via Cookie de Sessão
    const sessionId = await InstagramSetting.get('instagram_sessionid')
    if (sessionId) {
      try {
        posts = await this.scrapeWithCookie(username, sessionId, maxPosts)
        if (posts.length > 0) {
          console.log(`IAP Scraper: Sucesso via cookie - ${posts.length} posts`)
          return posts
        }
      } catch (error: any) {
        this.lastError += ` | Cookie: ${error.message}`
        console.error(`IAP Cookie Scrape Error: ${error.message}`)
      }
    }

    // 3. Fallback: Tentar via Mirrors públicos
    try {
      posts = await this.scrapeViaMirrors(username, maxPosts)
      if (posts.length > 0) {
        console.log(`IAP Scraper: Sucesso via mirror - ${posts.length} posts`)
        return posts
      }
    } catch (error: any) {
      this.lastError += ` | Mirror: ${error.message}`
      console.error(`IAP Mirror Scrape Error: ${error.message}`)
    }

    // 4. Último recurso: Retornar vazio com erro
    console.error(`IAP Scraper: Todos os métodos falharam. Erro: ${this.lastError}`)
    return []
  }

  /**
   * Busca posts via RapidAPI Instagram Public Bulk Scraper
   */
  private async scrapeWithRapidapi(username: string, apiKey: string, max: number): Promise<InstagramPost[]> {
    const allPosts: InstagramPost[] = []
    let cursor: string | null = null
    const maxIterations = 10
    let iteration = 0
    const perRequest = Math.min(50, max)

    this.debugInfo = {
      method: 'RapidAPI',
      maxRequested: max,
      totalPosts: 0,
      totalIterations: 0,
      iterations: []
    }

    while (allPosts.length < max && iteration < maxIterations) {
      iteration++

      const params = new URLSearchParams({
        username_or_id: username,
        count: perRequest.toString()
      })

      if (cursor) {
        params.append('end_cursor', cursor)
        params.append('cursor', cursor)
        params.append('max_id', cursor)
      }

      const url = `https://instagram-public-bulk-scraper.p.rapidapi.com/v2/user_posts?${params.toString()}`

      const iterDebug: any = {
        iteration,
        cursorUsed: cursor ? cursor.substring(0, 30) + '...' : null
      }

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'instagram-public-bulk-scraper.p.rapidapi.com'
          }
        })

        iterDebug.httpCode = response.status

        if (response.status === 401 || response.status === 403) {
          throw new Error('API Key inválida ou sem créditos')
        }

        if (response.status === 429) {
          throw new Error('Limite de requisições da API atingido. Tente novamente mais tarde.')
        }

        if (!response.ok) {
          const text = await response.text()
          throw new Error(`RapidAPI retornou código ${response.status}: ${text.substring(0, 200)}`)
        }

        const data: any = await response.json()

        // Extrair items
        let items: any[] = []
        if (data?.data?.items && Array.isArray(data.data.items)) {
          items = data.data.items
          iterDebug.itemsLocation = 'data.items'
        } else if (data?.items && Array.isArray(data.items)) {
          items = data.items
          iterDebug.itemsLocation = 'items'
        }

        iterDebug.itemsCount = items.length

        if (items.length === 0) {
          this.debugInfo.iterations.push(iterDebug)
          break
        }

        // Processar items
        for (const item of items) {
          if (allPosts.length >= max) break
          const post = this.parseRapidapiItem(item)
          if (post) {
            allPosts.push(post)
          }
        }

        iterDebug.postsAfterProcessing = allPosts.length

        // Verificar cursor para próxima página
        cursor = null
        const cursorLocations = [
          ['data', 'next_cursor'],
          ['data', 'end_cursor'],
          ['data', 'cursor'],
          ['next_cursor'],
          ['end_cursor'],
          ['cursor']
        ]

        for (const path of cursorLocations) {
          let value: any = data
          for (const key of path) {
            value = value?.[key]
            if (value === undefined) break
          }
          if (value && typeof value === 'string') {
            cursor = value
            iterDebug.cursorFound = true
            iterDebug.cursorLocation = path.join('.')
            break
          }
        }

        // Verificar has_more
        const hasMore = data?.data?.more_available || data?.more_available || false
        iterDebug.hasMore = hasMore

        this.debugInfo.iterations.push(iterDebug)

        if (!cursor && !hasMore) {
          this.debugInfo.stopReason = 'no_cursor_no_more'
          break
        }

        if (allPosts.length >= max) {
          this.debugInfo.stopReason = 'max_reached'
          break
        }

        // Delay entre requisições
        await new Promise(resolve => setTimeout(resolve, 500))

      } catch (error: any) {
        iterDebug.error = error.message
        this.debugInfo.iterations.push(iterDebug)
        throw error
      }
    }

    this.debugInfo.totalPosts = allPosts.length
    this.debugInfo.totalIterations = iteration

    return allPosts
  }

  /**
   * Parse um item do RapidAPI para o formato padrão
   */
  private parseRapidapiItem(item: any): InstagramPost | null {
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
    if (!imageUrl && item.carousel_media?.[0]) {
      const carouselItem = item.carousel_media[0]
      if (carouselItem.image_versions2?.candidates?.[0]?.url) {
        imageUrl = carouselItem.image_versions2.candidates[0].url
      }
    }

    if (!imageUrl) {
      return null
    }

    const isVideo = item.media_type === 2

    return {
      id: item.id || item.pk || this.hashString(imageUrl),
      shortcode: item.code || '',
      thumbnailSrc: imageUrl,
      displayUrl: imageUrl,
      caption,
      takenAtTimestamp: item.taken_at || Math.floor(Date.now() / 1000),
      isVideo
    }
  }

  /**
   * Busca via Cookie de Sessão do Instagram
   */
  private async scrapeWithCookie(username: string, sessionId: string, max: number): Promise<InstagramPost[]> {
    const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`

    const userAgent = await InstagramSetting.get('instagram_useragent') ||
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36'

    const response = await fetch(url, {
      headers: {
        'Cookie': `sessionid=${sessionId}`,
        'User-Agent': userAgent,
        'X-IG-App-ID': '936619743392459',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': '*/*',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Referer': `https://www.instagram.com/${username}/`,
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      }
    })

    if (!response.ok) {
      throw new Error(`Instagram retornou código ${response.status}. Cookie pode estar expirado.`)
    }

    const data: any = await response.json()
    const edges = data?.data?.user?.edge_owner_to_timeline_media?.edges

    if (!edges) {
      throw new Error('Formato de resposta inesperado. O cookie pode estar inválido.')
    }

    const posts: InstagramPost[] = []

    for (const edge of edges) {
      if (posts.length >= max) break

      const node = edge.node
      let caption = ''
      if (node.edge_media_to_caption?.edges?.[0]?.node?.text) {
        caption = node.edge_media_to_caption.edges[0].node.text
      }

      posts.push({
        id: node.id,
        shortcode: node.shortcode,
        thumbnailSrc: node.thumbnail_src || node.display_url,
        displayUrl: node.display_url,
        caption,
        takenAtTimestamp: node.taken_at_timestamp,
        isVideo: node.is_video
      })
    }

    return posts
  }

  /**
   * Busca via mirrors públicos (imginn, picuki, etc)
   */
  private async scrapeViaMirrors(username: string, max: number): Promise<InstagramPost[]> {
    const mirrors: Record<string, string> = {
      imginn: `https://imginn.com/${username}/`,
      picuki: `https://www.picuki.com/profile/${username}`,
      greatfon: `https://greatfon.com/v/${username}`
    }

    for (const [name, url] of Object.entries(mirrors)) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.getRandomUserAgent()
          }
        })

        if (!response.ok) continue

        const html = await response.text()
        const posts = this.parseGenericHtml(html, max)

        if (posts.length > 0) {
          this.debugInfo.method = `Mirror: ${name}`
          return posts
        }
      } catch (error) {
        continue
      }
    }

    return []
  }

  /**
   * Parse genérico de HTML de mirrors
   */
  private parseGenericHtml(html: string, max: number): InstagramPost[] {
    const posts: InstagramPost[] = []

    // Regex simples para extrair imagens
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"/gi
    let match

    while ((match = imgRegex.exec(html)) !== null && posts.length < max) {
      const src = match[1]
      const alt = match[2]

      // Filtrar ícones e avatares
      if (src.includes('profile') || src.includes('logo') || src.includes('icon')) {
        continue
      }

      posts.push({
        id: this.hashString(src),
        shortcode: '',
        thumbnailSrc: src,
        displayUrl: src,
        caption: alt,
        takenAtTimestamp: Math.floor(Date.now() / 1000),
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
      return parsed.pathname.replace(/^\/|\/$/g, '')
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
    return Math.abs(hash).toString(36)
  }
}
