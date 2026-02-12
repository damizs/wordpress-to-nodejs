import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class PlenarySession extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare title: string
  @column() declare type: 'ordinaria' | 'extraordinaria' | 'solene' | 'especial'
  @column() declare sessionDate: string
  @column() declare year: number | null
  @column() declare startTime: string | null
  @column() declare status: 'agendada' | 'realizada' | 'cancelada'
  @column() declare agenda: string | null
  @column() declare minutes: string | null
  @column() declare videoUrl: string | null
  @column() declare fileUrl: string | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
