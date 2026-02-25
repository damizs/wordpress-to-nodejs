import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class InstagramSetting extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  // Configurações do Instagram
  @column()
  declare instagramProfileUrl: string | null

  @column()
  declare rapidapiKey: string | null

  @column()
  declare instagramSessionid: string | null

  @column()
  declare instagramUseragent: string | null

  // Configurações de IA
  @column()
  declare aiProvider: string

  @column()
  declare aiApiKey: string | null

  @column()
  declare aiModel: string

  @column()
  declare aiPrompt: string | null

  // Configurações de importação
  @column()
  declare autoImportEnabled: boolean

  @column()
  declare cronMode: string

  @column()
  declare cronHour: number

  @column()
  declare cronMinute: number

  @column()
  declare autoImportLimit: number

  @column()
  declare defaultStatus: string

  @column()
  declare defaultCategoryId: number | null

  @column()
  declare downloadImages: boolean

  @column()
  declare preventDuplicates: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Prompt padrão
  static get DEFAULT_PROMPT() {
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
