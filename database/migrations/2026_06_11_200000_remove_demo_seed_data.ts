import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Remove o conteúdo de demonstração que o main_seeder antigo recriava a cada
 * boot em produção (a limpeza anterior era desfeita porque o db:seed rodava
 * logo após as migrations). O seeder foi corrigido neste mesmo deploy, então
 * esta limpeza agora é definitiva.
 */
export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      // 1. Transparência: links de demonstração ("#") e seções placeholder vazias
      await db.from('transparency_links').where('url', '#').delete()
      const placeholderSlugs = [
        'receitas-despesas',
        'licitacoes-contratos',
        'pessoal',
        'legislacao',
        'planejamento',
        'prestacao-contas',
      ]
      const sections = await db
        .from('transparency_sections')
        .whereIn('slug', placeholderSlugs)
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

      // 2. Diário Oficial: edições fictícias 100-104 criadas pelo seeder (sem arquivo)
      await db
        .from('official_gazette_entries')
        .whereIn('edition_number', ['100', '101', '102', '103', '104'])
        .whereNull('file_url')
        .whereIn('description', [
          'Diário Oficial - Edição 100',
          'Diário Oficial - Edição 101',
          'Diário Oficial - Edição 102',
          'Diário Oficial - Edição 103',
          'Diário Oficial - Edição 104',
        ])
        .delete()

      // 3. Notícias de demonstração (títulos exatos do seeder antigo, slug "noticia-N-timestamp")
      await db
        .from('news')
        .whereIn('title', [
          'Câmara de Sumé aprova projeto de modernização da administração pública',
          'Sessão solene marca abertura dos trabalhos legislativos de 2025',
          'Comissão de Finanças analisa proposta do orçamento municipal',
          'Portal da Transparência recebe atualização com novos indicadores',
          'Câmara promove evento sobre inclusão digital para idosos',
        ])
        .where('slug', 'like', 'noticia-%')
        .delete()

      // 4. Vereadores fictícios do seeder antigo (sem foto = nunca foram editados com dados reais)
      const fakeCouncilorSlugs = [
        'adriano-chaves',
        'antonio-inacio',
        'carlos-eduardo',
        'daniel-alves',
        'edvaldo-rosas',
        'fabiano-lima',
        'genival-santos',
        'helio-carneiro',
        'ivonete-sousa',
        'jose-carlos',
        'maria-do-socorro',
      ]
      await db
        .from('councilors')
        .whereIn('slug', fakeCouncilorSlugs)
        .whereNull('photo_url')
        .delete()
    })
  }

  async down() {
    // Limpeza de dados; sem rollback
  }
}
