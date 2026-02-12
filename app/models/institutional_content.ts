import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class InstitutionalContent extends BaseModel {
  static table = 'institutional_content'
  @column({ isPrimary: true }) declare id: number
  @column() declare key: string
  @column() declare title: string
  @column() declare content: string
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
