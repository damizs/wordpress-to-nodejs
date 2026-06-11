import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import AtriconStatus from '#models/atricon_status'
import SiteSetting from '#models/site_setting'
import TransparencyLink from '#models/transparency_link'
import {
  ATRICON_CRITERIA,
  ATRICON_DIMENSIONS,
  CLASSIFICATION_WEIGHT,
  STATUS_CREDIT,
  transparencyLevel,
  type AtriconStatusValue,
} from '#helpers/atricon_matrix'

const VALID_STATUSES: AtriconStatusValue[] = [
  'atendido',
  'parcial',
  'pendente',
  'externo',
  'nao_se_aplica',
]

async function tableCount(table: string, where?: (q: any) => any): Promise<number> {
  let query = db.from(table)
  if (where) query = where(query)
  const row = await query.count('* as total').first()
  return Number(row?.total ?? 0)
}

/**
 * Auto-detecção: verifica nos dados do sistema se há evidência de atendimento
 * de cada critério. Retorna um mapa autoCheckKey → { ok, detail }.
 */
async function runAutoChecks(): Promise<Record<string, { ok: boolean; detail: string }>> {
  const settings = await SiteSetting.allAsObject()
  const links = await TransparencyLink.query()
  const linkTitles = links.map((l) => `${l.title}`.toLowerCase())

  const [
    councilors,
    publications,
    faq,
    licitacoes,
    licitacaoDocs,
    contratoDocs,
    atas,
    pautas,
    committees,
    activities,
    surveys,
    transparencySections,
    mesaPositions,
  ] = await Promise.all([
    tableCount('councilors', (q) => q.where('is_active', true)),
    tableCount('official_publications'),
    tableCount('faq_items', (q) => q.where('is_active', true)),
    tableCount('licitacoes', (q) => q.where('is_active', true)),
    tableCount('licitacao_documents'),
    tableCount('licitacao_documents', (q) => q.where('document_type', 'contrato')),
    tableCount('plenary_sessions', (q) => q.whereNotNull('minutes').orWhereNotNull('file_url')),
    tableCount('plenary_sessions', (q) => q.whereNotNull('agenda')),
    tableCount('committees', (q) => q.where('is_active', true)),
    tableCount('legislative_activities', (q) => q.where('is_active', true)),
    tableCount('satisfaction_surveys'),
    tableCount('transparency_sections', (q) => q.where('is_active', true)),
    tableCount('councilor_positions'),
  ])

  const has = (n: number) => n > 0
  const radarLink = linkTitles.some((t) => t.includes('radar'))

  return {
    always: { ok: true, detail: 'Recurso nativo do portal' },
    transparency: {
      ok: has(transparencySections),
      detail: `${transparencySections} seções ativas na transparência`,
    },
    councilors: { ok: has(councilors), detail: `${councilors} vereadores ativos cadastrados` },
    mesaDiretora: {
      ok: has(mesaPositions),
      detail: has(mesaPositions)
        ? `${mesaPositions} cargos da Mesa Diretora cadastrados`
        : 'Cadastre os cargos da Mesa Diretora no biênio atual',
    },
    contactSettings: {
      ok: Boolean(settings.footer_address && settings.footer_phone && settings.footer_email),
      detail: 'Endereço, telefone e e-mail configurados em Aparência',
    },
    hoursSettings: {
      ok: Boolean(settings.footer_hours),
      detail: settings.footer_hours
        ? `Horário configurado: ${settings.footer_hours}`
        : 'Configure o horário de atendimento em Aparência',
    },
    socialSettings: {
      ok: Boolean(settings.social_facebook || settings.social_instagram || settings.social_youtube),
      detail: 'Redes sociais configuradas em Aparência',
    },
    radarLink: {
      ok: radarLink,
      detail: radarLink
        ? 'Link do Radar cadastrado na transparência'
        : 'Cadastre o link do Radar da Transparência na transparência/capa',
    },
    publications: { ok: has(publications), detail: `${publications} publicações oficiais` },
    faq: { ok: has(faq), detail: `${faq} perguntas frequentes ativas` },
    licitacoes: { ok: has(licitacoes), detail: `${licitacoes} licitações cadastradas` },
    licitacaoDocs: { ok: has(licitacaoDocs), detail: `${licitacaoDocs} documentos anexados a licitações` },
    contratoDocs: { ok: has(contratoDocs), detail: `${contratoDocs} contratos anexados` },
    atas: { ok: has(atas), detail: `${atas} sessões com ata/arquivo` },
    pautas: { ok: has(pautas), detail: `${pautas} sessões com pauta` },
    committees: { ok: has(committees), detail: `${committees} comissões ativas` },
    activities: { ok: has(activities), detail: `${activities} atividades legislativas` },
    survey: { ok: has(surveys), detail: `${surveys} respostas de pesquisa de satisfação` },
  }
}

