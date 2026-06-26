import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Avatar do usuário do painel (auto-gestão em "Minha Conta").
 *
 * Adiciona em `users`:
 *  - avatar (varchar null) → caminho público de um avatar pré-definido
 *    (ex.: '/avatars/a1.svg'). Nulo = usa as iniciais do nome.
 *
 * Idempotente: só altera se a coluna ainda não existe (seguro p/ reexecução).
 */
export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    if (!(await this.schema.hasTable(this.tableName))) return

    const hasAvatar = await this.schema.hasColumn(this.tableName, 'avatar')
    if (hasAvatar) return

    this.schema.alterTable(this.tableName, (table) => {
      table.string('avatar').nullable()
    })
  }

  async down() {
    if (!(await this.schema.hasTable(this.tableName))) return

    const hasAvatar = await this.schema.hasColumn(this.tableName, 'avatar')
    if (!hasAvatar) return

    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('avatar')
    })
  }
}
