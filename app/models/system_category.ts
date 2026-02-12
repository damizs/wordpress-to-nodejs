import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class SystemCategory extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare type: string
  @column() declare name: string
  @column() declare slug: string
  @column() declare displayOrder: number
  @column() declare isActive: boolean
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null

  static async byType(type: string) {
    return this.query()
      .where('type', type)
      .where('is_active', true)
      .orderBy('display_order', 'asc')
  }
}
