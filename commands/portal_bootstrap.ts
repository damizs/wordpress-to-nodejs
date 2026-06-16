import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { runPortalBootstrap } from '#services/portal_bootstrap_service'

export default class PortalBootstrap extends BaseCommand {
  static commandName = 'portal:bootstrap'
  static description =
    'Aplica links externos de transparência, E-SIC, ouvidoria, menus e critérios ATRICON externos'
  static options: CommandOptions = { startApp: true }

  async run() {
    const res = await runPortalBootstrap({ logger: this.logger })
    if (res.skipped) {
      this.logger.info('Nada a fazer.')
      return
    }
    this.logger.success('Bootstrap concluído.')
  }
}
