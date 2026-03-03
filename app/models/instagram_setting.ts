import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class InstagramSetting extends BaseModel {
  static table = 'instagram_settings'

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

  /**
   * Get a single setting value
   */
  static async get(key: string, defaultValue: string | null = null): Promise<string | null> {
    const setting = await this.query().where('key', key).first()
    return setting?.value ?? defaultValue
  }

  /**
   * Set a setting value
   */
  static async set(key: string, value: string | null): Promise<void> {
    await this.updateOrCreate({ key }, { key, value })
  }

  /**
   * Get all settings as key-value object
   */
  static async getAll(): Promise<Record<string, string | null>> {
    const settings = await this.all()
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string | null>)
  }

  /**
   * Set multiple settings at once
   */
  static async setMany(data: Record<string, string | null>): Promise<void> {
    for (const [key, value] of Object.entries(data)) {
      await this.set(key, value)
    }
  }

  /**
   * Default AI prompt
   */
  static get DEFAULT_PROMPT(): string {
    return `Você é um redator profissional de portais institucionais governamentais (câmaras e prefeituras).
Com base na legenda do Instagram abaixo, gere:
1. Um título jornalístico chamativo e informativo (máximo 80 caracteres, SEM truncar com reticências)
2. Um conteúdo de notícia em tom formal e institucional (2 a 3 parágrafos)

REGRAS IMPORTANTES:
- Use linguagem clara e objetiva
- Evite emojis e informalidade
- Mantenha tom institucional
- NÃO use entidades HTML (como &hellip; &amp; etc) - use caracteres normais
- NÃO corte o título com reticências, faça um título COMPLETO
- Se o título ficar muito grande, reformule para caber em 80 caracteres

Legenda do Instagram:
{CAPTION}

Responda APENAS em formato JSON válido:
{
  "titulo": "...",
  "conteudo": "..."
}`
  }
}
