import { BaseCommand, flags } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class InstagramFeed extends BaseCommand {
  static commandName = 'instagram:feed'
  static description =
    'Atualiza o feed ao vivo do Instagram exibido na home (scraper público, sem senha)'
  static options: CommandOptions = { startApp: true }

  @flags.number({ description: 'Quantidade de posts a buscar (padrão 12)' })
  declare limit: number

  async run() {
    const { default: InstagramFeedService } = await import('#services/instagram_feed_service')
    const limit = this.limit || 12
    try {
      const count = await InstagramFeedService.refresh(limit)
      this.logger.success(`Feed do Instagram atualizado: ${count} publicação(ões).`)
    } catch (error: any) {
      this.logger.error(`Falha ao atualizar feed: ${error.message}`)
      this.exitCode = 1
    }
    try {
      const reels = await InstagramFeedService.refreshReels(limit)
      this.logger.success(`Galeria de reels atualizada: ${reels} vídeo(s).`)
    } catch (error: any) {
      this.logger.error(`Falha ao atualizar reels: ${error.message}`)
      this.exitCode = 1
    }
  }
}
