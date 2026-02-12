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

  /** Set a single setting value */
  static async setValue(key: string, value: string | null): Promise<void> {
    await this.query().where('key', key).update({ value, updated_at: new Date() })
  }

  /** Bulk update settings */
  static async bulkUpdate(settings: Record<string, string | null>): Promise<void> {
    for (const [key, value] of Object.entries(settings)) {
      await this.setValue(key, value)
    }
  }
}
