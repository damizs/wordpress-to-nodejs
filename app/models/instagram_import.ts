import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import News from './news.js'

export default class InstagramImport extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Instagram data
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

  // Generated content
  @column()
  declare generatedTitle: string | null

  @column()
  declare generatedContent: string | null

  // AI info
  @column()
  declare aiProvider: string | null

  @column()
  declare aiModel: string | null

  @column()
  declare aiTokensUsed: number

  // News reference
  @column()
  declare newsId: number | null

  @column()
  declare newsStatus: string | null

  @column()
  declare categoryId: number | null

  @column()
  declare imageId: number | null

  // Import info
  @column.dateTime()
  declare importedAt: DateTime

  @column()
  declare importedBy: number | null

  @column()
  declare processingTime: number | null

  @column()
  declare errorMessage: string | null

  @column()
  declare isAutoImport: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => News)
  declare news: BelongsTo<typeof News>
}
