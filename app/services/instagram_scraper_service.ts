/**
 * Instagram Scraper Service
 *
 * Estrategia:
 * 1. Scraper publico proprio, lendo dados publicos do perfil. Se houver sessionid
 *    configurado, ele e usado apenas como autenticacao opcional do proprio Instagram.
 * 2. RapidAPI fica como fallback legado/opcional, nunca como dependencia padrao.
 *
 * O feed da home usa cache forte em InstagramFeedService, entao este servico deve ser
 * chamado poucas vezes por dia, nunca a cada pageview.
 */

import { execFile as execFileCallback } from 'node:child_process'
import { promisify } from 'node:util'
import InstagramSetting from '#models/instagram_setting'

export interface InstagramPost {
  id: string
  shortcode: string
  thumbnailSrc: string
  displayUrl: string
  caption: string
  takenAtTimestamp: number
  isVideo: boolean
  viewCount?: number
}

export interface InstagramProfileInfo {
  username: string
  fullName: string
  profilePicUrl: string
}

type ScraperProvider = 'auto' | 'public' | 'rapidapi'

const execFile = promisify(execFileCallback)
const CURL_BIN = process.env.CURL_BIN || '/usr/bin/curl'
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

export default class InstagramScraperService {
  private lastError: string = ''

  getLastError(): string {
    return this.lastError
  }

  async getPostsFromProfile(profileUrl: string, limit?: number): Promise<InstagramPost[]> {
    if (!this.validateProfileUrl(profileUrl)) {
      throw new Error('URL do perfil inválida.')
    }

    const maxPosts =
      limit ?? Number.parseInt((await InstagramSetting.get('posts_fetch_count', '50')) || '50')
    const username = this.extractUsername(profileUrl)
    this.lastError = ''

    console.log(`Instagram Scraper: Buscando até ${maxPosts} posts de @${username}`)

    const provider = await this.getProvider()
    let publicError: Error | null = null
    if (provider === 'auto' || provider === 'public') {
      try {
        const posts = await this.scrapeWithPublicProfile(username, maxPosts)
        if (posts.length > 0) {
          console.log(`Instagram Scraper (publico): ${posts.length} posts unicos`)
          return posts
        }
        publicError = new Error('Perfil publico nao retornou publicacoes recentes.')
      } catch (error: any) {
        publicError = error
        this.lastError = error.message
        console.error(`Instagram Scraper (publico) falhou: ${error.message}`)
        if (provider === 'public') throw error
      }
    }

    const rapidapiKey = await InstagramSetting.get('rapidapi_key')
    if (!rapidapiKey) {
      if (publicError) throw publicError
      throw new Error('RapidAPI Key não configurada. Configure nas configurações.')
    }

    // Provedor primário: Instagram Scraper Stable API (a que o cliente assina).
    // Só precisa do username público — sem senha/sessionid da câmara.
    try {
      const posts = await this.scrapeWithStableApi(username, rapidapiKey, maxPosts)
      if (posts.length > 0) {
        console.log(`Instagram Scraper (Stable API): ${posts.length} posts únicos`)
        return posts
      }
    } catch (error: any) {
      this.lastError = error.message
      console.error(`Instagram Scraper (Stable API) falhou: ${error.message}`)
      // não relança: tenta o provedor de fallback abaixo
    }

    // Fallback: Instagram Public Bulk Scraper
    try {
      const posts = await this.scrapeWithRapidapi(username, rapidapiKey, maxPosts)
      if (posts.length > 0) {
        console.log(`Instagram Scraper (Bulk): ${posts.length} posts únicos`)
        return posts
      }
    } catch (error: any) {
      this.lastError = error.message
      console.error(`Instagram Scraper (Bulk) falhou: ${error.message}`)
      throw error
    }

    return []
  }

  /**
   * Busca posts via "Instagram Scraper Stable API" (RapidAPI).
   * Endpoint: POST get_ig_user_posts.php → { posts: [{ node }], pagination_token }
   */
  /**
   * Scraper publico proprio.
   *
   * Usa o mesmo endpoint publico consumido pelo web client do Instagram. O fetch
   * nativo do Node frequentemente recebe 429 enquanto curl no mesmo servidor
   * recebe 200; por isso ha fallback por curl, sem shell e sem expor cookie.
   */
  private async scrapeWithPublicProfile(username: string, max: number): Promise<InstagramPost[]> {
    const data = await this.fetchPublicProfile(username)
    const user = data?.data?.user
    const edges = user?.edge_owner_to_timeline_media?.edges
    if (!Array.isArray(edges) || edges.length === 0) {
      throw new Error('Perfil publico nao retornou publicacoes recentes.')
    }

    const seenIds = new Set<string>()
    const posts: InstagramPost[] = []
    for (const edge of edges) {
      if (posts.length >= max) break
      const node = edge?.node ?? edge
      const post = this.parsePublicProfileItem(node)
      if (post && !seenIds.has(post.id)) {
        seenIds.add(post.id)
        posts.push(post)
      }
    }

    posts.sort((a, b) => b.takenAtTimestamp - a.takenAtTimestamp)
    return posts
  }

