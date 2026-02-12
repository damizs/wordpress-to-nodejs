import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Page extends BaseModel {
  static table = 'pages'
  @column({ isPrimary: true }) declare id: number
  @column() declare title: string
  @column() declare slug: string
  @column() declare content: string
  @column() declare isPublished: boolean
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
