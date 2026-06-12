import type { HttpContext } from '@adonisjs/core/http'
import InstitutionalContent from '#models/institutional_content'

/**
 * Entradas de conteúdo institucional editáveis pelo painel.
 * Os valores iniciais (seed) são exatamente os textos que estavam
 * hardcoded nas páginas públicas Sobre e História da Câmara — as
 * páginas públicas usam os mesmos textos como fallback.
 */
const DEFAULT_ENTRIES: { key: string; title: string; content: string; page: string }[] = [
  // ---- Sobre a Câmara ----
  {
    key: 'sobre_missao',
    title: 'Missão',
    content:
      'Representar os interesses da população, legislar com responsabilidade e fiscalizar o Poder Executivo.',
    page: 'Sobre a Câmara',
  },
  {
    key: 'sobre_visao',
    title: 'Visão',
    content: 'Ser referência em transparência e eficiência no Poder Legislativo municipal.',
    page: 'Sobre a Câmara',
  },
  {
    key: 'sobre_valores',
    title: 'Valores',
    content: 'Ética, transparência, compromisso social e respeito ao cidadão.',
    page: 'Sobre a Câmara',
  },
  {
    key: 'sobre_intro',
    title: 'O Poder Legislativo Municipal',
    content:
      'A Câmara Municipal de Sumé é o órgão do Poder Legislativo do município, responsável por elaborar leis, fiscalizar o Poder Executivo e representar os interesses da população sumeense.',
    page: 'Sobre a Câmara',
  },
  {
    key: 'sobre_atribuicoes',
    title: 'Atribuições',
    content:
      'Entre as principais atribuições da Câmara estão: elaborar leis municipais, aprovar o orçamento do município, fiscalizar a aplicação dos recursos públicos e garantir a transparência da gestão pública.',
    page: 'Sobre a Câmara',
  },
  // ---- História da Câmara ----
  {
    key: 'historia_intro',
    title: 'Introdução',
    content:
      'A Câmara Municipal de Sumé tem uma rica história que se confunde com o desenvolvimento do próprio município no Cariri Paraibano.',
    page: 'História da Câmara',
  },
  {
    key: 'historia_trajetoria',
    title: 'Nossa Trajetória',
    content:
      'Desde sua instalação em 1951, ano da emancipação política de Sumé, a Câmara Municipal tem sido palco de importantes decisões que moldaram o desenvolvimento do município.',
    page: 'História da Câmara',
  },
  {
    key: 'historia_poder_legislativo',
    title: 'O Poder Legislativo',
    content:
      'Composta atualmente por 9 vereadores eleitos democraticamente pela população, a Casa Legislativa trabalha na elaboração de leis, fiscalização do Executivo e representação dos interesses da comunidade.',
    page: 'História da Câmara',
  },
  {
    key: 'historia_transparencia',
    title: 'Compromisso com a Transparência',
    content:
      'A Câmara Municipal de Sumé preza pela transparência em todas as suas ações, disponibilizando informações sobre suas atividades legislativas, gastos públicos e decisões através deste Portal.',
    page: 'História da Câmara',
  },
]

export default class InstitutionalController {
  async index({ inertia }: HttpContext) {
    // Semeia (upsert por key) as entradas que ainda não existem no banco
    const existing = await InstitutionalContent.query().whereIn(
      'key',
      DEFAULT_ENTRIES.map((d) => d.key)
    )
    const existingKeys = new Set(existing.map((e) => e.key))
    const missing = DEFAULT_ENTRIES.filter((d) => !existingKeys.has(d.key))
    if (missing.length > 0) {
      const created = await InstitutionalContent.createMany(
        missing.map(({ key, title, content }) => ({ key, title, content }))
      )
      existing.push(...created)
    }

    const byKey = new Map(existing.map((e) => [e.key, e]))
    const entries = DEFAULT_ENTRIES.map((d) => {
      const row = byKey.get(d.key)!
      return {
        key: row.key,
        title: row.title,
        content: row.content,
        page: d.page,
        updated_at: row.updatedAt ? row.updatedAt.toISO() : null,
      }
    })

    return inertia.render('admin/institutional/index', { entries })
  }

  async update({ params, request, response, session }: HttpContext) {
    const entry = await InstitutionalContent.findByOrFail('key', params.key)
    const data = request.only(['title', 'content'])

    const title = String(data.title ?? '').trim()
    entry.merge({
      title: title || entry.title,
      content: String(data.content ?? ''),
    })
    await entry.save()

    session.flash('success', 'Conteúdo atualizado com sucesso!')
    return response.redirect().toPath('/painel/institucional')
  }
}
