import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Licitacao from '#models/licitacao'

/** Converte o decimal do PostgreSQL (que chega como string) em number. */
const toNumber = {
  consume: (v: unknown) => (v === null || v === undefined ? null : Number(v)),
}

export default class Contract extends BaseModel {
  static table = 'contracts'

  @column({ isPrimary: true }) declare id: number
  @column() declare number: string | null
  @column() declare year: number | null
  @column() declare slug: string
  @column() declare object: string | null
  @column() declare contractorName: string | null
  @column() declare contractorDocument: string | null
  @column(toNumber) declare value: number | null
  @column() declare modality: string | null
  @column() declare legalBasis: string | null
  @column() declare signDate: string | null
  @column() declare startDate: string | null
  @column() declare endDate: string | null
  @column() declare term: string | null
  @column() declare status: string
  @column() declare managerName: string | null
  @column() declare managerRole: string | null
  @column() declare fiscalName: string | null
  @column() declare fiscalRole: string | null
  @column() declare fiscalAct: string | null
  @column() declare licitacaoId: number | null
  @column() declare fileUrl: string | null
  @column() declare content: string | null
  @column() declare notes: string | null
  @column() declare isActive: boolean
  @column() declare displayOrder: number
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null

  @belongsTo(() => Licitacao)
  declare licitacao: BelongsTo<typeof Licitacao>
}
