import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class PlenarySession extends BaseModel {
  static table = 'plenary_sessions'
  @column({ isPrimary: true }) declare id: number
  @column() declare title: string
  @column() declare type: string
  @column() declare sessionDate: string
  @column() declare startTime: string | null
  @column() declare status: string
  @column() declare agenda: string | null
  @column() declare minutes: string | null
  @column() declare videoUrl: string | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
