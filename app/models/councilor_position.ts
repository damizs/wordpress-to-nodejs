import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Councilor from './councilor.js'
import Biennium from './biennium.js'

export default class CouncilorPosition extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare councilorId: number
  @column() declare bienniumId: number
  @column() declare position: string
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null

  @belongsTo(() => Councilor) declare councilor: BelongsTo<typeof Councilor>
  @belongsTo(() => Biennium) declare biennium: BelongsTo<typeof Biennium>
}
