import type { HttpContext } from '@adonisjs/core/http'
import FaqItem from '#models/faq_item'
import SystemCategory from '#models/system_category'
import SiteSetting from '#models/site_setting'

function textOnly(value: string | null | undefined) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const DEFAULT_PUBLIC_FAQS = [
  {
    question: 'Qual o horário de funcionamento da Câmara?',
    answer:
      'A Câmara Municipal de Sumé atende ao público de segunda a sexta-feira, das 8h às 14h, na sede localizada no Centro de Sumé - PB. Também é possível entrar em contato pelos canais oficiais publicados no portal.',
    category: 'sobre-a-camara',
  },
  {
    question: 'Quando e como ocorrem as sessões?',
    answer:
      'As sessões plenárias são públicas e acontecem conforme calendário definido pela Câmara. As pautas, atas e demais registros são publicados no portal para acompanhamento da população.',
    category: 'sessoes',
  },
  {
    question: 'Como posso acompanhar os projetos de lei?',
    answer:
      'Os projetos, requerimentos, indicações e demais matérias podem ser acompanhados na seção Atividades Legislativas. Nela é possível consultar o texto da matéria, data, autoria e documentos relacionados.',
    category: 'sessoes',
  },
  {
    question: 'Como posso participar das sessões?',
    answer:
      'As sessões são abertas ao público. O cidadão pode acompanhar presencialmente na Câmara e também consultar pautas, atas e publicações no portal. Para manifestações formais, utilize a Ouvidoria ou o e-SIC.',
    category: 'participacao',
  },
  {
    question: 'Quem são os membros da Mesa Diretora?',
    answer:
      'A composição da Mesa Diretora pode ser consultada na página Mesa Diretora e Vereadores, onde ficam disponíveis os parlamentares, cargos e informações da legislatura vigente.',
    category: 'sobre-a-camara',
  },
  {
    question: 'Qual é a função dos vereadores?',
    answer:
      'Os vereadores elaboram leis municipais, fiscalizam o Poder Executivo, discutem demandas da população, participam das comissões e votam matérias de interesse do município.',
    category: 'sobre-a-camara',
  },
  {
    question: 'Como posso fazer um pedido de informação?',
    answer:
      'Pedidos de informação podem ser feitos pelo e-SIC, canal previsto na Lei de Acesso à Informação. O cidadão não precisa justificar o pedido e receberá resposta dentro dos prazos legais.',
    category: 'lai',
  },
  {
    question: 'Onde encontro os gastos da Câmara?',
    answer:
      'As despesas, receitas, folha de pagamento, diárias, contratos, licitações e relatórios fiscais ficam disponíveis no Portal da Transparência, acessível pelo menu principal do site.',
    category: 'transparencia',
  },
  {
    question: 'Como consultar licitações e contratos?',
    answer:
      'As licitações ficam disponíveis na seção Licitações, com editais e documentos relacionados. Os contratos podem ser consultados na seção Contratos e também pelo Portal da Transparência.',
    category: 'transparencia',
  },
]

export default class FaqController {
  async index({ inertia }: HttpContext) {
    const items = await FaqItem.query()
      .where('is_active', true)
      .whereNull('deleted_at')
      .orderBy('category')
      .orderBy('display_order')
    const categories = await SystemCategory.byType('faq')
    const siteSettings = await SiteSetting.allAsObject()

    const faqs = items
      .filter((i) => textOnly(i.answer).length > 0)
      .map((i) => ({
        id: i.id,
        question: textOnly(i.question),
        answer: i.answer,
        category: i.category,
      }))

    const existingQuestions = new Set(faqs.map((i) => textOnly(i.question).toLowerCase()))
    for (const fallback of DEFAULT_PUBLIC_FAQS) {
      const key = textOnly(fallback.question).toLowerCase()
      if (!existingQuestions.has(key)) {
        faqs.push({
          id: -faqs.length - 1,
          question: fallback.question,
          answer: fallback.answer,
          category: fallback.category,
        })
      }
    }

    return inertia.render('public/faq/index', {
      faqs,
      categories: categories.map((c) => c.serialize()),
      siteSettings,
    })
  }
}
