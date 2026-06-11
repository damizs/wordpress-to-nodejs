import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Permission from './permission.js'

export default class Role extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare name: string
  @column() declare slug: string
  @column() declare description: string | null
  @column() declare isSystem: boolean
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null

  @manyToMany(() => Permission, {
    pivotTable: 'role_permissions',
  })
  declare permissions: ManyToMany<typeof Permission>
}
