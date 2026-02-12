import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Legislature from './legislature.js'
import CommitteeMember from './committee_member.js'

export default class Committee extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare name: string
  @column() declare slug: string
  @column() declare description: string | null
  @column() declare type: 'permanente' | 'temporaria' | 'especial'
  @column() declare legislatureId: number | null
  @column() declare isActive: boolean
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null

  @belongsTo(() => Legislature) declare legislature: BelongsTo<typeof Legislature>
  @hasMany(() => CommitteeMember) declare members: HasMany<typeof CommitteeMember>
}