/** Monta a matriz com status salvos, auto-detecção e evidências de links. */
async function buildMatrix() {
  const [saved, auto, links] = await Promise.all([
    AtriconStatus.all(),
    runAutoChecks(),
    TransparencyLink.query(),
  ])
  const statusByCode = new Map(saved.map((s) => [s.criterionCode, s]))

  return ATRICON_CRITERIA.map((c) => {
    const record = statusByCode.get(c.code)
    // Status padrão: externo para itens do sistema externo, pendente para o resto
    const status: AtriconStatusValue = record?.status ?? (c.external ? 'externo' : 'pendente')

    const autoResult = c.autoCheck ? auto[c.autoCheck] : null
    const matchedLinks = c.keywords
      ? links
          .filter((l) => c.keywords!.some((k) => l.title.toLowerCase().includes(k)))
          .map((l) => ({ title: l.title, url: l.url }))
          .slice(0, 3)
      : []

    return {
      ...c,
      status,
      evidenceUrl: record?.evidenceUrl ?? null,
      notes: record?.notes ?? null,
      lastUpdate: record?.updatedAt?.toISO() ?? null,
      auto: autoResult ? { ok: autoResult.ok, detail: autoResult.detail } : null,
      autoLinks: matchedLinks,
    }
  })
}

type MatrixItem = Awaited<ReturnType<typeof buildMatrix>>[number]

/** Índice PNTP: pesos por dimensão e por classificação do critério. */
function computeScores(matrix: MatrixItem[]) {
  const dimensions = ATRICON_DIMENSIONS.map((dim) => {
    const items = matrix.filter((c) => c.dimension === dim.key)
    const considered = items.filter((c) => STATUS_CREDIT[c.status as AtriconStatusValue] !== null)
    const totalWeight = considered.reduce(
      (sum, c) => sum + CLASSIFICATION_WEIGHT[c.classification],
      0
    )
    const earnedWeight = considered.reduce(
      (sum, c) =>
        sum + CLASSIFICATION_WEIGHT[c.classification] * (STATUS_CREDIT[c.status as AtriconStatusValue] ?? 0),
      0
    )
    const pct = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 100
    return {
      ...dim,
      total: items.length,
      met: items.filter((c) => c.status === 'atendido' || c.status === 'externo').length,
      partial: items.filter((c) => c.status === 'parcial').length,
      pending: items.filter((c) => c.status === 'pendente').length,
      pct: Math.round(pct * 10) / 10,
    }
  })

  // Índice geral ponderado pelo peso das dimensões
  const weightSum = dimensions.reduce((s, d) => s + d.weight, 0)
  const index =
    Math.round(dimensions.reduce((s, d) => s + d.pct * d.weight, 0) / weightSum * 10) / 10

  const essentials = matrix.filter((c) => c.classification === 'essencial')
  const allEssentialsMet = essentials.every(
    (c) => c.status === 'atendido' || c.status === 'externo'
  )

  return {
    dimensions,
    index,
    level: transparencyLevel(index, allEssentialsMet),
    allEssentialsMet,
    essentials: essentials.map((c) => ({ code: c.code, title: c.title, status: c.status })),
    totals: {
      criteria: matrix.length,
      met: matrix.filter((c) => c.status === 'atendido').length,
      external: matrix.filter((c) => c.status === 'externo').length,
      partial: matrix.filter((c) => c.status === 'parcial').length,
      pending: matrix.filter((c) => c.status === 'pendente').length,
      notApplicable: matrix.filter((c) => c.status === 'nao_se_aplica').length,
    },
  }
}

