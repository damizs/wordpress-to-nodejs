import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class FiscalReport extends BaseModel {
  static table = 'fiscal_reports'

  @column({ isPrimary: true }) declare id: number
  @column() declare reportType: string
  @column() declare year: number
  @column() declare periodKind: string
  @column() declare periodNumber: number | null
  @column() declare title: string | null
  @column() declare description: string | null
  @column() declare fileUrl: string | null
  @column() declare isActive: boolean
  @column() declare displayOrder: number
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
