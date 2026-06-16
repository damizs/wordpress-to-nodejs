import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class SystemCategory extends BaseModel {
  private static cacheTtlMs = 60_000
  private static byTypeCache = new Map<string, { expiresAt: number; value: SystemCategory[] }>()

  @column({ isPrimary: true }) declare id: number
  @column() declare type: string
  @column() declare name: string
  @column() declare slug: string
  @column() declare displayOrder: number
  @column() declare isActive: boolean
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null

  static async byType(type: string) {
    const cached = this.byTypeCache.get(type)
    if (cached && cached.expiresAt > Date.now()) return cached.value

    const rows = await this.query()
      .where('type', type)
      .where('is_active', true)
      .orderBy('display_order', 'asc')
    this.byTypeCache.set(type, { value: rows, expiresAt: Date.now() + this.cacheTtlMs })
    return rows
  }

  static clearCache() {
    this.byTypeCache.clear()
  }
}
