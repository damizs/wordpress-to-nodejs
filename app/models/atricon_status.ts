import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import type { AtriconStatusValue } from '#helpers/atricon_matrix'

export default class AtriconStatus extends BaseModel {
  static table = 'atricon_statuses'
  @column({ isPrimary: true }) declare id: number
  @column() declare criterionCode: string
  @column() declare status: AtriconStatusValue
  @column() declare evidenceUrl: string | null
  @column() declare notes: string | null
  @column() declare updatedBy: number | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
