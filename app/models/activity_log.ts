import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ActivityLog extends BaseModel {
  static table = 'activity_logs'

  @column({ isPrimary: true }) declare id: number
  @column() declare userId: number | null
  @column() declare action: string
  @column() declare resource: string
  @column() declare resourceId: string | null
  @column() declare method: string | null
  @column() declare path: string | null
  @column() declare ip: string | null
  @column() declare userAgent: string | null
  @column() declare statusCode: number | null
  @column() declare message: string | null
  @column() declare metadata: Record<string, unknown> | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
}
