import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

/**
 * Índice leve de matérias do GetPublic (Diário Oficial e atos publicados).
 * Guarda só metadados + link do visualizador — o PDF permanece no GetPublic.
 * Populado por `getpublic:sync` e usado na busca global do portal.
 */
export default class GetPublicMateria extends BaseModel {
  static table = 'getpublic_materias'

  @column({ isPrimary: true }) declare id: number
  @column() declare codigo: string
  @column() declare titulo: string
  @column() declare tipo: string
  @column() declare diarioCodigo: string | null
  @column.date() declare diarioData: DateTime | null
  @column() declare urlMateria: string
  @column.dateTime() declare syncedAt: DateTime | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
