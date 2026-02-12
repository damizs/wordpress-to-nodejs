import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class OfficialPublication extends BaseModel {
  static table = 'official_publications'
  @column({ isPrimary: true }) declare id: number
  @column() declare title: string
  @column() declare slug: string | null
  @column() declare type: string
  @column() declare number: string | null
  @column() declare publicationDate: string
  @column() declare fileUrl: string | null
  @column() declare description: string | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
