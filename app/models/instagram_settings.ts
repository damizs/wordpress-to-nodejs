import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class InstagramSettings extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Instagram config
  @column()
  declare instagramProfileUrl: string | null

  @column()
  declare instagramSessionid: string | null

  @column()
  declare instagramUseragent: string | null

  @column()
  declare rapidapiKey: string | null

  // AI config
  @column()
  declare aiProvider: 'openai' | 'claude' | 'gemini'

  @column()
  declare aiApiKey: string | null

  @column()
  declare aiModel: string

  @column()
  declare aiPrompt: string | null

  // Publishing defaults
  @column()
  declare defaultCategoryId: number | null

  @column()
  declare defaultStatus: 'draft' | 'published'

  @column()
  declare downloadImages: boolean

  @column()
  declare preventDuplicates: boolean

  // Auto import config
  @column()
  declare autoImportEnabled: boolean

  @column()
  declare autoImportInterval: '30min' | '1hour' | '6hours' | '12hours' | 'daily'

  @column()
  declare autoImportLimit: number

  @column()
  declare cronTime: string

  @column()
  declare importOnlyToday: boolean

  // Last run info
  @column.dateTime()
  declare lastImportAt: DateTime | null

  @column()
  declare lastImportCount: number

  @column()
  declare lastImportError: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Helper para pegar settings (singleton)
  static async getSettings(): Promise<InstagramSettings> {
    let settings = await this.query().first()
    if (!settings) {
      settings = await this.create({
        aiProvider: 'gemini',
        aiModel: 'gemini-2.0-flash',
        defaultStatus: 'draft',
        downloadImages: true,
        preventDuplicates: true,
        autoImportEnabled: false,
        autoImportInterval: 'daily',
        autoImportLimit: 5,
        cronTime: '08:00',
        importOnlyToday: true,
        lastImportCount: 0,
      })
    }
    return settings
  }
}