function currentFortnight(now: DateTime) {
  const half = now.day <= 15 ? 1 : 2
  const start = half === 1 ? now.set({ day: 1 }) : now.set({ day: 16 })
  const end = half === 1 ? now.set({ day: 15 }) : now.endOf('month')
  return {
    label: `${half}ª quinzena de ${now.setLocale('pt-BR').toFormat('LLLL/yyyy')}`,
    start: start.toFormat('dd/MM/yyyy'),
    end: end.toFormat('dd/MM/yyyy'),
  }
}

export default class AtriconController {
  async index({ inertia }: HttpContext) {
    const matrix = await buildMatrix()
    const scores = computeScores(matrix)
    return inertia.render('admin/atricon/index', {
      matrix,
      scores,
      fortnight: currentFortnight(DateTime.now()),
    })
  }

  async updateStatus({ params, request, response, session, auth }: HttpContext) {
    const code = params.code
    const criterion = ATRICON_CRITERIA.find((c) => c.code === code)
    if (!criterion) {
      session.flash('error', 'Critério não encontrado.')
      return response.redirect().back()
    }

    const status = request.input('status') as AtriconStatusValue
    if (!VALID_STATUSES.includes(status)) {
      session.flash('error', 'Status inválido.')
      return response.redirect().back()
    }

    const evidenceUrl = request.input('evidence_url') || null
    const notes = request.input('notes') || null

    await AtriconStatus.updateOrCreate(
      { criterionCode: code },
      { status, evidenceUrl, notes, updatedBy: auth.user?.id ?? null }
    )

    session.flash('success', `Critério ${code} atualizado.`)
    return response.redirect().toPath('/painel/atricon')
  }

  /** Relatório quinzenal de pendências (imprimível ou CSV). */
  async report({ inertia, request, response }: HttpContext) {
    const matrix = await buildMatrix()
    const scores = computeScores(matrix)
    const fortnight = currentFortnight(DateTime.now())

    const pendings = matrix
      .filter((c) => c.status === 'pendente' || c.status === 'parcial')
      .map((c) => ({
        code: c.code,
        dimension: ATRICON_DIMENSIONS.find((d) => d.key === c.dimension)?.label ?? c.dimension,
        title: c.title,
        classification: c.classification,
        status: c.status,
        hint: c.hint,
        notes: c.notes,
      }))

    if (request.input('format') === 'csv') {
      const esc = (v: string) => `"${(v || '').replace(/"/g, '""')}"`
      const rows = [
        ['Critério', 'Dimensão', 'Exigência', 'Classificação', 'Situação', 'Como atender', 'Observações'].join(';'),
        ...pendings.map((p) =>
          [p.code, esc(p.dimension), esc(p.title), p.classification, p.status, esc(p.hint), esc(p.notes ?? '')].join(';')
        ),
      ]
      response.header('Content-Type', 'text/csv; charset=utf-8')
      response.header(
        'Content-Disposition',
        `attachment; filename="pendencias-pntp-${DateTime.now().toFormat('yyyy-MM-dd')}.csv"`
      )
      // BOM para o Excel reconhecer UTF-8
      return response.send('\uFEFF' + rows.join('\n'))
    }

    return inertia.render('admin/atricon/report', {
      pendings,
      scores,
      fortnight,
      generatedAt: DateTime.now().setLocale('pt-BR').toFormat("dd/MM/yyyy 'às' HH:mm"),
    })
  }
}
