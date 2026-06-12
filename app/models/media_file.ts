import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class MediaFile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  /** Nome original do arquivo enviado pelo usuário */
  @column()
  declare filename: string

  /** URL pública (ex.: /uploads/midia/abc123.png) */
  @column()
  declare url: string

  @column()
  declare mimeType: string

  /** Tamanho em bytes */
  @column()
  declare size: number

  @column()
  declare uploadedBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
