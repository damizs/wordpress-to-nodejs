import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import BackupService from '#services/backup_service'

export default class BackupRunCommand extends BaseCommand {
  static commandName = 'backup:run'
  static description = 'Gera backup local do banco/site e envia para alvos rclone configurados'
  static options: CommandOptions = { startApp: true }

  async run() {
    const backup = await BackupService.run({ trigger: 'cli' })
    if (backup.status === 'success') {
      this.logger.success(`Backup concluido: ${backup.localPath}`)
      return
    }

    if (backup.status === 'partial') {
      this.logger.warning(`Backup parcial: ${backup.localPath}`)
      this.exitCode = 1
      return
    }

    this.logger.error(`Backup falhou: ${backup.error || 'erro desconhecido'}`)
    this.exitCode = 1
  }
}
