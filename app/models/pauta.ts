import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Pauta extends BaseModel {
  static table = 'pautas'

  @column({ isPrimary: true }) declare id: number
  @column() declare title: string
  @column() declare slug: string
  @column() declare type: string
  @column() declare documentDate: string | null
  @column() declare year: number | null
  @column() declare docTime: string | null
  @column() declare content: string | null
  @column() declare fileUrl: string | null
  @column() declare isPublished: boolean
  @column() declare displayOrder: number
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
