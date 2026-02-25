import InstagramSettings from '#models/instagram_settings'

export interface InstagramPost {
  id: string
  shortcode: string
  thumbnailSrc: string
  displayUrl: string
  caption: string
  takenAtTimestamp: number
  isVideo: boolean
}

interface RapidAPIResponse {
  data?: { items?: RapidAPIItem[] }
  items?: RapidAPIItem[]
}

interface RapidAPIItem {
  id?: string
  pk?: string
  code?: string
  caption?: { text?: string } | string
  display_uri?: string
  image_versions2?: { candidates?: Array<{ url: string }> }
  thumbnail_url?: string
  carousel_media?: Array<{ image_versions2?: { candidates?: Array<{ url: string }> } }>
  media_type?: number
  taken_at?: number
}

interface InstagramProfileResponse {
  data?: {
    user?: {
      edge_owner_to_timeline_media?: {
        edges?: Array<{
          node: {
            id: string
            shortcode: string
            thumbnail_src?: string
            display_url: string
            is_video: boolean
            taken_at_timestamp: number
            edge_media_to_caption?: { edges?: Array<{ node: { text: string } }> }
          }
        }>
      }
    }
  }
}

export default class InstagramScraperService {
  private settings: InstagramSettings | null = null
  private lastError: string = ''

  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
  ]

  async getPostsFromProfile(profileUrl: string): Promise<InstagramPost[]> {
    this.settings = await InstagramSettings.getSettings()
    if (!this.validateProfileUrl(profileUrl)) throw new Error('URL do perfil inválida.')

    const username = this.extractUsername(profileUrl)
    let posts: InstagramPost[] = []
    this.lastError = ''

    if (this.settings.rapidapiKey) {
      try {
        posts = await this.scrapeWithRapidApi(username, this.settings.rapidapiKey)
        if (posts.length > 0) return posts
      } catch (e) {
        this.lastError = `RapidAPI: ${(e as Error).message}`
      }
    }

    if (this.settings.instagramSessionid) {
      try {
        posts = await this.scrapeWithCookie(username, this.settings.instagramSessionid)
        if (posts.length > 0) return posts
      } catch (e) {
        this.lastError += ` | Cookie: ${(e as Error).message}`
      }
    }

    try {
      posts = await this.scrapeViaMirrors(username)
      if (posts.length > 0) return posts
    } catch (e) {
      this.lastError += ` | Mirror: ${(e as Error).message}`
    }

    return []
  }

  getLastError(): string { return this.lastError }

  private async scrapeWithRapidApi(username: string, apiKey: string): Promise<InstagramPost[]> {
    const url = `https://instagram-public-bulk-scraper.p.rapidapi.com/v2/user_posts?username_or_id=${encodeURIComponent(username)}&count=12`
    const response = await fetch(url, {
      headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': 'instagram-public-bulk-scraper.p.rapidapi.com' },
    })

    if (response.status === 401 || response.status === 403) throw new Error('API Key inválida')
    if (response.status === 429) throw new Error('Limite atingido')
    if (!response.ok) throw new Error(`Código ${response.status}`)

    const data = await response.json() as RapidAPIResponse
    const items = data.data?.items || data.items || []

    return items.slice(0, 12).map((item) => {
      let caption = typeof item.caption === 'object' ? item.caption?.text || '' : item.caption || ''
      let imageUrl = item.display_uri || item.image_versions2?.candidates?.[0]?.url || item.thumbnail_url || ''
      if (!imageUrl && item.carousel_media?.[0]) {
        imageUrl = item.carousel_media[0].image_versions2?.candidates?.[0]?.url || ''
      }
      return {
        id: item.id || item.pk || this.generateId(imageUrl),
        shortcode: item.code || '',
        thumbnailSrc: imageUrl,
        displayUrl: imageUrl,
        caption,
        takenAtTimestamp: item.taken_at || Date.now() / 1000,
        isVideo: item.media_type === 2,
      }
    }).filter(p => p.displayUrl)
  }

  private async scrapeWithCookie(username: string, sessionid: string): Promise<InstagramPost[]> {
    const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`
    const response = await fetch(url, {
      headers: {
        Cookie: `sessionid=${sessionid}`,
        'User-Agent': this.settings?.instagramUseragent || this.userAgents[0],
        'X-IG-App-ID': '936619743392459',
      },
    })
    if (!response.ok) throw new Error(`Código ${response.status}`)

    const data = await response.json() as InstagramProfileResponse
    const edges = data.data?.user?.edge_owner_to_timeline_media?.edges || []

    return edges.slice(0, 12).map((edge) => {
      const node = edge.node
      return {
        id: node.id,
        shortcode: node.shortcode,
        thumbnailSrc: node.thumbnail_src || node.display_url,
        displayUrl: node.display_url,
        caption: node.edge_media_to_caption?.edges?.[0]?.node?.text || '',
        takenAtTimestamp: node.taken_at_timestamp,
        isVideo: node.is_video,
      }
    })
  }

  private async scrapeViaMirrors(username: string): Promise<InstagramPost[]> {
    const mirrors = [`https://imginn.com/${username}/`, `https://www.picuki.com/profile/${username}`]
    for (const mirrorUrl of mirrors) {
      try {
        const response = await fetch(mirrorUrl, { headers: { 'User-Agent': this.userAgents[0] } })
        if (!response.ok) continue
        const html = await response.text()
        const posts = this.parseGenericHtml(html)
        if (posts.length > 0) return posts
      } catch { continue }
    }
    return []
  }

  private parseGenericHtml(html: string): InstagramPost[] {
    const posts: InstagramPost[] = []
    const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["']/gi
    let match
    while ((match = imgRegex.exec(html)) !== null && posts.length < 12) {
      const src = match[1], alt = match[2]
      if (src.includes('profile') || src.includes('logo') || src.length < 50) continue
      posts.push({ id: this.generateId(src), shortcode: '', thumbnailSrc: src, displayUrl: src, caption: alt, takenAtTimestamp: Date.now() / 1000, isVideo: false })
    }
    return posts
  }

  private validateProfileUrl(url: string): boolean {
    try { return new URL(url).hostname.includes('instagram.com') } catch { return false }
  }

  private extractUsername(url: string): string {
    try { return new URL(url).pathname.replace(/^\/|\/$/g, '') } catch { return url }
  }

  private generateId(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff
    return `gen_${Math.abs(hash)}`
  }
}
