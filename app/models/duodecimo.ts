import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

/** Converte o valor decimal vindo do Postgres (string) para number ao ler */
const toNumber = {
  consume: (value: string | number | null): number | null =>
    value === null || value === undefined ? null : Number(value),
}

export default class Duodecimo extends BaseModel {
  static table = 'duodecimos'

  @column({ isPrimary: true }) declare id: number
  @column() declare year: number
  @column() declare month: number
  @column(toNumber) declare previsto: number
  @column(toNumber) declare recebido: number | null
  @column() declare repasseDate: string | null
  @column() declare documentUrl: string | null
  @column() declare notes: string | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
