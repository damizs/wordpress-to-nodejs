import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import EvolutionAlertService from '#services/evolution_alert_service'

export default class EvolutionAlertsCommand extends BaseCommand {
  static commandName = 'evolution:alerts'
  static description = 'Executa verificacoes e envia relatorios agendados pela Evolution API'
  static options: CommandOptions = { startApp: true }

  async run() {
    const { connection, report } = await EvolutionAlertService.runScheduledChecks()

    if (connection.state === 'disabled') {
      this.logger.info('Evolution desativada.')
    } else if (connection.ok) {
      this.logger.success(`Evolution conectada: ${connection.state}`)
    } else {
      this.logger.warning(
        `Evolution sem conexao: ${connection.error || connection.state || 'estado desconhecido'}`
      )
    }

    if (report.failed > 0) {
      this.logger.error(report.message)
      this.exitCode = 1
      return
    }

    if (report.success > 0) {
      this.logger.success(report.message)
      return
    }

    this.logger.info(report.message)
  }
}
