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

export default class InstagramScraperService {
  private lastError: string = ''
  private debugInfo: Record<string, any> = {}

  /**
   * Get posts from Instagram profile
   * Priority: RapidAPI > Cookie > Mirrors > Mock
   */
  async getPostsFromProfile(profileUrl: string, limit?: number): Promise<InstagramPost[]> {
    if (!this.validateProfileUrl(profileUrl)) {
      throw new Error('URL do perfil inválida.')
    }

    const maxPosts = limit ?? Number(await InstagramSetting.get('posts_fetch_count', '50'))
    const username = this.extractUsername(profileUrl)
    this.lastError = ''

    console.log(`Instagram Scraper: Buscando até ${maxPosts} posts de @${username}`)

    // 1. Try RapidAPI (most reliable)
    const rapidapiKey = await InstagramSetting.get('rapidapi_key')
    if (rapidapiKey) {
      try {
        const posts = await this.scrapeWithRapidApi(username, rapidapiKey, maxPosts)
        if (posts.length > 0) {
          console.log(`Instagram Scraper: Sucesso via RapidAPI - ${posts.length} posts`)
          return posts
        }
      } catch (error: any) {
        this.lastError = `RapidAPI: ${error.message}`
        console.error('RapidAPI Error:', error.message)
      }
    }

    // 2. Try Cookie session
    const sessionId = await InstagramSetting.get('instagram_sessionid')
    if (sessionId) {
      try {
        const posts = await this.scrapeWithCookie(username, sessionId, maxPosts)
        if (posts.length > 0) {
          console.log(`Instagram Scraper: Sucesso via cookie - ${posts.length} posts`)
          return posts
        }
      } catch (error: any) {
        this.lastError += ` | Cookie: ${error.message}`
        console.error('Cookie Scrape Error:', error.message)
      }
    }

    // 3. Try public mirrors
    try {
      const posts = await this.scrapeViaMirrors(username, maxPosts)
      if (posts.length > 0) {
        console.log(`Instagram Scraper: Sucesso via mirror - ${posts.length} posts`)
        return posts
      }
    } catch (error: any) {
      this.lastError += ` | Mirror: ${error.message}`
      console.error('Mirror Scrape Error:', error.message)
    }

    // 4. Return mock data as last resort
    console.log('Instagram Scraper: Todos os métodos falharam. Erro:', this.lastError)
    return this.getMockData(maxPosts)
  }

  getLastError(): string {
    return this.lastError
  }

  getDebugInfo(): Record<string, any> {
    return this.debugInfo
  }

  /**
   * Scrape using RapidAPI Instagram Public Bulk Scraper
   */
  private async scrapeWithRapidApi(username: string, apiKey: string, max: number): Promise<InstagramPost[]> {
    const allPosts: InstagramPost[] = []
    let cursor: string | null = null
    const maxIterations = 10
    let iteration = 0
    const perRequest = Math.min(50, max)

    this.debugInfo = {
      method: 'RapidAPI',
      maxRequested: max,
      perRequest,
      iterations: [],
    }

    while (allPosts.length < max && iteration < maxIterations) {
      iteration++

      const params = new URLSearchParams({
        username_or_id: username,
        count: String(perRequest),
      })

      if (cursor) {
        params.append('end_cursor', cursor)
        params.append('cursor', cursor)
      }

      const url = `https://instagram-public-bulk-scraper.p.rapidapi.com/v2/user_posts?${params}`
      const iterDebug: Record<string, any> = {
        iteration,
        cursorUsed: cursor ? cursor.substring(0, 30) + '...' : null,
      }

      const response = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'instagram-public-bulk-scraper.p.rapidapi.com',
        },
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

      if (data.status && data.status !== 'ok') {
        throw new Error(`API retornou erro: ${data.message || 'desconhecido'}`)
      }

      // Extract items
      let items: any[] = []
      if (data.data?.items && Array.isArray(data.data.items)) {
        items = data.data.items
        iterDebug.itemsLocation = 'data.items'
      } else if (data.items && Array.isArray(data.items)) {
        items = data.items
        iterDebug.itemsLocation = 'items'
      }

      iterDebug.itemsCount = items.length

      if (items.length === 0) {
        this.debugInfo.iterations.push(iterDebug)
        break
      }

      // Process items
      for (const item of items) {
        if (allPosts.length >= max) break
        const post = this.parseRapidApiItem(item)
        if (post) {
          allPosts.push(post)
        }
      }

      iterDebug.postsAfterProcessing = allPosts.length

      // Check for pagination cursor
      cursor = data.data?.next_cursor || data.data?.end_cursor || 
               data.next_cursor || data.end_cursor || null

      const hasMore = data.data?.more_available || data.more_available ||
                      data.data?.paging_info?.has_next_page || false

      iterDebug.cursorFound = !!cursor
      iterDebug.hasMore = hasMore
      this.debugInfo.iterations.push(iterDebug)

      if (!cursor && !hasMore) break
      if (allPosts.length >= max) break

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    this.debugInfo.totalPosts = allPosts.length
    this.debugInfo.totalIterations = iteration

    return allPosts
  }

