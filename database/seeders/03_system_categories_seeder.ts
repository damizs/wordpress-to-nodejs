import { BaseSeeder } from '@adonisjs/lucid/seeders'
import SystemCategory from '#models/system_category'

export default class extends BaseSeeder {
  async run() {
    // Only seed if empty
    const count = await SystemCategory.query().count('* as total')
    if (Number(count[0].$extras.total) > 0) return

    const categories = [
      // FAQ categories
      { type: 'faq', name: 'LAI', slug: 'lai', displayOrder: 1 },
      { type: 'faq', name: 'Transparência', slug: 'transparencia', displayOrder: 2 },
      { type: 'faq', name: 'Sessões', slug: 'sessoes', displayOrder: 3 },
      { type: 'faq', name: 'Participação', slug: 'participacao', displayOrder: 4 },
      { type: 'faq', name: 'Sobre a Câmara', slug: 'sobre-a-camara', displayOrder: 5 },

      // Information record categories
      { type: 'information_record', name: 'Verbas Indenizatórias', slug: 'verbas', displayOrder: 1 },
      { type: 'information_record', name: 'Estagiários', slug: 'estagiarios', displayOrder: 2 },
      { type: 'information_record', name: 'Terceirizados', slug: 'terceirizados', displayOrder: 3 },
      { type: 'information_record', name: 'RGF', slug: 'rgf', displayOrder: 4 },
      { type: 'information_record', name: 'Relatório de Gestão', slug: 'relatorio-gestao', displayOrder: 5 },
      { type: 'information_record', name: 'Prestação de Contas', slug: 'prestacao-contas', displayOrder: 6 },
      { type: 'information_record', name: 'Transferências Recebidas', slug: 'transferencias-recebidas', displayOrder: 7 },
      { type: 'information_record', name: 'Transferências Realizadas', slug: 'transferencias-realizadas', displayOrder: 8 },
      { type: 'information_record', name: 'Parecer de Contas', slug: 'parecer-contas', displayOrder: 9 },
      { type: 'information_record', name: 'Obras', slug: 'obras', displayOrder: 10 },
      { type: 'information_record', name: 'Acordos e Convênios', slug: 'acordos', displayOrder: 11 },
      { type: 'information_record', name: 'Apreciação', slug: 'apreciacao', displayOrder: 12 },
      { type: 'information_record', name: 'Plano Estratégico', slug: 'plano-estrategico', displayOrder: 13 },
      { type: 'information_record', name: 'Concursos', slug: 'concursos', displayOrder: 14 },
      { type: 'information_record', name: 'PCA', slug: 'pca', displayOrder: 15 },
      { type: 'information_record', name: 'Estrutura Organizacional', slug: 'estrutura-organizacional', displayOrder: 16 },
      { type: 'information_record', name: 'Carta de Serviços', slug: 'carta-servicos', displayOrder: 17 },

      // Publication types
      { type: 'publication', name: 'Portarias', slug: 'portarias', displayOrder: 1 },
      { type: 'publication', name: 'Decretos', slug: 'decretos', displayOrder: 2 },
      { type: 'publication', name: 'Resoluções', slug: 'resolucoes', displayOrder: 3 },
      { type: 'publication', name: 'Leis', slug: 'leis', displayOrder: 4 },
      { type: 'publication', name: 'Atos', slug: 'atos', displayOrder: 5 },
      { type: 'publication', name: 'Contratos', slug: 'contratos', displayOrder: 6 },
      { type: 'publication', name: 'Editais', slug: 'editais', displayOrder: 7 },
      { type: 'publication', name: 'Outros', slug: 'outros', displayOrder: 8 },

      // Session types
      { type: 'session_type', name: 'Ordinária', slug: 'ordinaria', displayOrder: 1 },
      { type: 'session_type', name: 'Extraordinária', slug: 'extraordinaria', displayOrder: 2 },
      { type: 'session_type', name: 'Solene', slug: 'solene', displayOrder: 3 },
      { type: 'session_type', name: 'Especial', slug: 'especial', displayOrder: 4 },
    ]

    await SystemCategory.createMany(categories)
  }
}
