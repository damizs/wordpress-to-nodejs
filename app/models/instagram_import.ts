import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import News from './news.js'
import User from './user.js'

export default class InstagramImport extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Dados do Instagram
  @column()
  declare instagramId: string

  @column()
  declare instagramUrl: string

  @column()
  declare instagramCaption: string | null

  @column()
  declare instagramImageUrl: string | null

  @column.dateTime()
  declare instagramPostDate: DateTime | null

  @column()
  declare instagramShortcode: string | null

  // Dados gerados pela IA
  @column()
  declare generatedTitle: string | null

  @column()
  declare generatedContent: string | null

  @column()
  declare aiProvider: string | null

  @column()
  declare aiModel: string | null

  @column()
  declare aiTokensUsed: number

  // Relação com notícias
  @column()
  declare newsId: number | null

  @column()
  declare importStatus: string

  // Metadados
  @column()
  declare importedBy: number | null

  @column()
  declare processingTime: number | null

  @column()
  declare errorMessage: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relacionamentos
  @belongsTo(() => News)
  declare news: BelongsTo<typeof News>

  @belongsTo(() => User, { foreignKey: 'importedBy' })
  declare user: BelongsTo<typeof User>
}