  /**
   * Parse a RapidAPI item to standard format
   */
  private parseRapidApiItem(item: any): InstagramPost | null {
    // Extract caption
    let caption = ''
    if (item.caption?.text) {
      caption = item.caption.text
    } else if (typeof item.caption === 'string') {
      caption = item.caption
    }

    // Extract image URL - prioritize highest resolution
    let imageUrl = ''
    if (item.display_uri) {
      imageUrl = item.display_uri
    } else if (item.image_versions2?.candidates?.[0]?.url) {
      imageUrl = item.image_versions2.candidates[0].url
    } else if (item.thumbnail_url) {
      imageUrl = item.thumbnail_url
    }

    // For carousels, get first image
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
      isVideo,
    }
  }

  /**
   * Scrape using Instagram cookie session
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
      },
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
        isVideo: node.is_video,
      })
    }

    return posts
  }

  /**
   * Scrape via public mirrors (fallback)
   */
  private async scrapeViaMirrors(username: string, max: number): Promise<InstagramPost[]> {
    const mirrors = [
      `https://imginn.com/${username}/`,
      `https://www.picuki.com/profile/${username}`,
    ]

    for (const mirrorUrl of mirrors) {
      try {
        const response = await fetch(mirrorUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        })

        if (!response.ok) continue

        const html = await response.text()
        const posts = this.parseHtmlForImages(html, max)
        if (posts.length > 0) {
          return posts
        }
      } catch (error) {
        console.error(`Mirror ${mirrorUrl} failed:`, error)
      }
    }

    return []
  }

  /**
   * Parse HTML to find Instagram images (generic)
   */
  private parseHtmlForImages(html: string, max: number): InstagramPost[] {
    const posts: InstagramPost[] = []
    
    // Simple regex to find image URLs
    const imgRegex = /<img[^>]+src=["']([^"']+instagram[^"']+)["']/gi
    let match

    while ((match = imgRegex.exec(html)) !== null && posts.length < max) {
      const src = match[1]
      if (src.includes('profile') || src.includes('logo') || src.includes('icon')) {
        continue
      }

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

  /**
   * Get mock data for testing/fallback
   */
  private getMockData(max: number): InstagramPost[] {
    const posts: InstagramPost[] = []
    const count = Math.min(max, 12)

    for (let i = 0; i < count; i++) {
      posts.push({
        id: `mock_${i}_${Date.now()}`,
        shortcode: `MOCK${i}`,
        thumbnailSrc: `https://picsum.photos/300/300?random=${i}`,
        displayUrl: `https://picsum.photos/600/600?random=${i}`,
        caption: `Esta é uma simulação. O Instagram bloqueou o acesso direto. Tente novamente mais tarde ou verifique os logs. Post ${i}.`,
        takenAtTimestamp: Math.floor(Date.now() / 1000) - (i * 86400),
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
      return parsed.pathname.replace(/^\/+|\/+$/g, '')
    } catch {
      return url
    }
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
