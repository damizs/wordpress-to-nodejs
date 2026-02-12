import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class SurveyResponse extends BaseModel {
  static table = 'survey_responses'
  @column({ isPrimary: true }) declare id: number
  @column() declare questionId: number
  @column() declare rating: number
  @column() declare comment: string | null
  @column() declare ipAddress: string | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
