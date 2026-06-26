/**
 * Instagram Feed Service
 *
 * Mantém um "feed ao vivo" do Instagram para a seção "Siga-nos" da home,
 * SEM precisar de senha/login da câmara: usa o scraper público (RapidAPI).
 *
 * Estratégia de robustez:
 * - As URLs de imagem do CDN do Instagram expiram e bloqueiam hotlink, então
 *   ao atualizar o feed baixamos as miniaturas para public/uploads/instagram-feed/.
 * - O resultado fica em cache (InstagramSetting `feed_cache` + `feed_cached_at`),
 *   para a home não chamar a API a cada acesso.
 */

import { DateTime } from 'luxon'
import { createWriteStream } from 'node:fs'
import { mkdir, readdir, unlink } from 'node:fs/promises'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import path from 'node:path'
import app from '@adonisjs/core/services/app'
import InstagramSetting from '#models/instagram_setting'
import InstagramScraperService from './instagram_scraper_service.js'

export interface InstagramFeedItem {
  id: string
  shortcode: string
  image: string
  caption: string
  title: string
  date: string
  takenAt: number
  isVideo: boolean
  instagramUrl: string
}

export interface InstagramReelItem {
  id: string
  shortcode: string
  image: string
  caption: string
  title: string
  date: string
  takenAt: number
  viewCount: number
  reelUrl: string
}

const FEED_DIR_REL = 'uploads/instagram-feed'
const CACHE_KEY = 'feed_cache'
const CACHE_AT_KEY = 'feed_cached_at'

const REELS_DIR_REL = 'uploads/instagram-reels'
const REELS_CACHE_KEY = 'reels_cache'
const REELS_CACHE_AT_KEY = 'reels_cached_at'

const PROFILE_PIC_KEY = 'profile_pic_url'
const PROFILE_PIC_AT_KEY = 'profile_pic_cached_at'
const PROFILE_FILE = 'profile.jpg'

export default class InstagramFeedService {
  /**
   * TTL padrão do cache (horas) antes de considerar o feed "velho".
   * 24h = no máximo uma atualização por dia disparada por tráfego; o
   * InstagramSchedulerService garante o refresh diário no horário configurado.
   */
  static STALE_HOURS = 24

