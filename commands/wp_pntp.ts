import { BaseCommand, flags } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import { importPntpRecords } from '#services/wp_pntp_importer'

export default class WpPntp extends BaseCommand {
  static commandName = 'wp:pntp'
  static description =
    'Importa os Registros de Informação (PNTP) do WordPress e baixa os PDFs (fonte: wp_pntp.json)'
  static options: CommandOptions = { startApp: true }

  @flags.boolean({ description: 'Não baixar os PDFs (apenas registros + link remoto)' })
  declare skipDownload: boolean

  async run() {
    const res = await importPntpRecords({ logger: this.logger, skipDownload: this.skipDownload })
    if (res.skipped) {
      this.logger.info('Nada a importar (wp_pntp.json ausente).')
      return
    }
    this.logger.success(
      `OK: ${res.records} registro(s), ${res.files} arquivo(s) baixado(s), ${res.categories} categoria(s) nova(s)`
    )
  }
}
