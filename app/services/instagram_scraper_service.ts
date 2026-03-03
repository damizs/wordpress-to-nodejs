/**
 * Instagram Scraper Service
 * Busca posts de perfis do Instagram via RapidAPI
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

export default class InstagramScraperService {
  private lastError: string = ''

  getLastError(): string {
    return this.lastError
  }

  async getPostsFromProfile(profileUrl: string, limit?: number): Promise<InstagramPost[]> {
    if (!this.validateProfileUrl(profileUrl)) {
      throw new Error('URL do perfil inválida.')
    }

    const maxPosts = limit ?? parseInt(await InstagramSetting.get('posts_fetch_count', '50') || '50')
    const username = this.extractUsername(profileUrl)
    this.lastError = ''

    console.log(`Instagram Scraper: Buscando até ${maxPosts} posts de @${username}`)

    // Tentar via RapidAPI
    const rapidapiKey = await InstagramSetting.get('rapidapi_key')
    if (rapidapiKey) {
      try {
        const posts = await this.scrapeWithRapidapi(username, rapidapiKey, maxPosts)
        if (posts.length > 0) {
          console.log(`Instagram Scraper: Sucesso - ${posts.length} posts únicos`)
          return posts
        }
      } catch (error: any) {
        this.lastError = error.message
        console.error(`Instagram Scraper Error: ${error.message}`)
        throw error
      }
    } else {
      throw new Error('RapidAPI Key não configurada. Configure nas configurações.')
    }

    return []
  }

  /**
   * Busca posts via RapidAPI Instagram Scraper
   */
  private async scrapeWithRapidapi(username: string, apiKey: string, max: number): Promise<InstagramPost[]> {
    const seenIds = new Set<string>()
    const allPosts: InstagramPost[] = []
    let cursor: string | null = null
    const maxIterations = Math.ceil(max / 12) + 2
    let iteration = 0

    while (allPosts.length < max && iteration < maxIterations) {
      iteration++

      const params = new URLSearchParams({
        username_or_id: username,
        count: '50'
      })

      if (cursor) {
        params.append('end_cursor', cursor)
      }

      const url = `https://instagram-public-bulk-scraper.p.rapidapi.com/v2/user_posts?${params.toString()}`

      console.log(`Instagram Scraper: Iteração ${iteration}, posts coletados: ${allPosts.length}`)

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'instagram-public-bulk-scraper.p.rapidapi.com'
          }
        })

        if (response.status === 401 || response.status === 403) {
          throw new Error('API Key inválida ou sem créditos')
        }

        if (response.status === 429) {
          throw new Error('Limite de requisições da API atingido. Tente novamente mais tarde.')
        }

        if (!response.ok) {
          const text = await response.text()
          throw new Error(`RapidAPI erro ${response.status}: ${text.substring(0, 100)}`)
        }

        const data: any = await response.json()

        // Extrair items
        let items: any[] = []
        if (data?.data?.items && Array.isArray(data.data.items)) {
          items = data.data.items
        } else if (data?.items && Array.isArray(data.items)) {
          items = data.items
        }

        if (items.length === 0) {
          console.log(`Instagram Scraper: Sem mais items na iteração ${iteration}`)
          break
        }

        // Processar items (com deduplicação)
        for (const item of items) {
          if (allPosts.length >= max) break
          
          const post = this.parseRapidapiItem(item)
          if (post && !seenIds.has(post.id)) {
            seenIds.add(post.id)
            allPosts.push(post)
          }
        }

        // Extrair cursor para próxima página
        cursor = data?.data?.next_cursor || data?.data?.end_cursor || 
                 data?.next_cursor || data?.end_cursor || null

        const hasMore = data?.data?.more_available || data?.more_available || false

        if (!cursor && !hasMore) {
          console.log(`Instagram Scraper: Fim dos posts (sem cursor/more)`)
          break
        }

        // Delay entre requisições
        if (allPosts.length < max && cursor) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }

      } catch (error: any) {
        console.error(`Instagram Scraper: Erro na iteração ${iteration}: ${error.message}`)
        throw error
      }
    }

    // Ordenar por data (mais recente primeiro)
    allPosts.sort((a, b) => b.takenAtTimestamp - a.takenAtTimestamp)

    console.log(`Instagram Scraper: Total de ${allPosts.length} posts únicos coletados`)
    return allPosts
  }

  /**
   * Parse um item do RapidAPI para o formato padrão
   */
  private parseRapidapiItem(item: any): InstagramPost | null {
    // Extrair ID único
    const id = String(item.id || item.pk || '')
    if (!id) return null

    // Extrair shortcode
    const shortcode = item.code || ''

    // Extrair caption
    let caption = ''
    if (item.caption?.text) {
      caption = item.caption.text
    } else if (typeof item.caption === 'string') {
      caption = item.caption
    }

    // Extrair imagem (tentar várias fontes)
    let imageUrl = ''
    
    // Prioridade 1: display_uri
    if (item.display_uri) {
      imageUrl = item.display_uri
    }
    // Prioridade 2: image_versions2
    else if (item.image_versions2?.candidates?.[0]?.url) {
      imageUrl = item.image_versions2.candidates[0].url
    }
    // Prioridade 3: thumbnail_url
    else if (item.thumbnail_url) {
      imageUrl = item.thumbnail_url
    }
    // Prioridade 4: carousel (primeiro item)
    else if (item.carousel_media?.[0]) {
      const carousel = item.carousel_media[0]
      if (carousel.image_versions2?.candidates?.[0]?.url) {
        imageUrl = carousel.image_versions2.candidates[0].url
      } else if (carousel.display_uri) {
        imageUrl = carousel.display_uri
      }
    }

    if (!imageUrl) return null

    // Extrair timestamp
    let timestamp = 0
    if (item.taken_at) {
      timestamp = Number(item.taken_at)
    } else if (item.taken_at_timestamp) {
      timestamp = Number(item.taken_at_timestamp)
    }
    
    // Validar timestamp (deve estar entre 2020 e 2030)
    const minTimestamp = 1577836800 // 2020-01-01
    const maxTimestamp = 1893456000 // 2030-01-01
    if (timestamp < minTimestamp || timestamp > maxTimestamp) {
      timestamp = Math.floor(Date.now() / 1000)
    }

    const isVideo = item.media_type === 2 || item.is_video === true

    return {
      id,
      shortcode,
      thumbnailSrc: imageUrl,
      displayUrl: imageUrl,
      caption,
      takenAtTimestamp: timestamp,
      isVideo
    }
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
      return parsed.pathname.replace(/^\/|\/$/g, '').split('/')[0]
    } catch {
      return url
    }
  }
}
