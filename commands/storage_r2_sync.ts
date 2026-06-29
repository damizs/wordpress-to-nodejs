import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'
import StorageSyncService from '#services/storage_sync_service'

export default class StorageR2SyncCommand extends BaseCommand {
  static commandName = 'storage:sync'
  static description = 'Espelha uploads/public no R2 ou outro alvo rclone configurado'
  static options: CommandOptions = { startApp: true }

  async run() {
    const runs = await StorageSyncService.run({ trigger: 'cli' })
    const failed = runs.filter((run) => run.status === 'failed')

    if (failed.length === 0) {
      this.logger.success(`Sync concluido em ${runs.length} alvo(s).`)
      return
    }

    for (const run of failed) {
      this.logger.error(`Sync falhou em ${run.target || 'alvo nao configurado'}: ${run.error}`)
    }
    this.exitCode = 1
  }
}
