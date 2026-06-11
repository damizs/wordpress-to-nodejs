import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Licitacao from '#models/licitacao'

export default class LicitacaoDocument extends BaseModel {
  static table = 'licitacao_documents'

  @column({ isPrimary: true }) declare id: number
  @column() declare licitacaoId: number
  @column() declare documentType: string
  @column() declare title: string
  @column() declare fileUrl: string
  @column() declare displayOrder: number
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null

  @belongsTo(() => Licitacao)
  declare licitacao: BelongsTo<typeof Licitacao>
}