  private async fetchPublicProfile(username: string): Promise<any> {
    const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(
      username
    )}`
    const headers = await this.publicInstagramHeaders(username)

    try {
      return await this.fetchJsonWithFetch(url, headers, username)
    } catch (error: any) {
      this.lastError = error.message
      return this.fetchJsonWithCurl(url, headers, username)
    }
  }

  private async publicInstagramHeaders(username: string): Promise<Record<string, string>> {
    const userAgent = (await InstagramSetting.get('instagram_useragent'))?.trim()
    const sessionid = (await InstagramSetting.get('instagram_sessionid'))?.trim()
    const headers: Record<string, string> = {
      Accept: 'application/json,text/plain,*/*',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      Referer: `https://www.instagram.com/${username}/`,
      'User-Agent': userAgent || DEFAULT_USER_AGENT,
      // App id publico usado pelo web client do Instagram. Nao autentica usuario.
      'X-IG-App-ID': '936619743392459',
    }
    if (sessionid) headers.Cookie = `sessionid=${sessionid}`
    return headers
  }

  private async fetchJsonWithFetch(
    url: string,
    headers: Record<string, string>,
    username: string
  ): Promise<any> {
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(12000),
    })

    if (!response.ok) {
      const text = await response.text()
      throw this.instagramHttpError(response.status, text, username)
    }

    return response.json()
  }

  private async fetchJsonWithCurl(
    url: string,
    headers: Record<string, string>,
    username: string
  ): Promise<any> {
    const args = ['-sS', '--compressed', '--max-time', '15', '-L']
    for (const [key, value] of Object.entries(headers)) {
      args.push('-H', `${key}: ${value}`)
    }
    args.push('-w', '\n__HTTP_STATUS__:%{http_code}', url)

    let stdout = ''
    try {
      const result = await execFile(CURL_BIN, args, {
        timeout: 17000,
        maxBuffer: 10 * 1024 * 1024,
      })
      stdout = result.stdout
    } catch {
      throw new Error('Falha de rede ao chamar o Instagram pelo scraper proprio.')
    }

    const marker = '\n__HTTP_STATUS__:'
    const markerIndex = stdout.lastIndexOf(marker)
    if (markerIndex === -1) {
      throw new Error('Resposta inesperada do Instagram pelo scraper proprio.')
    }

    const body = stdout.slice(0, markerIndex)
    const status = Number.parseInt(stdout.slice(markerIndex + marker.length).trim(), 10)
    if (!Number.isFinite(status) || status < 200 || status >= 300) {
      throw this.instagramHttpError(status || 0, body, username)
    }

    try {
      return JSON.parse(body)
    } catch {
      throw new Error(`Instagram publico retornou JSON invalido para @${username}.`)
    }
  }

  private instagramHttpError(status: number, body: string, username: string): Error {
    if (status === 404) {
      return new Error(`Perfil @${username} nao encontrado ou indisponivel publicamente.`)
    }
    if (status === 401 || status === 403) {
      return new Error('Instagram bloqueou a leitura publica deste perfil no momento.')
    }
    if (status === 429) {
      return new Error('Instagram limitou temporariamente as leituras publicas.')
    }
    return new Error(`Instagram publico erro ${status}: ${body.substring(0, 120)}`)
  }

  private parsePublicProfileItem(item: any): InstagramPost | null {
    const id = String(item?.id || '')
    const shortcode = String(item?.shortcode || '')
    if (!id || !shortcode) return null

    const imageUrl =
      item?.display_url ||
      item?.thumbnail_src ||
      item?.thumbnail_resources?.[item.thumbnail_resources.length - 1]?.src ||
      ''
    if (!imageUrl) return null

    const caption =
      item?.edge_media_to_caption?.edges?.[0]?.node?.text ||
      item?.accessibility_caption ||
      ''

    let timestamp = Number(item?.taken_at_timestamp || 0)
    const minTimestamp = 1577836800
    const maxTimestamp = 1893456000
    if (timestamp < minTimestamp || timestamp > maxTimestamp) {
      timestamp = Math.floor(Date.now() / 1000)
    }

    return {
      id,
      shortcode,
      thumbnailSrc: imageUrl,
      displayUrl: imageUrl,
      caption,
      takenAtTimestamp: timestamp,
      isVideo: item?.is_video === true || item?.__typename === 'GraphVideo',
      viewCount: Number(item?.video_view_count ?? item?.video_play_count ?? 0) || undefined,
    }
  }

  private async scrapeWithStableApi(
    username: string,
    apiKey: string,
    max: number
  ): Promise<InstagramPost[]> {
    const host = 'instagram-scraper-stable-api.p.rapidapi.com'
    const seenIds = new Set<string>()
    const allPosts: InstagramPost[] = []
    let token = ''
    const maxIterations = Math.ceil(max / 12) + 2
    let iteration = 0

    while (allPosts.length < max && iteration < maxIterations) {
      iteration++

      const body = new URLSearchParams({
        username_or_url: `https://www.instagram.com/${username}/`,
        amount: String(Math.min(max - allPosts.length + 2, 50)),
        pagination_token: token,
      })

      const response = await fetch(`https://${host}/get_ig_user_posts.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-rapidapi-host': host,
          'x-rapidapi-key': apiKey,
        },
        body: body.toString(),
      })

      if (response.status === 401 || response.status === 403) {
        throw new Error('API Key inválida ou sem assinatura desta API')
      }
      if (response.status === 429) {
        throw new Error('Limite de requisições da API atingido. Tente novamente mais tarde.')
      }
      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Stable API erro ${response.status}: ${text.substring(0, 120)}`)
      }

      const data: any = await response.json()
      const entries: any[] = Array.isArray(data?.posts) ? data.posts : []
      if (entries.length === 0) break

      for (const entry of entries) {
        if (allPosts.length >= max) break
        const node = entry?.node ?? entry
        const post = this.parseRapidapiItem(node)
        if (post && !seenIds.has(post.id)) {
          seenIds.add(post.id)
          allPosts.push(post)
        }
      }

      token = typeof data?.pagination_token === 'string' ? data.pagination_token : ''
      if (!token) break

      if (allPosts.length < max) {
        await new Promise((resolve) => setTimeout(resolve, 300))
      }
    }

    allPosts.sort((a, b) => b.takenAtTimestamp - a.takenAtTimestamp)
    return allPosts
  }

  /**
   * Busca posts via RapidAPI Instagram Scraper
   */
  private async scrapeWithRapidapi(
    username: string,
    apiKey: string,
    max: number
  ): Promise<InstagramPost[]> {
    const seenIds = new Set<string>()
    const allPosts: InstagramPost[] = []
    let cursor: string | null = null
    const maxIterations = Math.ceil(max / 12) + 2
    let iteration = 0

    while (allPosts.length < max && iteration < maxIterations) {
      iteration++

      const params = new URLSearchParams({
        username_or_id: username,
        count: '50',
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
            'X-RapidAPI-Host': 'instagram-public-bulk-scraper.p.rapidapi.com',
          },
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
        cursor =
          data?.data?.next_cursor ||
          data?.data?.end_cursor ||
          data?.next_cursor ||
          data?.end_cursor ||
          null

        const hasMore = data?.data?.more_available || data?.more_available || false

        if (!cursor && !hasMore) {
          console.log(`Instagram Scraper: Fim dos posts (sem cursor/more)`)
          break
        }

        // Delay entre requisições
        if (allPosts.length < max && cursor) {
          await new Promise((resolve) => setTimeout(resolve, 300))
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

    const isVideo =
      item.media_type === 2 || item.is_video === true || item.product_type === 'clips'

    const viewCount = Number(item.play_count ?? item.view_count ?? 0) || undefined

    return {
      id,
      shortcode,
      thumbnailSrc: imageUrl,
      displayUrl: imageUrl,
      caption,
      takenAtTimestamp: timestamp,
      isVideo,
      viewCount,
    }
  }

  /**
   * Busca SOMENTE os reels (vídeos) do perfil via "Instagram Scraper Stable API".
   * Endpoint: POST get_ig_user_reels.php → { reels: [{ node }], pagination_token }
   */
  async getReelsFromProfile(profileUrl: string, limit = 12): Promise<InstagramPost[]> {
    if (!this.validateProfileUrl(profileUrl)) {
      throw new Error('URL do perfil inválida.')
    }
    const username = this.extractUsername(profileUrl)
    this.lastError = ''

    const provider = await this.getProvider()
    let publicError: Error | null = null
    if (provider === 'auto' || provider === 'public') {
      try {
        const videos = (await this.scrapeWithPublicProfile(username, limit * 3))
          .filter((post) => post.isVideo)
          .slice(0, limit)
        if (videos.length > 0) {
          console.log(`Instagram Scraper (publico videos): ${videos.length} itens`)
          return videos
        }
        throw new Error('Perfil publico nao retornou videos/reels recentes.')
      } catch (error: any) {
        publicError = error
        this.lastError = error.message
        console.error(`Instagram Scraper (publico videos) falhou: ${error.message}`)
        if (provider === 'public') throw error
      }
    }

    const apiKey = await InstagramSetting.get('rapidapi_key')
    if (!apiKey) {
      if (publicError) throw publicError
      throw new Error('RapidAPI Key não configurada. Configure nas configurações.')
    }
    const host = 'instagram-scraper-stable-api.p.rapidapi.com'
    const seenIds = new Set<string>()
    const allReels: InstagramPost[] = []
    let token = ''
    const maxIterations = Math.ceil(limit / 12) + 2
    let iteration = 0

    while (allReels.length < limit && iteration < maxIterations) {
      iteration++

      const body = new URLSearchParams({
        username_or_url: `https://www.instagram.com/${username}/`,
        amount: String(Math.min(limit - allReels.length + 2, 50)),
        pagination_token: token,
      })

      const response = await fetch(`https://${host}/get_ig_user_reels.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-rapidapi-host': host,
          'x-rapidapi-key': apiKey,
        },
        body: body.toString(),
      })

      if (response.status === 401 || response.status === 403) {
        throw new Error('API Key inválida ou sem assinatura desta API')
      }
      if (response.status === 429) {
        throw new Error('Limite de requisições da API atingido. Tente novamente mais tarde.')
      }
      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Stable API (reels) erro ${response.status}: ${text.substring(0, 120)}`)
      }

      const data: any = await response.json()
      const entries: any[] = Array.isArray(data?.reels) ? data.reels : []
      if (entries.length === 0) break

      for (const entry of entries) {
        if (allReels.length >= limit) break
        // No endpoint de reels o conteúdo vem em node.media (sem taken_at/caption).
        const node = entry?.node?.media ?? entry?.node ?? entry
        const post = this.parseRapidapiItem(node)
        if (post && !seenIds.has(post.id)) {
          post.isVideo = true
          // Reels deste endpoint não trazem data — não fabricar.
          if (!node?.taken_at && !node?.taken_at_timestamp) post.takenAtTimestamp = 0
          seenIds.add(post.id)
          allReels.push(post)
        }
      }

      token = typeof data?.pagination_token === 'string' ? data.pagination_token : ''
      if (!token) break
      if (allReels.length < limit) {
        await new Promise((resolve) => setTimeout(resolve, 300))
      }
    }

    // A API já devolve em ordem de recência; não reordenar (datas podem faltar).
    return allReels
  }

  /**
   * Foto de perfil + metadados basicos. Tenta primeiro o JSON publico do proprio
   * Instagram; RapidAPI e apenas fallback explicito/legado.
   */
  async getProfileInfo(profileUrl: string): Promise<InstagramProfileInfo | null> {
    if (!this.validateProfileUrl(profileUrl)) {
      throw new Error('URL do perfil inválida.')
    }

    const username = this.extractUsername(profileUrl)
    this.lastError = ''
    const provider = await this.getProvider()

    if (provider === 'auto' || provider === 'public') {
      try {
        const info = this.parseProfileInfoFromPublic(await this.fetchPublicProfile(username), username)
        if (info) return info
      } catch (error: any) {
        this.lastError = error.message
        console.error(`Instagram Scraper (publico perfil) falhou: ${error.message}`)
        if (provider === 'public') return null
      }
    }

    const apiKey = await InstagramSetting.get('rapidapi_key')
    if (!apiKey) {
      return null
    }

    const stableEndpoints = ['get_ig_user_about.php', 'get_ig_user_data.php']
    for (const endpoint of stableEndpoints) {
      try {
        const info = await this.scrapeProfileWithStableApi(username, apiKey, endpoint)
        if (info) return info
      } catch (error: any) {
        this.lastError = error.message
        console.error(`Instagram Scraper (Stable ${endpoint}) perfil falhou: ${error.message}`)
      }
    }

    try {
      const info = await this.scrapeProfileWithBulkApi(username, apiKey)
      if (info) return info
    } catch (error: any) {
      this.lastError = error.message
      console.error(`Instagram Scraper (Bulk perfil) falhou: ${error.message}`)
    }

    return null
  }

  private parseProfileInfoFromPublic(data: any, username: string): InstagramProfileInfo | null {
    const user = data?.data?.user
    const profilePicUrl = user?.profile_pic_url_hd || user?.profile_pic_url || ''
    if (!profilePicUrl) return null
    return {
      username: String(user?.username || username),
      fullName: String(user?.full_name || user?.fullName || username),
      profilePicUrl,
    }
  }

  private async scrapeProfileWithStableApi(
    username: string,
    apiKey: string,
    endpoint: string
  ): Promise<InstagramProfileInfo | null> {
    const host = 'instagram-scraper-stable-api.p.rapidapi.com'
    const body = new URLSearchParams({
      username_or_url: `https://www.instagram.com/${username}/`,
    })

    const response = await fetch(`https://${host}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-rapidapi-host': host,
        'x-rapidapi-key': apiKey,
      },
      body: body.toString(),
    })

    if (response.status === 401 || response.status === 403) {
      throw new Error('API Key inválida ou sem assinatura desta API')
    }
    if (response.status === 429) {
      throw new Error('Limite de requisições da API atingido. Tente novamente mais tarde.')
    }
    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Stable API perfil erro ${response.status}: ${text.substring(0, 120)}`)
    }

    const data: any = await response.json()
    const pic = this.extractProfilePicUrl(data)
    if (!pic) return null

    return {
      username: this.extractProfileField(data, ['username', 'user_name']) || username,
      fullName: this.extractProfileField(data, ['full_name', 'fullName', 'name']) || username,
      profilePicUrl: pic,
    }
  }

  private async scrapeProfileWithBulkApi(
    username: string,
    apiKey: string
  ): Promise<InstagramProfileInfo | null> {
    const paths = [
      `v2/user_info?username_or_id=${encodeURIComponent(username)}`,
      `v1/user_info?username_or_id=${encodeURIComponent(username)}`,
      `v2/user?username=${encodeURIComponent(username)}`,
    ]

    for (const path of paths) {
      const url = `https://instagram-public-bulk-scraper.p.rapidapi.com/${path}`
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
        throw new Error('Limite de requisições da API atingido. Tente novamente mais tarde.')
      }
      if (!response.ok) continue

      const data: any = await response.json()
      const pic = this.extractProfilePicUrl(data)
      if (!pic) continue

      return {
        username: this.extractProfileField(data, ['username', 'user_name']) || username,
        fullName: this.extractProfileField(data, ['full_name', 'fullName', 'name']) || username,
        profilePicUrl: pic,
      }
    }

    return null
  }

  /** Percorre o JSON da API em busca de URL de avatar (HD preferido). */
  private extractProfilePicUrl(data: unknown): string | null {
    const preferredKeys = [
      'profile_pic_url_hd',
      'hd_profile_pic_url',
      'hd_profile_pic',
      'profile_pic_url',
      'profilePicUrl',
      'profile_pic',
    ]

    const walk = (node: unknown, depth = 0): string | null => {
      if (!node || depth > 10) return null

      if (typeof node === 'string') {
        const value = node.trim()
        if (
          value.startsWith('http') &&
          (value.includes('cdninstagram') ||
            value.includes('fbcdn.net') ||
            value.includes('instagram.'))
        ) {
          return value
        }
        return null
      }

      if (Array.isArray(node)) {
        for (const item of node) {
          const found = walk(item, depth + 1)
          if (found) return found
        }
        return null
      }

      if (typeof node === 'object') {
        const record = node as Record<string, unknown>
        for (const key of preferredKeys) {
          const value = record[key]
          if (typeof value === 'string' && value.startsWith('http')) return value
        }
        for (const value of Object.values(record)) {
          const found = walk(value, depth + 1)
          if (found) return found
        }
      }

      return null
    }

    return walk(data)
  }

  private extractProfileField(data: unknown, keys: string[]): string {
    const walk = (node: unknown, depth = 0): string => {
      if (!node || depth > 8 || typeof node !== 'object') return ''
      const record = node as Record<string, unknown>
      for (const key of keys) {
        const value = record[key]
        if (typeof value === 'string' && value.trim()) return value.trim()
      }
      for (const value of Object.values(record)) {
        if (value && typeof value === 'object') {
          const found = walk(value, depth + 1)
          if (found) return found
        }
      }
      return ''
    }
    return walk(data)
  }

  private async getProvider(): Promise<ScraperProvider> {
    const raw = (await InstagramSetting.get('instagram_scraper_provider', 'public')) || 'public'
    return raw === 'public' || raw === 'rapidapi' ? raw : 'auto'
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
