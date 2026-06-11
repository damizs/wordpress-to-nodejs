import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Permission extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare name: string // recurso.acao (ex: noticia.publicar)
  @column() declare label: string
  @column() declare module: string
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
}
