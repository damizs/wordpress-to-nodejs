import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import PlenarySession from './plenary_session.js'
import LegislativeActivity from './legislative_activity.js'
import NominalVotingEntry from './nominal_voting_entry.js'

export type VotingResult = 'aprovado' | 'rejeitado' | 'retirado' | 'adiado' | 'outro'
export type VotingSource = 'manual' | 'ata_ia' | 'api'

export default class NominalVoting extends BaseModel {
  static table = 'nominal_votings'

  @column({ isPrimary: true }) declare id: number
  @column() declare title: string
  @column() declare description: string | null
  @column() declare plenarySessionId: number | null
  @column() declare legislativeActivityId: number | null
  @column() declare votingDate: string
  @column() declare year: number
  @column() declare result: VotingResult
  @column() declare isUnanimous: boolean
  @column() declare isPublished: boolean
  @column() declare source: VotingSource
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null

  @belongsTo(() => PlenarySession) declare plenarySession: BelongsTo<typeof PlenarySession>
  @belongsTo(() => LegislativeActivity)
  declare legislativeActivity: BelongsTo<typeof LegislativeActivity>
  @hasMany(() => NominalVotingEntry) declare entries: HasMany<typeof NominalVotingEntry>
}
