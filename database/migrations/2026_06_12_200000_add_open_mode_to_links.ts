import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Configuração de abertura por link (transparência, links rápidos e
 * registros de acesso à informação):
 * - open_mode: 'nova_aba' (padrão, comportamento atual) ou 'modal' (popup com iframe)
 * - hide_chrome: quando o link é interno e abre em modal, esconde cabeçalho/rodapé
 *   da página embutida (anexa ?embed=1 à URL do iframe). Padrão ligado.
 */
export default class extends BaseSchema {
  protected tables = ['transparency_links', 'quick_links', 'information_records']

  async up() {
    for (const tableName of this.tables) {
      this.schema.alterTable(tableName, (t) => {
        t.string('open_mode').notNullable().defaultTo('nova_aba')
        t.boolean('hide_chrome').notNullable().defaultTo(true)
      })
    }
  }

  async down() {
    for (const tableName of this.tables) {
      this.schema.alterTable(tableName, (t) => {
        t.dropColumn('open_mode')
        t.dropColumn('hide_chrome')
      })
    }
  }
}
