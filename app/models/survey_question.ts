import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class SurveyQuestion extends BaseModel {
  static table = 'survey_questions'
  @column({ isPrimary: true }) declare id: number
  @column() declare question: string
  @column() declare isActive: boolean
  @column() declare displayOrder: number
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
