import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Remove links de Acesso à Informação (secao_id 2 do plugin WP links-rapidos)
 * que foram importados por engano na tabela quick_links.
 * Esses itens pertencem à seção Transparência / categorias PNTP na home.
 */
export default class extends BaseSchema {
  /** Títulos da secao_id 2 em migration_extra.json (lr_links) */
  private aiTitles = [
    'Concursos e Seleções Públicas',
    'Apreciação e/ou Julgamento',
    'Prestação de Contas da Gestão',
    'Obras',
    'Diárias',
    'Verbas Indenizatórias',
    'Relação de Estagiários',
    'Funcionários Terceirizados',
    'Relatório de Gestão',
    'Convênios e Transferências',
    'Parecer de Contas',
    'Estrutura Organizacional',
    'RGF',
    'Carta de Serviço',
    'Planos Anuais de Contratações',
    'Plano Estratégico',
    'Acordos Firmados',
  ]

  /** Slugs de destino típicos do Acesso à Informação (WP) */
  private aiUrlPatterns = [
    '/concursos',
    '/apreciacao',
    '/prestacao-de-contas',
    '/obras',
    '/diarias',
    '/verbas',
    '/estagiarios',
    '/terceirizados',
    '/relatoriogestao',
    '/convenio',
    '/parecer-contas',
    '/estrutura-organiza',
    '/rgf',
    '/carta-de-servicos',
    '/plano-contratacao',
    '/plano-estrategico',
    '/acordos',
  ]

  async up() {
    this.defer(async (db) => {
      const titleResult = await db
        .from('quick_links')
        .whereIn('title', this.aiTitles)
        .delete()
      const deletedByTitle = Array.isArray(titleResult) ? titleResult.length : Number(titleResult)

      let deletedByUrl = 0
      for (const pattern of this.aiUrlPatterns) {
        const result = await db.from('quick_links').where('url', 'like', `%${pattern}%`).delete()
        deletedByUrl += Array.isArray(result) ? result.length : Number(result)
      }

      if (deletedByTitle + deletedByUrl > 0) {
        console.log(
          `Quick links: removidos ${deletedByTitle} por título, ${deletedByUrl} por URL (Acesso à Informação)`
        )
      }
    })
  }

  async down() {
    // Limpeza de dados; sem rollback
  }
}
