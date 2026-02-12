import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Legislature from './legislature.js'
import CouncilorPosition from './councilor_position.js'

export default class Councilor extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare name: string
  @column() declare fullName: string | null
  @column() declare parliamentaryName: string | null
  @column() declare slug: string
  @column() declare party: string | null
  @column() declare gender: string | null
  @column() declare maritalStatus: string | null
  @column() declare educationLevel: string | null
  @column() declare photoUrl: string | null
  @column() declare email: string | null
  @column() declare phone: string | null
  @column() declare bio: string | null
  @column() declare history: string | null
  @column() declare role: string | null
  @column() declare isActive: boolean
  @column() declare legislatureId: number | null
  @column() declare displayOrder: number
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null

  @belongsTo(() => Legislature) declare legislature: BelongsTo<typeof Legislature>
  @hasMany(() => CouncilorPosition) declare positions: HasMany<typeof CouncilorPosition>
}
