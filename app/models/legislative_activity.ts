import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Councilor from './councilor.js'

export interface TramitationStep {
  date?: string | null
  title: string
  description?: string | null
  status?: string | null
}

export default class LegislativeActivity extends BaseModel {
  static table = 'legislative_activities'
  @column({ isPrimary: true }) declare id: number
  @column() declare title: string | null
  @column() declare slug: string | null
  @column() declare type: string
  @column() declare number: string
  @column() declare year: number
  @column() declare summary: string
  @column() declare content: string | null
  @column() declare status: string
  @column() declare origin: string
  @column() declare author: string | null
  @column() declare fileUrl: string | null
  @column() declare sessionDate: string | null
  @column() declare isActive: boolean
  @column() declare votingSystemId: string | null
  @column() declare votingSystemUrl: string | null
  @column({
    prepare: (value: TramitationStep[] | null) => (value ? JSON.stringify(value) : null),
    consume: (value: unknown): TramitationStep[] | null => {
      if (!value) return null
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value)
          return Array.isArray(parsed) ? parsed : null
        } catch {
          return null
        }
      }
      return Array.isArray(value) ? (value as TramitationStep[]) : null
    },
  })
  declare tramitationSteps: TramitationStep[] | null
  @column.dateTime() declare syncedAt: DateTime | null
  @column.dateTime() declare deletedAt: DateTime | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null

  @manyToMany(() => Councilor, {
    pivotTable: 'legislative_activity_authors',
    pivotForeignKey: 'legislative_activity_id',
    pivotRelatedForeignKey: 'councilor_id',
  })
  declare authors: ManyToMany<typeof Councilor>
}
