import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

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

export default class NotificationLog extends BaseModel {
  static table = 'notification_logs'

  @column({ isPrimary: true }) declare id: number
  @column() declare channel: 'evolution'
  @column() declare type: 'report' | 'test' | 'login' | 'firewall' | 'backup' | 'health'
  @column() declare status: 'pending' | 'success' | 'failed' | 'skipped'
  @column() declare recipient: string | null
  @column() declare dedupeKey: string | null
  @column() declare message: string | null
  @column() declare error: string | null
  @column(jsonColumn) declare metadata: Record<string, unknown> | null
  @column.dateTime() declare sentAt: DateTime | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
