import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class TransparencyLink extends BaseModel {
  static table = 'transparency_links'
  @column({ isPrimary: true }) declare id: number
  @column() declare sectionId: number
  @column() declare title: string
  @column() declare url: string
  @column() declare icon: string | null
  @column() declare displayOrder: number
  @column() declare isExternal: boolean
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
