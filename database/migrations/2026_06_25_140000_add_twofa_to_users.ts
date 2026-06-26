import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Autenticação de 2 fatores (2FA) OPCIONAL por usuário.
 *
 * Adiciona em `users`:
 *  - twofa_secret        (varchar null)  → segredo TOTP (RFC 6238), base32
 *  - twofa_enabled       (boolean def false not null)
 *  - twofa_backup_codes  (text null)     → JSON com os códigos de backup HASHEADOS
 *                                          (nunca em claro). Cada item é um hash scrypt
 *                                          do Adonis; o código usado é removido do array.
 *
 * Idempotente: só altera o que ainda não existe (seguro para reexecução / produção).
 */
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    if (!(await this.schema.hasTable(this.tableName))) return

    const hasSecret = await this.schema.hasColumn(this.tableName, 'twofa_secret')
    const hasEnabled = await this.schema.hasColumn(this.tableName, 'twofa_enabled')
    const hasBackup = await this.schema.hasColumn(this.tableName, 'twofa_backup_codes')

    if (hasSecret && hasEnabled && hasBackup) return

    this.schema.alterTable(this.tableName, (table) => {
      if (!hasSecret) table.string('twofa_secret').nullable()
      if (!hasEnabled) table.boolean('twofa_enabled').notNullable().defaultTo(false)
      if (!hasBackup) table.text('twofa_backup_codes').nullable()
    })
  }

  async down() {
    if (!(await this.schema.hasTable(this.tableName))) return

    const hasSecret = await this.schema.hasColumn(this.tableName, 'twofa_secret')
    const hasEnabled = await this.schema.hasColumn(this.tableName, 'twofa_enabled')
    const hasBackup = await this.schema.hasColumn(this.tableName, 'twofa_backup_codes')

    this.schema.alterTable(this.tableName, (table) => {
      if (hasSecret) table.dropColumn('twofa_secret')
      if (hasEnabled) table.dropColumn('twofa_enabled')
      if (hasBackup) table.dropColumn('twofa_backup_codes')
    })
  }
}
