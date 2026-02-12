import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class SatisfactionSurvey extends BaseModel {
  static table = 'satisfaction_surveys'

  @column({ isPrimary: true }) declare id: number
  @column() declare name: string | null
  @column() declare email: string | null
  @column() declare phone: string | null
  @column() declare ratingAtendimento: number | null
  @column() declare ratingTransparencia: number | null
  @column() declare ratingLegislativo: number | null
  @column() declare ratingInfraestrutura: number | null
  @column() declare ratingGeral: number
  @column() declare suggestions: string | null
  @column() declare complaints: string | null
  @column() declare ipAddress: string | null
  @column() declare isRead: boolean
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
