import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class StorageSyncRun extends BaseModel {
  static table = 'storage_sync_runs'

  @column({ isPrimary: true }) declare id: number
  @column() declare status: 'running' | 'success' | 'partial' | 'failed'
  @column() declare trigger: 'manual' | 'scheduled' | 'cli'
  @column() declare localPath: string
  @column() declare target: string
  @column.dateTime() declare startedAt: DateTime
  @column.dateTime() declare finishedAt: DateTime | null
  @column() declare filesScanned: number | null
  @column() declare filesSynced: number | null
  @column() declare bytesSynced: number | null
  @column() declare logs: string | null
  @column() declare error: string | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
