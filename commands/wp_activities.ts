import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { importActivitiesWithAuthors } from '#services/wp_activities_importer'

/**
 * Importa apenas as Atividades Legislativas + AUTORIA dos vereadores a partir de
 * `database/wp_activities.json`. Comando LEVE (sem reimportar o acervo inteiro
 * nem baixar assets), pensado para rodar automaticamente no deploy via
 * `startup.sh`. Idempotente.
 */
export default class WpActivities extends BaseCommand {
  static commandName = 'wp:activities'
  static description = 'Importa atividades legislativas + autoria (fonte: wp_activities.json)'
  static options: CommandOptions = { startApp: true }

  async run() {
    const res = await importActivitiesWithAuthors({ logger: this.logger })
    if (res.skipped) {
      this.logger.info('Nada a importar (wp_activities.json ausente).')
      return
    }
    this.logger.success(
      `OK: ${res.ok} atividades, ${res.links} vínculos de autoria` +
        (res.unmatched.length ? ` (${res.unmatched.length} autores sem match)` : '')
    )
  }
}
