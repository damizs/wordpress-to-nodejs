import { BaseSchema } from '@adonisjs/lucid/schema'
import { generateSlug } from '#helpers/slug'

/**
 * Adiciona a coluna `slug` aos links da transparência (deep-link do modal:
 * /transparencia/<slug>) e preenche os registros existentes a partir do
 * título, garantindo unicidade com sufixos -2, -3, ...
 */
export default class extends BaseSchema {
  protected tableName = 'transparency_links'

  async up() {
    this.schema.alterTable(this.tableName, (t) => {
      t.string('slug').nullable().index()
    })

    this.defer(async (db) => {
      const links = await db.from(this.tableName).select('id', 'title').orderBy('id', 'asc')
      const used = new Set<string>()
      for (const link of links) {
        const base = generateSlug(String(link.title || '')) || `link-${link.id}`
        let slug = base
        let suffix = 2
        while (used.has(slug)) slug = `${base}-${suffix++}`
        used.add(slug)
        await db.from(this.tableName).where('id', link.id).update({ slug })
      }
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (t) => {
      t.dropIndex(['slug'])
      t.dropColumn('slug')
    })
  }
}
