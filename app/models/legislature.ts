import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Councilor from './councilor.js'

export default class Legislature extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare name: string
  @column() declare number: number
  @column() declare startDate: string
  @column() declare endDate: string
  @column() declare isCurrent: boolean
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
  @hasMany(() => Councilor) declare councilors: HasMany<typeof Councilor>
}
