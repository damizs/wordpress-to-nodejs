import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class TrashEntry extends BaseModel {
  static table = 'trash_entries'

  @column({ isPrimary: true }) declare id: number
  @column() declare tableName: string
  @column() declare recordId: string
  @column() declare displayName: string | null
  @column() declare data: Record<string, unknown>
  @column() declare deletedByUserId: number | null
  @column.dateTime() declare deletedAt: DateTime
  @column() declare restoredByUserId: number | null
  @column.dateTime() declare restoredAt: DateTime | null
  @column() declare metadata: Record<string, unknown> | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
