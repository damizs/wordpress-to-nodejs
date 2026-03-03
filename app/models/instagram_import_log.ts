import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import News from './news.js'
import User from './user.js'

export default class InstagramImportLog extends BaseModel {
  static table = 'instagram_import_logs'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare instagramId: string

  @column()
  declare instagramShortcode: string | null

  @column()
  declare instagramUrl: string | null

  @column()
  declare instagramCaption: string | null

  @column()
  declare instagramImageUrl: string | null

  @column.dateTime()
  declare instagramPostDate: DateTime | null

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

  @column()
  declare newsId: number | null

  @column()
  declare status: 'pending' | 'published' | 'draft' | 'error'

  @column()
  declare categoryId: number | null

  @column()
  declare imageId: number | null

  @column()
  declare processingTime: number | null

  @column()
  declare errorMessage: string | null

  @column()
  declare importedBy: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => News)
  declare news: BelongsTo<typeof News>

  @belongsTo(() => User, { foreignKey: 'importedBy' })
  declare user: BelongsTo<typeof User>

  /**
   * Check if post was already imported
   */
  static async isImported(instagramId: string): Promise<boolean> {
    const log = await this.query()
      .where('instagram_id', instagramId)
      .whereNotNull('news_id')
      .first()
    return !!log
  }

  /**
   * Get all imported Instagram IDs
   */
  static async getImportedIds(): Promise<string[]> {
    const logs = await this.query()
      .whereNotNull('news_id')
      .select('instagram_id')
    return logs.map(log => log.instagramId)
  }
}
