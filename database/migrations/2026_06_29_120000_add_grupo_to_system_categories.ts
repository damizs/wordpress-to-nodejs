import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Dimensão/módulo das categorias do PNTP (Acesso à Informação).
 *
 * Adiciona em `system_categories`:
 *  - grupo (varchar null) → "dimensão" usada para agrupar as categorias na
 *    visão geral do admin (ex.: 'Recursos Humanos', 'Licitações e Contratos',
 *    'Institucional', 'Planejamento e Finanças', 'Diárias', etc.). É puramente
 *    organizacional — não afeta slugs nem páginas públicas.
 *
 * Idempotente: só adiciona a coluna se ainda não existe e só preenche o grupo
 * padrão das categorias canônicas onde ele ainda estiver vazio (não sobrescreve
 * ajustes feitos pelo administrador).
 */
export default class extends BaseSchema {
  protected tableName = 'system_categories'

  async up() {
    if (!(await this.schema.hasTable(this.tableName))) return

    const hasGrupo = await this.schema.hasColumn(this.tableName, 'grupo')
    if (!hasGrupo) {
      this.schema.alterTable(this.tableName, (table) => {
        table.string('grupo').nullable()
      })
    }

    // Dimensões padrão das categorias canônicas de Acesso à Informação.
    // Só preenche onde `grupo` ainda é nulo (seguro para reexecução / edição manual).
    this.defer(async (db) => {
      const defaults: Record<string, string> = {
        verbas: 'Recursos Humanos',
        estagiarios: 'Recursos Humanos',
        terceirizados: 'Recursos Humanos',
        concursos: 'Recursos Humanos',
        diarias: 'Diárias',
        acordos: 'Convênios e Transferências',
        'transferencias-recebidas': 'Convênios e Transferências',
        'transferencias-realizadas': 'Convênios e Transferências',
        pca: 'Licitações e Contratos',
        ocp: 'Licitações e Contratos',
        obras: 'Obras',
        rgf: 'Planejamento e Finanças',
        'relatorio-gestao': 'Planejamento e Finanças',
        'prestacao-contas': 'Planejamento e Finanças',
        'parecer-contas': 'Planejamento e Finanças',
        apreciacao: 'Planejamento e Finanças',
        'plano-estrategico': 'Planejamento e Finanças',
        'estrutura-organizacional': 'Institucional',
        'carta-servicos': 'Institucional',
      }

      for (const [slug, grupo] of Object.entries(defaults)) {
        await db
          .from(this.tableName)
          .where('type', 'information_record')
          .where('slug', slug)
          .whereNull('grupo')
          .update({ grupo })
      }
    })
  }

  async down() {
    if (!(await this.schema.hasTable(this.tableName))) return

    const hasGrupo = await this.schema.hasColumn(this.tableName, 'grupo')
    if (!hasGrupo) return

    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('grupo')
    })
  }
}