  /** Retorna o feed em cache (ou null se inexistente/ inválido). */
  static async getCached(): Promise<{ items: InstagramFeedItem[]; cachedAt: DateTime | null }> {
    const raw = await InstagramSetting.get(CACHE_KEY)
    const at = await InstagramSetting.get(CACHE_AT_KEY)
    let items: InstagramFeedItem[] = []
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) items = parsed
      } catch {
        items = []
      }
    }
    const cachedAt = at ? DateTime.fromISO(at) : null
    return { items, cachedAt }
  }

  /** URL local da foto de perfil cacheada (ou null). */
  static async getCachedProfilePic(): Promise<string | null> {
    const url = await InstagramSetting.get(PROFILE_PIC_KEY)
    return url?.trim() || null
  }

  /**
   * Busca avatar do perfil na API, baixa para disco e persiste no banco.
   * Falhas não apagam o cache anterior.
   */
  static async refreshProfilePic(): Promise<string | null> {
    const profileUrl = await InstagramSetting.get('instagram_profile_url')
    if (!profileUrl) return null

    const scraper = new InstagramScraperService()
    const info = await scraper.getProfileInfo(profileUrl)
    if (!info?.profilePicUrl) {
      throw new Error(scraper.getLastError() || 'Foto de perfil não retornada pelo scraper')
    }

    const dirAbs = app.makePath('public', FEED_DIR_REL)
    await mkdir(dirAbs, { recursive: true })
    const destPath = path.join(dirAbs, PROFILE_FILE)

    try {
      await this.downloadImage(info.profilePicUrl, destPath)
    } catch {
      return null
    }

    const localUrl = `/${FEED_DIR_REL}/${PROFILE_FILE}`
    await InstagramSetting.set(PROFILE_PIC_KEY, localUrl)
    await InstagramSetting.set(PROFILE_PIC_AT_KEY, DateTime.now().toISO())
    return localUrl
  }

  /** Avatar: cache vazio ou mais velho que o TTL. */
  static async isProfilePicStale(): Promise<boolean> {
    const url = await this.getCachedProfilePic()
    const at = await InstagramSetting.get(PROFILE_PIC_AT_KEY)
    if (!url || !at) return true
    const cachedAt = DateTime.fromISO(at)
    if (!cachedAt.isValid) return true
    return cachedAt.diffNow('hours').hours < -this.STALE_HOURS
  }

  /** Indica se o cache está vazio ou mais velho que o TTL. */
  static async isStale(): Promise<boolean> {
    const { items, cachedAt } = await this.getCached()
    if (items.length === 0 || !cachedAt) return true
    return cachedAt.diffNow('hours').hours < -this.STALE_HOURS
  }

  /**
   * Atualiza o feed: busca posts, baixa miniaturas e grava o cache.
   * Retorna a quantidade de itens armazenados.
   */
  static async refresh(limit = 12): Promise<number> {
    const profileUrl = await InstagramSetting.get('instagram_profile_url')
    if (!profileUrl) {
      throw new Error('URL do perfil do Instagram não configurada')
    }

    const scraper = new InstagramScraperService()
    await this.refreshProfilePic().catch((err) =>
      console.log('Instagram profile pic refresh falhou:', err?.message)
    )

    const posts = await scraper.getPostsFromProfile(profileUrl, limit)
    if (posts.length === 0) {
      throw new Error(scraper.getLastError() || 'Nenhum post retornado pelo scraper')
    }

    const dirAbs = app.makePath('public', FEED_DIR_REL)
    await mkdir(dirAbs, { recursive: true })

    const items: InstagramFeedItem[] = []
    const keepFiles = new Set<string>()

    for (const post of posts.slice(0, limit)) {
      const shortcode = post.shortcode || ''
      const instagramUrl = shortcode
        ? `https://www.instagram.com/p/${shortcode}/`
        : profileUrl

      const fileName = `${post.id}.jpg`
      let image = ''
      try {
        await this.downloadImage(post.displayUrl || post.thumbnailSrc, path.join(dirAbs, fileName))
        image = `/${FEED_DIR_REL}/${fileName}`
        keepFiles.add(fileName)
      } catch {
        continue
      }

      const caption = (post.caption || '').trim()
      const firstLine = caption.split('\n').find((l) => l.trim().length > 0)?.trim() || ''
      const title = firstLine
        ? firstLine.length > 90
          ? firstLine.slice(0, 87) + '...'
          : firstLine
        : 'Publicação no Instagram'

      items.push({
        id: post.id,
        shortcode,
        image,
        caption,
        title,
        date: DateTime.fromSeconds(post.takenAtTimestamp).toFormat('dd/MM/yyyy'),
        takenAt: post.takenAtTimestamp,
        isVideo: post.isVideo,
        instagramUrl,
      })
    }

    await this.pruneOldImages(dirAbs, keepFiles)

    await InstagramSetting.set(CACHE_KEY, JSON.stringify(items))
    await InstagramSetting.set(CACHE_AT_KEY, DateTime.now().toISO())

    return items.length
  }

  /** Retorna os reels em cache (ou lista vazia). */
  static async getCachedReels(): Promise<{ items: InstagramReelItem[]; cachedAt: DateTime | null }> {
    const raw = await InstagramSetting.get(REELS_CACHE_KEY)
    const at = await InstagramSetting.get(REELS_CACHE_AT_KEY)
    let items: InstagramReelItem[] = []
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) items = parsed
      } catch {
        items = []
      }
    }
    return { items, cachedAt: at ? DateTime.fromISO(at) : null }
  }

  /** Reels: cache vazio ou mais velho que o TTL. */
  static async isReelsStale(): Promise<boolean> {
    const { items, cachedAt } = await this.getCachedReels()
    if (items.length === 0 || !cachedAt) return true
    return cachedAt.diffNow('hours').hours < -this.STALE_HOURS
  }

  /** Atualiza a galeria de reels (vídeos): busca, baixa capas e grava o cache. */
  static async refreshReels(limit = 12): Promise<number> {
    const profileUrl = await InstagramSetting.get('instagram_profile_url')
    if (!profileUrl) {
      throw new Error('URL do perfil do Instagram não configurada')
    }

    const scraper = new InstagramScraperService()
    const reels = await scraper.getReelsFromProfile(profileUrl, limit)
    if (reels.length === 0) {
      throw new Error(scraper.getLastError() || 'Nenhum reel retornado pelo scraper')
    }

    const dirAbs = app.makePath('public', REELS_DIR_REL)
    await mkdir(dirAbs, { recursive: true })

    const items: InstagramReelItem[] = []
    const keepFiles = new Set<string>()

    for (const reel of reels.slice(0, limit)) {
      const shortcode = reel.shortcode || ''
      const reelUrl = shortcode
        ? `https://www.instagram.com/reel/${shortcode}/`
        : profileUrl

      const fileName = `${reel.id}.jpg`
      let image = ''
      try {
        await this.downloadImage(reel.displayUrl || reel.thumbnailSrc, path.join(dirAbs, fileName))
        image = `/${REELS_DIR_REL}/${fileName}`
        keepFiles.add(fileName)
      } catch {
        continue
      }

      const caption = (reel.caption || '').trim()
      const firstLine = caption.split('\n').find((l) => l.trim().length > 0)?.trim() || ''
      const title = firstLine
        ? firstLine.length > 90
          ? firstLine.slice(0, 87) + '...'
          : firstLine
        : 'Reel no Instagram'

      items.push({
        id: reel.id,
        shortcode,
        image,
        caption,
        title,
        date:
          reel.takenAtTimestamp > 0
            ? DateTime.fromSeconds(reel.takenAtTimestamp).toFormat('dd/MM/yyyy')
            : '',
        takenAt: reel.takenAtTimestamp,
        viewCount: reel.viewCount || 0,
        reelUrl,
      })
    }

    await this.pruneOldImages(dirAbs, keepFiles)

    await InstagramSetting.set(REELS_CACHE_KEY, JSON.stringify(items))
    await InstagramSetting.set(REELS_CACHE_AT_KEY, DateTime.now().toISO())

    return items.length
  }

  /** Baixa uma imagem do CDN do Instagram com headers que evitam bloqueio. */
  private static async downloadImage(url: string, destPath: string): Promise<void> {
    if (!url) throw new Error('URL de imagem vazia')
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://www.instagram.com/',
      },
    })
    if (!res.ok || !res.body) {
      throw new Error(`Falha ao baixar imagem (${res.status})`)
    }
    await pipeline(Readable.fromWeb(res.body as any), createWriteStream(destPath))
  }

  /** Remove imagens locais que não fazem mais parte do feed atual. */
  private static async pruneOldImages(dirAbs: string, keep: Set<string>): Promise<void> {
    try {
      const files = await readdir(dirAbs)
      await Promise.all(
        files
          .filter((f) => f.endsWith('.jpg') && f !== PROFILE_FILE && !keep.has(f))
          .map((f) => unlink(path.join(dirAbs, f)).catch(() => {}))
      )
    } catch {
      // diretório pode não existir ainda — ignora
    }
  }
}
