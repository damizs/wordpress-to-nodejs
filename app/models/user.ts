import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import db from '@adonisjs/lucid/services/db'
import Role from './role.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true }) declare id: number
  @column() declare fullName: string
  @column() declare email: string
  @column({ serializeAs: null }) declare password: string
  /** Enum legado — mantido como fallback durante a transição para RBAC */
  @column() declare role: 'super_admin' | 'admin' | 'editor' | 'viewer'
  @column() declare isActive: boolean

  /** Avatar do painel: caminho de um avatar pré-definido (ex.: '/avatars/a1.svg') ou null (usa iniciais). */
  @column() declare avatar: string | null

  /** 2FA (TOTP, opt-in) — nunca serializados para o cliente. */
  @column({ serializeAs: null }) declare twofaSecret: string | null
  @column() declare twofaEnabled: boolean
  /** JSON (string) com os códigos de backup HASHEADOS; nunca em claro. */
  @column({ serializeAs: null }) declare twofaBackupCodes: string | null

  @column.dateTime() declare lastLoginAt: DateTime | null
  @column() declare lastLoginIp: string | null

  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime | null

  @manyToMany(() => Role, {
    pivotTable: 'user_roles',
  })
  declare roles: ManyToMany<typeof Role>

  /** Cache por instância (vale por requisição) */
  private permissionCache: string[] | null = null

  /**
   * Permissões efetivas do usuário (via papéis).
   * '*' significa acesso total (fallback do enum legado admin/super_admin
   * para usuários ainda sem papel atribuído).
   */
  async getPermissionNames(): Promise<string[]> {
    if (this.permissionCache) return this.permissionCache

    let names: string[] = []
    try {
      const rows = await db
        .from('permissions')
        .join('role_permissions', 'permissions.id', 'role_permissions.permission_id')
        .join('user_roles', 'role_permissions.role_id', 'user_roles.role_id')
        .where('user_roles.user_id', this.id)
        .distinct('permissions.name')

      names = rows.map((r: { name: string }) => r.name)
    } catch {
      // Tabelas RBAC ainda não migradas — cai no fallback do enum
    }

    if (names.length === 0) {
      if (this.role === 'super_admin' || this.role === 'admin') {
        names = ['*']
      } else if (this.role === 'editor') {
        names = ['noticia.criar', 'noticia.editar', 'noticia.publicar']
      }
    }

    this.permissionCache = names
    return names
  }

  /** O usuário tem ao menos uma das permissões exigidas? */
  async canAny(required: string[]): Promise<boolean> {
    const names = await this.getPermissionNames()
    if (names.includes('*')) return true
    return required.some((p) => names.includes(p))
  }
}
