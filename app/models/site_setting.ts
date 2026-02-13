import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class SiteSetting extends BaseModel {
  static table = 'site_settings'

  @column({ isPrimary: true }) declare id: number
  @column() declare group: string
  @column() declare key: string
  @column() declare value: string | null
  @column() declare type: 'text' | 'json' | 'image' | 'color' | 'boolean' | 'number'
  @column() declare label: string | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null

  /** Get all settings as a flat key→value object */
  static async allAsObject(): Promise<Record<string, string | null>> {
    const rows = await this.all()
    const obj: Record<string, string | null> = {}
    for (const row of rows) {
      obj[row.key] = row.value
    }
    return obj
  }

  /** Get settings by group as key→value */
  static async byGroup(group: string): Promise<Record<string, string | null>> {
    const rows = await this.query().where('group', group)
    const obj: Record<string, string | null> = {}
    for (const row of rows) {
      obj[row.key] = row.value
    }
    return obj
  }

  /** Get a single setting value */
  static async getValue(key: string): Promise<string | null> {
    const row = await this.findBy('key', key)
    return row?.value ?? null
  }

  /** Set a single setting value (upsert) */
  static async setValue(key: string, value: string | null, group: string = 'general', type: 'text' | 'json' | 'image' | 'color' | 'boolean' | 'number' = 'text'): Promise<void> {
    const existing = await this.findBy('key', key)
    if (existing) {
      existing.value = value
      existing.updatedAt = DateTime.now()
      await existing.save()
    } else {
      await this.create({ key, value, group, type })
    }
  }

  /** Bulk update settings (with upsert) */
  static async bulkUpdate(settings: Record<string, string | null>): Promise<void> {
    // Map keys to their expected groups
    const groupMap: Record<string, string> = {
      color_navy: 'appearance', color_gold: 'appearance', color_sky: 'appearance',
      header_title: 'appearance', header_subtitle: 'appearance',
      logo_url: 'appearance', favicon_url: 'appearance',
      footer_address: 'footer', footer_phone: 'footer', footer_email: 'footer', footer_hours: 'footer',
      social_facebook: 'social', social_instagram: 'social', social_youtube: 'social',
      esic_new_url: 'esic', esic_consult_url: 'esic', esic_phone: 'esic', esic_email: 'esic',
    }
    for (const [key, value] of Object.entries(settings)) {
      await this.setValue(key, value, groupMap[key] || 'general')
    }
  }
}
