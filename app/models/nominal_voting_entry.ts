import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import NominalVoting from './nominal_voting.js'
import Councilor from './councilor.js'

export type VoteValue = 'sim' | 'nao' | 'abstencao' | 'ausente' | 'nao_votou'

export default class NominalVotingEntry extends BaseModel {
  static table = 'nominal_voting_entries'

  @column({ isPrimary: true }) declare id: number
  @column() declare nominalVotingId: number
  @column() declare councilorId: number | null
  @column() declare councilorName: string
  @column() declare party: string | null
  @column() declare vote: VoteValue
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime

  @belongsTo(() => NominalVoting) declare nominalVoting: BelongsTo<typeof NominalVoting>
  @belongsTo(() => Councilor) declare councilor: BelongsTo<typeof Councilor>
}
