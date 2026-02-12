import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class TransparencySection extends BaseModel {
  static table = 'transparency_sections'
  @column({ isPrimary: true }) declare id: number
  @column() declare title: string
  @column() declare slug: string
  @column() declare icon: string | null
  @column() declare description: string | null
  @column() declare displayOrder: number
  @column() declare isActive: boolean
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
