import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { importWpLegacyContent } from '#services/wp_legacy_content_importer'

export default class WpLegacyContent extends BaseCommand {
  static commandName = 'wp:legacy-content'
  static description = 'Importa posts, paginas e referencias de upload do acervo WordPress completo'
  static options: CommandOptions = { startApp: true }

  @flags.boolean({ description: 'Simula a importacao sem gravar no banco' })
  declare dryRun: boolean

  async run() {
    const result = await importWpLegacyContent({ logger: this.logger, dryRun: this.dryRun })
    if (result.skippedFile) {
      this.logger.info('Nada a importar (database/wp_legacy_content.json ausente).')
      return
    }

    if (this.dryRun) {
      this.logger.info(
        `Simulacao: ${result.posts} posts, ${result.pages} paginas, ${result.uploadReferences} arquivo(s) referenciado(s).`
      )
      return
    }

    this.logger.success(
      `OK: ${result.newsCreated} noticia(s) criada(s), ${result.newsUpdated} atualizada(s), ${result.pagesPublic} pagina(s) publica(s), ${result.pagesLegacy} legado(s).`
    )
  }
}
