import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class LegislativeActivity extends BaseModel {
  static table = 'legislative_activities'
  @column({ isPrimary: true }) declare id: number
  @column() declare title: string | null
  @column() declare slug: string | null
  @column() declare type: string
  @column() declare number: string
  @column() declare year: number
  @column() declare summary: string
  @column() declare content: string | null
  @column() declare status: string
  @column() declare author: string | null
  @column() declare fileUrl: string | null
  @column() declare sessionDate: string | null
  @column() declare isActive: boolean
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
