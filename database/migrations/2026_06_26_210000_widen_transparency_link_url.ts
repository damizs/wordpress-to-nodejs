import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * URLs de sistemas externos de transparência (publicsoft/elmar) podem passar de
 * 1000 caracteres (query params longos). varchar(255) truncava/quebrava — muda
 * para `text`. Idempotente (re-aplicar quando já for text é no-op).
 */
export default class extends BaseSchema {
  protected tableName = 'transparency_links'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('url').alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('url', 255).alter()
    })
  }
}
