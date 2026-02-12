import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Legislature from './legislature.js'
import CouncilorPosition from './councilor_position.js'

export default class Biennium extends BaseModel {
  static table = 'biennia'

  @column({ isPrimary: true }) declare id: number
  @column() declare name: string
  @column() declare legislatureId: number
  @column() declare startDate: string
  @column() declare endDate: string
  @column() declare isCurrent: boolean
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null

  @belongsTo(() => Legislature) declare legislature: BelongsTo<typeof Legislature>
  @hasMany(() => CouncilorPosition) declare positions: HasMany<typeof CouncilorPosition>
}
