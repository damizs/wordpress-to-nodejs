import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import NewsCategory from './news_category.js'
import User from './user.js'

export default class News extends BaseModel {
  static table = 'news'
  @column({ isPrimary: true }) declare id: number
  @column() declare title: string
  @column() declare slug: string
  @column() declare excerpt: string | null
  @column() declare content: string
  @column() declare coverImageUrl: string | null
  @column() declare status: 'draft' | 'published' | 'archived'
  @column.dateTime() declare publishedAt: DateTime | null
  @column() declare categoryId: number | null
  @column() declare authorId: number | null
  @column() declare viewsCount: number
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
  @belongsTo(() => NewsCategory, { foreignKey: 'categoryId' }) declare category: BelongsTo<typeof NewsCategory>
  @belongsTo(() => User, { foreignKey: 'authorId' }) declare author: BelongsTo<typeof User>
}
