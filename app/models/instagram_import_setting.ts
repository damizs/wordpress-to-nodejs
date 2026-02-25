import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class InstagramImportSetting extends BaseModel {
  static table = 'instagram_import_settings'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare key: string

  @column()
  declare value: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Helper para obter configuração
  static async get(key: string, defaultValue: string | null = null): Promise<string | null> {
    const setting = await this.query().where('key', key).first()
    return setting?.value ?? defaultValue
  }

  // Helper para definir configuração
  static async set(key: string, value: string | null): Promise<void> {
    await this.updateOrCreate({ key }, { key, value })
  }

  // Helper para obter múltiplas configurações
  static async getAll(): Promise<Record<string, string | null>> {
    const settings = await this.all()
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string | null>)
  }
}
