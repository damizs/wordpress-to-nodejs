import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Committee from './committee.js'
import Councilor from './councilor.js'

export default class CommitteeMember extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare committeeId: number
  @column() declare councilorId: number
  @column() declare role: string
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null

  @belongsTo(() => Committee) declare committee: BelongsTo<typeof Committee>
  @belongsTo(() => Councilor) declare councilor: BelongsTo<typeof Councilor>
}
