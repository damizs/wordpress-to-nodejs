import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Garante as categorias canonicas de Acesso a Informacao usadas no PNTP.
 *
 * Diferente do seeder inicial, esta migration roda tambem em bases ja
 * populadas. Nao remove registros nem sobrescreve documentos cadastrados.
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      const now = new Date()
      const categories = [
        { name: 'Diárias', slug: 'diarias', display_order: 18 },
        { name: 'Ordem Cronológica de Pagamentos', slug: 'ocp', display_order: 19 },
        { name: 'Carta de Serviços', slug: 'carta-servicos', display_order: 20 },
      ]

      for (const category of categories) {
        const existing = await db
          .from('system_categories')
          .where('type', 'information_record')
          .where('slug', category.slug)
          .first()

        if (existing) {
          await db
            .from('system_categories')
            .where('id', existing.id)
            .update({ is_active: true, updated_at: now })
          continue
        }

        await db.table('system_categories').insert({
          type: 'information_record',
          name: category.name,
          slug: category.slug,
          display_order: category.display_order,
          is_active: true,
          created_at: now,
          updated_at: now,
        })
      }
    })
  }

  async down() {
    // Migration de dados: nao remove categorias para evitar quebrar registros
    // ja vinculados a esses slugs.
  }
}
