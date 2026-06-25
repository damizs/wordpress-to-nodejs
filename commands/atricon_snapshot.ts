import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Grava o snapshot diário do índice ATRICON/PNTP (idempotente: no máximo 1 por dia).
 * Agende este comando uma vez ao dia — a página do Radar passou a apenas LER a série,
 * sem gravar durante o GET.
 */
export default class AtriconSnapshotCommand extends BaseCommand {
  static commandName = 'atricon:snapshot'
  static description = 'Grava o snapshot diário do índice ATRICON/PNTP (idempotente)'
  static options: CommandOptions = { startApp: true }

  async run() {
    const { recordAtriconSnapshot } = await import('#controllers/admin/atricon_controller')
    const { created, index, level } = await recordAtriconSnapshot()
    if (created) {
      this.logger.success(`Snapshot gravado: índice ${index}% (selo ${level}).`)
    } else {
      this.logger.info(`Snapshot de hoje já existe — índice atual ${index}% (selo ${level}).`)
    }
  }
}
