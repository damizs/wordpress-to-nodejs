import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Estende a tabela `pages` (módulo "Páginas" estilo WordPress) com:
 * - blocks: conteúdo em blocos (JSON array) — `content` legado vira fallback
 * - meta_description: descrição para SEO (<meta name="description">)
 * - hero_subtitle: subtítulo exibido no PageHero da página pública
 * - published_at: data/hora da primeira publicação
 */
export default class extends BaseSchema {
  protected tableName = 'pages'

  async up() {
    this.schema.alterTable(this.tableName, (t) => {
      t.json('blocks').nullable()
      t.string('meta_description').nullable()
      t.string('hero_subtitle').nullable()
      t.timestamp('published_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (t) => {
      t.dropColumn('blocks')
      t.dropColumn('meta_description')
      t.dropColumn('hero_subtitle')
      t.dropColumn('published_at')
    })
  }
}
