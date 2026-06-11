import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Padroniza as fotos já cadastradas dos vereadores: corte 3:4 (600x800)
 * com foco inteligente + conversão para WebP. Idempotente: fotos que já
 * estão no padrão são ignoradas.
 *
 *   node ace photos:normalize
 */
export default class NormalizeCouncilorPhotos extends BaseCommand {
  static commandName = 'photos:normalize'
  static description = 'Padroniza as fotos dos vereadores (600x800 WebP)'
  static options: CommandOptions = { startApp: true }

  async run() {
    const { default: Councilor } = await import('#models/councilor')
    const { processCouncilorPhoto, COUNCILOR_PHOTO_WIDTH, COUNCILOR_PHOTO_HEIGHT } = await import(
      '#helpers/councilor_photo'
    )
    const { default: app } = await import('@adonisjs/core/services/app')
    const { default: sharp } = await import('sharp')
    const { join } = await import('node:path')
    const { existsSync } = await import('node:fs')

    const councilors = await Councilor.query().whereNotNull('photo_url')
    let processed = 0
    let skipped = 0

    for (const councilor of councilors) {
      const url = councilor.photoUrl
      if (!url || !url.startsWith('/uploads/')) {
        skipped++
        continue
      }

      const absolutePath = join(app.publicPath(), url.replace(/^\//, ''))
      if (!existsSync(absolutePath)) {
        this.logger.warning(`${councilor.name}: arquivo não encontrado (${url})`)
        skipped++
        continue
      }

      try {
        const meta = await sharp(absolutePath).metadata()
        if (
          meta.format === 'webp' &&
          meta.width === COUNCILOR_PHOTO_WIDTH &&
          meta.height === COUNCILOR_PHOTO_HEIGHT
        ) {
          skipped++
          continue
        }

        councilor.photoUrl = await processCouncilorPhoto(absolutePath)
        await councilor.save()
        processed++
        this.logger.info(`${councilor.name} → ${councilor.photoUrl}`)
      } catch (error) {
        this.logger.error(`${councilor.name}: falha ao processar (${error.message})`)
      }
    }

    this.logger.success(`${processed} foto(s) padronizada(s), ${skipped} já no padrão/ignorada(s).`)
  }
}
