import type { HttpContext } from '@adonisjs/core/http'
import InstagramSetting from '#models/instagram_setting'
import InstagramFeedService from '#services/instagram_feed_service'

export default class VideosController {
  async index({ inertia }: HttpContext) {
    let reels: Awaited<ReturnType<typeof InstagramFeedService.getCachedReels>>['items'] = []
    let instagramProfileUrl: string | null = null
    try {
      instagramProfileUrl = await InstagramSetting.get('instagram_profile_url')
      const cached = await InstagramFeedService.getCachedReels()
      reels = cached.items
      // Atualiza em 2º plano se estiver velho/vazio, sem bloquear a página.
      if (instagramProfileUrl && (await InstagramFeedService.isReelsStale())) {
        InstagramFeedService.refreshReels().catch((err) =>
          console.log('Instagram reels refresh falhou:', err?.message)
        )
      }
    } catch (e: any) {
      console.log('Vídeos indisponíveis:', e.message)
    }

    return inertia.render('public/videos/index', {
      reels,
      instagramUrl: instagramProfileUrl,
    })
  }
}
