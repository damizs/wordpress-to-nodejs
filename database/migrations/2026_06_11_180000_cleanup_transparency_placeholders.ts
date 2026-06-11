import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Remove as seções de transparência criadas pelo seeder inicial de demonstração
 * (links apontando para "#"), que ficaram duplicadas com as seções reais
 * importadas do WordPress.
 */
export default class extends BaseSchema {
  /** Slugs criados pelo seeder de demonstração */
  private placeholderSlugs = [
    'receitas-despesas',
    'licitacoes-contratos',
    'pessoal',
    'legislacao',
    'planejamento',
    'prestacao-contas',
  ]

  async up() {
    this.defer(async (db) => {
      // Links de demonstração sem destino real
      await db.from('transparency_links').where('url', '#').delete()

      // Seções placeholder que ficaram sem nenhum link
      const sections = await db
        .from('transparency_sections')
        .whereIn('slug', this.placeholderSlugs)
        .select('id')

      for (const section of sections) {
        const [{ count }] = await db
          .from('transparency_links')
          .where('section_id', section.id)
          .count('* as count')
        if (Number(count) === 0) {
          await db.from('transparency_sections').where('id', section.id).delete()
        }
      }
    })
  }

  async down() {
    // Limpeza de dados; sem rollback
  }
}
