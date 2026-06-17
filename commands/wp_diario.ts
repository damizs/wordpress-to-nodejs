import { BaseCommand, flags } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { importWpDiarioOficial } from '#services/wp_diario_importer'

export default class WpDiario extends BaseCommand {
  static commandName = 'wp:diario'
  static description =
    'Importa o Diário Oficial sincronizado pelo plugin diario-oficial-sync do WordPress'
  static options: CommandOptions = { startApp: true }

  @flags.boolean({ description: 'Simula a importação sem gravar no banco' })
  declare dryRun: boolean

  async run() {
    const result = await importWpDiarioOficial({ logger: this.logger, dryRun: this.dryRun })
    if (result.skippedFile) {
      this.logger.info('Nada a importar (wp_diario_oficial.json ausente).')
      return
    }

    if (this.dryRun) {
      this.logger.info(`Simulação: ${result.records} registro(s) prontos para importar.`)
      return
    }

    this.logger.success(
      `OK: ${result.created} novo(s), ${result.updated} atualizado(s), ${result.skipped} ignorado(s)`
    )
  }
}
