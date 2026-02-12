import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import News from './news.js'

export default class NewsCategory extends BaseModel {
  static table = 'news_categories'
  @column({ isPrimary: true }) declare id: number
  @column() declare name: string
  @column() declare slug: string
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null
  @hasMany(() => News, { foreignKey: 'categoryId' }) declare news: HasMany<typeof News>
}
