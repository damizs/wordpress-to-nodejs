import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class GlossaryTerm extends BaseModel {
  static table = 'glossary_terms'

  @column({ isPrimary: true }) declare id: number
  @column() declare term: string
  @column() declare definition: string
  @column() declare letter: string | null
  @column() declare slug: string | null
  @column() declare displayOrder: number
  @column() declare isActive: boolean
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
