import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export interface SnapshotDimension {
  key: string
  label: string
  pct: number
}

export interface SnapshotTotals {
  criteria: number
  met: number
  external: number
  partial: number
  pending: number
  notApplicable: number
}

const jsonColumn = {
  prepare: (value: unknown) => JSON.stringify(value),
  consume: (value: unknown) => (typeof value === 'string' ? JSON.parse(value) : value),
}

/** Fotografia diária do índice PNTP para o gráfico de evolução do Radar ATRICON. */
export default class AtriconSnapshot extends BaseModel {
  static table = 'atricon_snapshots'

  @column({ isPrimary: true }) declare id: number

  @column({ consume: (value: unknown) => Number(value) }) declare index: number

  @column() declare level: string

  @column(jsonColumn) declare dimensions: SnapshotDimension[] | null

  @column(jsonColumn) declare totals: SnapshotTotals | null

  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
}
