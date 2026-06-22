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

export default class SecurityEvent extends BaseModel {
  static table = 'security_events'

  @column({ isPrimary: true }) declare id: number
  @column() declare level: 'info' | 'warning' | 'danger'
  @column() declare type: string
  @column() declare action: 'observe' | 'block' | 'allow'
  @column() declare ip: string | null
  @column() declare method: string | null
  @column() declare path: string | null
  @column() declare userAgent: string | null
  @column() declare message: string | null
  @column(jsonColumn) declare metadata: Record<string, unknown> | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
}
