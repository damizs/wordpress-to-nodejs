import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export interface BackupProviderStatus {
  target: string
  status: 'ok' | 'failed' | 'skipped'
  message?: string
}

const jsonColumn = {
  prepare: (value: unknown) => (value == null ? null : JSON.stringify(value)),
  consume: (value: unknown) => {
    if (typeof value !== 'string') return value
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  },
}

export default class BackupRun extends BaseModel {
  static table = 'backup_runs'

  @column({ isPrimary: true }) declare id: number
  @column() declare status: 'running' | 'success' | 'partial' | 'failed'
  @column() declare trigger: 'manual' | 'scheduled' | 'cli'
  @column.dateTime() declare startedAt: DateTime | null
  @column.dateTime() declare finishedAt: DateTime | null
  @column() declare localPath: string | null
  @column() declare databasePath: string | null
  @column() declare uploadsPath: string | null
  @column({ consume: (value: unknown) => Number(value ?? 0) }) declare sizeBytes: number
  @column(jsonColumn) declare providers: BackupProviderStatus[] | null
  @column() declare logs: string | null
  @column() declare error: string | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
