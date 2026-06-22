import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { importWpQuickLinks } from '#services/wp_quick_links_importer'

export default class WpQuickLinks extends BaseCommand {
  static commandName = 'wp:quick-links'
  static description = 'Importa links rapidos do WordPress a partir de wp_quick_links.json'
  static options: CommandOptions = { startApp: true }

  async run() {
    const result = await importWpQuickLinks({ logger: this.logger })
    if (result.skippedFile) {
      this.logger.info('Nada a importar (wp_quick_links.json ausente).')
      return
    }

    this.logger.success(
      `OK: ${result.imported} novo(s), ${result.updated} atualizado(s), ${result.skipped} ignorado(s)`
    )
  }
}
