import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class OfficialGazetteEntry extends BaseModel {
  static table = 'official_gazette_entries'
  @column({ isPrimary: true }) declare id: number
  @column() declare editionNumber: string
  @column() declare publicationDate: string
  @column() declare description: string | null
  @column() declare fileUrl: string | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
