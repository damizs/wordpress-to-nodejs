import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Licitacao extends BaseModel {
  static table = 'licitacoes'

  @column({ isPrimary: true }) declare id: number
  @column() declare title: string
  @column() declare slug: string
  @column() declare number: string | null
  @column() declare modality: string | null
  @column() declare status: string
  @column() declare object: string | null
  @column() declare content: string | null
  @column() declare estimatedValue: number | null
  @column() declare openingDate: string | null
  @column() declare closingDate: string | null
  @column() declare year: number | null
  @column() declare fileUrl: string | null
  @column() declare isActive: boolean
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
