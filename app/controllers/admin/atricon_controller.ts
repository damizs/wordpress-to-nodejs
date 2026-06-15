import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import AtriconStatus from '#models/atricon_status'
import AtriconSnapshot from '#models/atricon_snapshot'
import SiteSetting from '#models/site_setting'
import TransparencyLink from '#models/transparency_link'
import {
  ATRICON_CRITERIA,
  ATRICON_DIMENSIONS,
  CLASSIFICATION_WEIGHT,
  STATUS_CREDIT,
  criterionActionHref,
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

/* ============================== Utilitários de data/consulta ============================== */

function toDateTime(value: unknown): DateTime | null {
  if (!value) return null
  if (value instanceof Date) {
    const dt = DateTime.fromJSDate(value)
    return dt.isValid ? dt : null
  }
  const iso = DateTime.fromISO(String(value))
  if (iso.isValid) return iso
  const sql = DateTime.fromSQL(String(value))
  return sql.isValid ? sql : null
}

function fmtDate(value: unknown): string | null {
  const dt = toDateTime(value)
  return dt ? dt.toFormat('dd/MM/yyyy') : null
}

interface TableStats {
  total: number
  recent: number
  yearCount: number
  latest: DateTime | null
}

/**
 * Estatística verídica de uma tabela: total, registros desde `since`,
 * registros do ano corrente e data do registro mais recente.
 */
async function tableStats(
  table: string,
  dateExpr: string,
  since: string,
  yearStart: string,
  where?: (q: any) => any
): Promise<TableStats> {
  let query = db.from(table)
  if (where) query = where(query)
  const row = await query
    .select(db.raw('count(*) as total'))
    .select(db.raw(`count(case when ${dateExpr} >= ? then 1 end) as recent`, [since]))
    .select(db.raw(`count(case when ${dateExpr} >= ? then 1 end) as year_count`, [yearStart]))
    .select(db.raw(`max(${dateExpr}) as latest`))
    .first()
  return {
    total: Number(row?.total ?? 0),
    recent: Number(row?.recent ?? 0),
    yearCount: Number(row?.year_count ?? 0),
    latest: toDateTime(row?.latest),
  }
}

async function tableCount(table: string, where?: (q: any) => any): Promise<number> {
  let query = db.from(table)
  if (where) query = where(query)
  const row = await query.count('* as total').first()
  return Number(row?.total ?? 0)
}

/* ============================== Auto-verificações ============================== */

/** Resultado de uma verificação: ok (atende), parcial (há dados, mas desatualizados/incompletos) ou falha. */
export type AutoVerdict = 'ok' | 'parcial' | 'falha'

export interface AutoCheckResult {
  status: AutoVerdict
  detail: string
}

const ok = (detail: string): AutoCheckResult => ({ status: 'ok', detail })
const parcial = (detail: string): AutoCheckResult => ({ status: 'parcial', detail })
const falha = (detail: string): AutoCheckResult => ({ status: 'falha', detail })

/**
 * Regra de frescor das categorias de Acesso à Informação:
 * - continuo: precisa de registro do ano corrente (verbas, RGF, estagiários...)
 * - anual: documento do exercício anterior ainda vale (prestação de contas, pareceres...)
 * - atemporal: basta existir registro ativo (carta de serviços, plano estratégico...)
 */
const INFO_FRESHNESS: Record<string, 'continuo' | 'anual' | 'atemporal'> = {
  'verbas': 'continuo',
  'rgf': 'continuo',
  'estagiarios': 'continuo',
  'terceirizados': 'continuo',
  'transferencias-recebidas': 'continuo',
  'transferencias-realizadas': 'continuo',
  'acordos': 'continuo',
  'obras': 'continuo',
  'prestacao-contas': 'anual',
  'parecer-contas': 'anual',
  'relatorio-gestao': 'anual',
  'apreciacao': 'anual',
  'pca': 'anual',
  'concursos': 'anual',
  'plano-estrategico': 'atemporal',
  'estrutura-organizacional': 'atemporal',
  'carta-servicos': 'atemporal',
}

interface InfoCategoryStat {
  slug: string
  name: string
  total: number
  latestYear: number | null
}

/** Lê as categorias de Acesso à Informação e quantos registros ativos (e de que ano) cada uma tem. */
async function loadInfoCategories(): Promise<InfoCategoryStat[]> {
  const [categories, rows] = await Promise.all([
    db
      .from('system_categories')
      .where('type', 'information_record')
      .where('is_active', true)
      .orderBy('display_order')
      .select('name', 'slug'),
    db
      .from('information_records')
      .where('is_active', true)
      .select('category')
      .select(db.raw('count(*) as total'))
      .select(db.raw('max(year) as latest_year'))
      .groupBy('category'),
  ])
  const bySlug = new Map(rows.map((r: any) => [String(r.category), r]))
  return categories.map((c: any) => {
    const row = bySlug.get(c.slug)
    return {
      slug: c.slug,
      name: c.name,
      total: Number(row?.total ?? 0),
      latestYear: row?.latest_year ? Number(row.latest_year) : null,
    }
  })
}

function infoCheck(stat: InfoCategoryStat | undefined, slug: string, year: number): AutoCheckResult {
  const label = stat?.name ?? slug
  if (!stat || stat.total === 0) {
    return falha(`Nenhum registro de "${label}" cadastrado em Acesso à Informação`)
  }
  const rule = INFO_FRESHNESS[slug] ?? 'anual'
  const latest = stat.latestYear ?? 0
  const fresh = rule === 'atemporal' || (rule === 'anual' ? latest >= year - 1 : latest >= year)
  if (fresh) {
    return ok(`${stat.total} registro(s) de "${label}" — mais recente do exercício ${latest}`)
  }
  return parcial(
    `${stat.total} registro(s) de "${label}", porém o mais recente é do exercício ${latest} — publique o de ${rule === 'continuo' ? year : `${year - 1}/${year}`}`
  )
}

/**
 * Verificador inteligente: consulta os dados reais do portal e devolve, por chave,
 * um veredito (ok/parcial/falha) com evidência verídica (contagens e datas).
 * Checa frescor, não só existência: ano corrente para atas/pautas/votações,
 * 90 dias para licitações, 30 dias para notícias etc.
 */
async function runAutoChecks(): Promise<Record<string, AutoCheckResult>> {
  const now = DateTime.now()
  const year = now.year
  const yearStart = now.startOf('year').toFormat('yyyy-MM-dd')
  const d90 = now.minus({ days: 90 }).toFormat('yyyy-MM-dd')

  const [settings, links, infoCategories] = await Promise.all([
    SiteSetting.allAsObject(),
    TransparencyLink.query(),
    loadInfoCategories(),
  ])
  const linkTitles = links.map((l) => `${l.title}`.toLowerCase())
  const radarLink = linkTitles.some((t) => t.includes('radar'))

  const [
    councilors,
    publications,
    faq,
    licitacoes,
    licitacaoDocs,
    licitacoesSemDocs,
    contratoDocs,
    atas,
    pautas,
    committees,
    activities,
    surveys,
    transparencySections,
    mesaRow,
    votacoes,
  ] = await Promise.all([
    tableCount('councilors', (q) => q.where('is_active', true)),
    tableStats('official_publications', 'publication_date', d90, yearStart),
    tableCount('faq_items', (q) => q.where('is_active', true)),
    tableStats('licitacoes', 'coalesce(updated_at, created_at)', d90, yearStart, (q) =>
      q.where('is_active', true)
    ),
    tableCount('licitacao_documents'),
    tableCount('licitacoes', (q) =>
      q
        .where('is_active', true)
        .whereNotExists(
          db.from('licitacao_documents as d').whereColumn('d.licitacao_id', 'licitacoes.id')
        )
    ),
    tableCount('licitacao_documents', (q) => q.where('document_type', 'contrato')),
    tableStats('plenary_sessions', 'session_date', d90, yearStart, (q) =>
      q.where((w: any) => w.whereNotNull('minutes').orWhereNotNull('file_url'))
    ),
    tableStats('plenary_sessions', 'session_date', d90, yearStart, (q) =>
      q.whereNotNull('agenda')
    ),
    tableCount('committees', (q) => q.where('is_active', true)),
    db
      .from('legislative_activities')
      .where('is_active', true)
      .select(db.raw('count(*) as total'))
      .select(db.raw('count(case when year = ? then 1 end) as year_count', [year]))
      .select(db.raw('max(year) as latest_year'))
      .first(),
    tableStats('satisfaction_surveys', 'created_at', d90, yearStart),
    tableCount('transparency_sections', (q) => q.where('is_active', true)),
    db
      .from('councilor_positions as cp')
      .leftJoin('biennia as b', 'b.id', 'cp.biennium_id')
      .select(db.raw('count(*) as total'))
      .select(db.raw('count(case when b.is_current then 1 end) as current_count'))
      .first(),
    tableStats('nominal_votings', 'voting_date', d90, yearStart, (q) =>
      q.where('is_published', true)
    ),
  ])

  const mesaTotal = Number(mesaRow?.total ?? 0)
  const mesaCurrent = Number(mesaRow?.current_count ?? 0)
  const actTotal = Number(activities?.total ?? 0)
  const actYear = Number(activities?.year_count ?? 0)
  const actLatestYear = activities?.latest_year ? Number(activities.latest_year) : null

  const checks: Record<string, AutoCheckResult> = {
    always: ok('Recurso nativo do portal — disponível em todas as páginas'),

    transparency:
      transparencySections > 0 && links.length > 0
        ? ok(`${transparencySections} seções ativas e ${links.length} links publicados na transparência`)
        : transparencySections > 0
          ? parcial(`${transparencySections} seções ativas, porém nenhum link publicado na transparência`)
          : falha('Nenhuma seção ativa na transparência'),

    councilors:
      councilors > 0
        ? ok(`${councilors} vereadores ativos cadastrados`)
        : falha('Nenhum vereador ativo cadastrado'),

    mesaDiretora:
      mesaCurrent > 0
        ? ok(`${mesaCurrent} cargos da Mesa Diretora no biênio atual (${mesaTotal} no histórico)`)
        : mesaTotal > 0
          ? parcial(`${mesaTotal} cargos cadastrados, mas nenhum vinculado ao biênio atual`)
          : falha('Cadastre os cargos da Mesa Diretora no biênio atual'),

    contactSettings: Boolean(settings.footer_address && settings.footer_phone && settings.footer_email)
      ? ok('Endereço, telefone e e-mail configurados em Aparência')
      : falha('Configure endereço, telefone e e-mail em Aparência'),

    hoursSettings: settings.footer_hours
      ? ok(`Horário configurado: ${settings.footer_hours}`)
      : falha('Configure o horário de atendimento em Aparência'),

    socialSettings: Boolean(
      settings.social_facebook || settings.social_instagram || settings.social_youtube
    )
      ? ok('Redes sociais configuradas em Aparência')
      : falha('Configure ao menos uma rede social em Aparência'),

    radarLink: radarLink
      ? ok('Link do Radar da Transparência cadastrado na transparência')
      : falha('Cadastre o link do Radar da Transparência na transparência/capa'),

    publications:
      publications.total === 0
        ? falha('Nenhuma publicação oficial cadastrada')
        : publications.yearCount > 0
          ? ok(
              `${publications.total} publicações oficiais (${publications.yearCount} de ${year}; última em ${fmtDate(publications.latest)})`
            )
          : parcial(
              `${publications.total} publicações, mas nenhuma de ${year} — última em ${fmtDate(publications.latest)}`
            ),

    faq:
      faq > 0 ? ok(`${faq} perguntas frequentes ativas`) : falha('Nenhuma pergunta frequente ativa'),

    licitacoes:
      licitacoes.total === 0
        ? falha('Nenhuma licitação cadastrada')
        : licitacoes.recent > 0
          ? ok(
              `${licitacoes.total} licitações ativas; ${licitacoes.recent} atualizadas nos últimos 90 dias (última em ${fmtDate(licitacoes.latest)})`
            )
          : parcial(
              `${licitacoes.total} licitações, mas nenhuma atualização nos últimos 90 dias — última em ${fmtDate(licitacoes.latest)}`
            ),

    licitacaoDocs:
      licitacaoDocs === 0
        ? falha('Nenhum documento anexado a licitações')
        : licitacoesSemDocs > 0
          ? parcial(
              `${licitacaoDocs} documentos anexados, porém ${licitacoesSemDocs} licitação(ões) ativa(s) sem nenhum anexo`
            )
          : ok(`${licitacaoDocs} documentos anexados; todas as licitações ativas possuem anexos`),

    contratoDocs:
      contratoDocs > 0
        ? ok(`${contratoDocs} contratos anexados às licitações`)
        : falha('Nenhum contrato (tipo CONTRATO) anexado às licitações'),

    atas:
      atas.total === 0
        ? falha('Nenhuma sessão com ata ou arquivo publicado')
        : atas.yearCount > 0
          ? ok(
              `${atas.total} sessões com ata (${atas.yearCount} de ${year}; última em ${fmtDate(atas.latest)})`
            )
          : parcial(
              `${atas.total} sessões com ata, mas nenhuma de ${year} — última em ${fmtDate(atas.latest)}`
            ),

    pautas:
      pautas.total === 0
        ? falha('Nenhuma sessão com pauta publicada')
        : pautas.yearCount > 0
          ? ok(
              `${pautas.total} sessões com pauta (${pautas.yearCount} de ${year}; última em ${fmtDate(pautas.latest)})`
            )
          : parcial(
              `${pautas.total} sessões com pauta, mas nenhuma de ${year} — última em ${fmtDate(pautas.latest)}`
            ),

    committees:
      committees > 0 ? ok(`${committees} comissões ativas`) : falha('Nenhuma comissão ativa cadastrada'),

    activities:
      actTotal === 0
        ? falha('Nenhuma atividade legislativa cadastrada')
        : actYear > 0
          ? ok(`${actTotal} atividades legislativas (${actYear} de ${year})`)
          : parcial(
              `${actTotal} atividades, mas nenhuma de ${year} — mais recente do exercício ${actLatestYear}`
            ),

    survey:
      surveys.total === 0
        ? falha('Nenhuma resposta de pesquisa de satisfação registrada')
        : surveys.recent > 0
          ? ok(
              `${surveys.total} respostas de pesquisa (${surveys.recent} nos últimos 90 dias; última em ${fmtDate(surveys.latest)})`
            )
          : parcial(
              `${surveys.total} respostas, mas nenhuma nos últimos 90 dias — última em ${fmtDate(surveys.latest)}. Divulgue a pesquisa.`
            ),

    votacoes:
      votacoes.total === 0
        ? falha('Cadastre ou importe votações nominais no painel (Votações Nominais)')
        : votacoes.yearCount > 0
          ? ok(
              `${votacoes.total} votações nominais publicadas (${votacoes.yearCount} de ${year}; última em ${fmtDate(votacoes.latest)})`
            )
          : parcial(
              `${votacoes.total} votações publicadas, mas nenhuma de ${year} — última em ${fmtDate(votacoes.latest)}`
            ),
  }

  // Checagens das categorias de Acesso à Informação (info:<slug>)
  const statBySlug = new Map(infoCategories.map((c) => [c.slug, c]))
  const slugs = new Set<string>([
    ...infoCategories.map((c) => c.slug),
    ...Object.keys(INFO_FRESHNESS),
  ])
  for (const slug of slugs) {
    checks[`info:${slug}`] = infoCheck(statBySlug.get(slug), slug, year)
  }

  return checks
}

/* ============================== Matriz com precedência auto → manual ============================== */

const VERDICT_TO_STATUS: Record<AutoVerdict, AtriconStatusValue> = {
  ok: 'atendido',
  parcial: 'parcial',
  falha: 'pendente',
}

/**
 * Monta a matriz. Precedência do status efetivo:
 * 1. Critério com autoCheck e SEM registro manual → status da verificação em tempo real.
 * 2. Critério com autoCheck e COM registro manual → o manual vale (override explícito),
 *    sinalizado com `source: 'manual'` e `divergent` quando contradiz a verificação.
 * 3. Critério sem autoCheck → manual (ou padrão: externo/pendente).
 */
async function buildMatrix() {
  const [saved, auto, links] = await Promise.all([
    AtriconStatus.all(),
    runAutoChecks(),
    TransparencyLink.query(),
  ])
  const statusByCode = new Map(saved.map((s) => [s.criterionCode, s]))
  const checkedAt = DateTime.now().toISO()

  return ATRICON_CRITERIA.map((c) => {
    const record = statusByCode.get(c.code)
    const autoResult = (c.autoCheck && auto[c.autoCheck]) || null
    const autoStatus: AtriconStatusValue | null = autoResult
      ? VERDICT_TO_STATUS[autoResult.status]
      : null

    let status: AtriconStatusValue
    let source: 'auto' | 'manual' | 'padrao'
    if (autoStatus !== null) {
      if (record) {
        status = record.status
        source = 'manual'
      } else {
        status = autoStatus
        source = 'auto'
      }
    } else {
      status = record?.status ?? (c.external ? 'externo' : 'pendente')
      source = record ? 'manual' : 'padrao'
    }
    const divergent = source === 'manual' && autoStatus !== null && status !== autoStatus

    const matchedLinks = c.keywords
      ? links
          .filter((l) => c.keywords!.some((k) => l.title.toLowerCase().includes(k)))
          .map((l) => ({ title: l.title, url: l.url }))
          .slice(0, 3)
      : []

    return {
      ...c,
      status,
      source,
      autoStatus,
      divergent,
      evidenceUrl: record?.evidenceUrl ?? null,
      notes: record?.notes ?? null,
      lastUpdate: record?.updatedAt?.toISO() ?? null,
      auto: autoResult
        ? { status: autoResult.status, detail: autoResult.detail, checkedAt }
        : null,
      autoLinks: matchedLinks,
      actionHref: criterionActionHref(c),
    }
  })
}

type MatrixItem = Awaited<ReturnType<typeof buildMatrix>>[number]

/* ============================== Índice PNTP ============================== */

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
        sum +
        CLASSIFICATION_WEIGHT[c.classification] *
          (STATUS_CREDIT[c.status as AtriconStatusValue] ?? 0),
      0
    )
    const pct = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 100
    return {
      ...dim,
      total: items.length,
      met: items.filter((c) => c.status === 'atendido' || c.status === 'externo').length,
      partial: items.filter((c) => c.status === 'parcial').length,
      pending: items.filter((c) => c.status === 'pendente').length,
      notApplicable: items.filter((c) => c.status === 'nao_se_aplica').length,
      pct: Math.round(pct * 10) / 10,
    }
  })

  // Índice geral ponderado pelo peso das dimensões
  const weightSum = dimensions.reduce((s, d) => s + d.weight, 0)
  const index =
    Math.round((dimensions.reduce((s, d) => s + d.pct * d.weight, 0) / weightSum) * 10) / 10

  const essentials = matrix.filter((c) => c.classification === 'essencial')
  const allEssentialsMet = essentials.every(
    (c) => c.status === 'atendido' || c.status === 'externo'
  )

  return {
    dimensions,
    index,
    level: transparencyLevel(index, allEssentialsMet),
    allEssentialsMet,
    essentials: essentials.map((c) => ({
      code: c.code,
      title: c.title,
      status: c.status,
      source: c.source,
      actionHref: c.actionHref,
    })),
    totals: {
      criteria: matrix.length,
      met: matrix.filter((c) => c.status === 'atendido').length,
      external: matrix.filter((c) => c.status === 'externo').length,
      partial: matrix.filter((c) => c.status === 'parcial').length,
      pending: matrix.filter((c) => c.status === 'pendente').length,
      notApplicable: matrix.filter((c) => c.status === 'nao_se_aplica').length,
      autoChecked: matrix.filter((c) => c.auto !== null).length,
      manualOverrides: matrix.filter((c) => c.source === 'manual' && c.autoStatus !== null).length,
      divergent: matrix.filter((c) => c.divergent).length,
    },
  }
}

/* ============================== Mapa de Conteúdo do Portal ============================== */

export type Freshness = 'em_dia' | 'desatualizado' | 'vazio'

export interface ContentModule {
  key: string
  label: string
  adminHref: string
  total: number
  latest: string | null
  freshness: Freshness
  detail: string
}

function freshnessOf(
  total: number,
  latest: DateTime | null,
  thresholdDays: number | null
): Freshness {
  if (total === 0) return 'vazio'
  if (thresholdDays === null) return 'em_dia' // módulo cadastral: basta existir
  if (!latest) return 'desatualizado'
  return latest >= DateTime.now().minus({ days: thresholdDays }) ? 'em_dia' : 'desatualizado'
}

/**
 * Mapeamento em tempo real, módulo a módulo: total de registros, registro mais
 * recente e status de frescor (em dia / desatualizado / vazio), com link direto
 * para o módulo do painel que resolve.
 */
async function buildContentMap(): Promise<ContentModule[]> {
  const now = DateTime.now()
  const year = now.year
  const yearStart = now.startOf('year').toFormat('yyyy-MM-dd')
  const d90 = now.minus({ days: 90 }).toFormat('yyyy-MM-dd')
  const d30 = now.minus({ days: 30 }).toFormat('yyyy-MM-dd')

  const [
    noticias,
    atas,
    pautas,
    licitacoes,
    atividades,
    votacoes,
    publicacoes,
    diario,
    transparenciaLinks,
    transparenciaSecoes,
    infoCategories,
    faqStats,
    vereadores,
    comissoes,
  ] = await Promise.all([
    tableStats('news', 'published_at', d30, yearStart, (q) => q.where('status', 'published')),
    tableStats('plenary_sessions', 'session_date', d90, yearStart, (q) =>
      q.where((w: any) => w.whereNotNull('minutes').orWhereNotNull('file_url'))
    ),
    tableStats('plenary_sessions', 'session_date', d90, yearStart, (q) =>
      q.whereNotNull('agenda')
    ),
    tableStats('licitacoes', 'coalesce(updated_at, created_at)', d90, yearStart, (q) =>
      q.where('is_active', true)
    ),
    tableStats(
      'legislative_activities',
      'coalesce(session_date, created_at)',
      d90,
      yearStart,
      (q) => q.where('is_active', true)
    ),
    tableStats('nominal_votings', 'voting_date', d90, yearStart, (q) =>
      q.where('is_published', true)
    ),
    tableStats('official_publications', 'publication_date', d90, yearStart),
    tableStats('official_gazette_entries', 'publication_date', d90, yearStart),
    tableStats('transparency_links', 'coalesce(updated_at, created_at)', d90, yearStart),
    tableCount('transparency_sections', (q) => q.where('is_active', true)),
    loadInfoCategories(),
    tableStats('faq_items', 'coalesce(updated_at, created_at)', d90, yearStart, (q) =>
      q.where('is_active', true)
    ),
    tableStats('councilors', 'coalesce(updated_at, created_at)', d90, yearStart, (q) =>
      q.where('is_active', true)
    ),
    tableStats('committees', 'coalesce(updated_at, created_at)', d90, yearStart, (q) =>
      q.where('is_active', true)
    ),
  ])

  // Categorias de acesso à informação: com registros do ano corrente vs vazias
  const withCurrentYear = infoCategories.filter((c) => (c.latestYear ?? 0) >= year)
  const emptyCategories = infoCategories.filter((c) => c.total === 0)
  const infoTotal = infoCategories.reduce((s, c) => s + c.total, 0)
  const infoLatestYear = infoCategories.reduce<number | null>(
    (max, c) => (c.latestYear !== null && (max === null || c.latestYear > max) ? c.latestYear : max),
    null
  )
  const emptyList =
    emptyCategories.length > 0
      ? `Vazias: ${emptyCategories
          .slice(0, 6)
          .map((c) => c.name)
          .join(', ')}${emptyCategories.length > 6 ? ` e mais ${emptyCategories.length - 6}` : ''}`
      : 'Todas as categorias possuem registros'
  const infoFreshness: Freshness =
    infoTotal === 0 ? 'vazio' : withCurrentYear.length > 0 && emptyCategories.length === 0 ? 'em_dia' : 'desatualizado'

  const mod = (
    key: string,
    label: string,
    adminHref: string,
    stats: TableStats,
    thresholdDays: number | null,
    detail: string
  ): ContentModule => ({
    key,
    label,
    adminHref,
    total: stats.total,
    latest: stats.latest?.toISODate() ?? null,
    freshness: freshnessOf(stats.total, stats.latest, thresholdDays),
    detail,
  })

  return [
    mod(
      'noticias',
      'Notícias',
      '/painel/noticias',
      noticias,
      30,
      `${noticias.recent} publicadas nos últimos 30 dias; ${noticias.yearCount} em ${year}`
    ),
    mod(
      'atas',
      'Atas das sessões',
      '/painel/sessoes',
      atas,
      90,
      `${atas.yearCount} sessões com ata em ${year}`
    ),
    mod(
      'pautas',
      'Pautas das sessões',
      '/painel/sessoes',
      pautas,
      90,
      `${pautas.yearCount} sessões com pauta em ${year}`
    ),
    mod(
      'licitacoes',
      'Licitações',
      '/painel/licitacoes',
      licitacoes,
      90,
      `${licitacoes.recent} com atualização nos últimos 90 dias`
    ),
    mod(
      'atividades',
      'Atividades legislativas',
      '/painel/atividades',
      atividades,
      90,
      `${atividades.yearCount} movimentações em ${year}`
    ),
    mod(
      'votacoes',
      'Votações nominais',
      '/painel/votacoes',
      votacoes,
      90,
      `${votacoes.yearCount} votações publicadas em ${year}`
    ),
    mod(
      'publicacoes',
      'Publicações oficiais',
      '/painel/publicacoes',
      publicacoes,
      90,
      `${publicacoes.yearCount} publicadas em ${year}`
    ),
    mod(
      'diario',
      'Diário Oficial',
      '/diario-oficial',
      diario,
      90,
      `${diario.recent} edições nos últimos 90 dias`
    ),
    mod(
      'transparencia',
      'Transparência (links)',
      '/painel/transparencia',
      transparenciaLinks,
      null,
      `${transparenciaSecoes} seções ativas, ${transparenciaLinks.total} links`
    ),
    {
      key: 'acesso-informacao',
      label: 'Acesso à Informação',
      adminHref: '/painel/acesso-informacao',
      total: infoTotal,
      latest: infoLatestYear !== null ? `${infoLatestYear}-12-31` : null,
      freshness: infoFreshness,
      detail: `${withCurrentYear.length} de ${infoCategories.length} categorias com registros de ${year}. ${emptyList}`,
    },
    mod('faq', 'Perguntas frequentes', '/painel/faq', faqStats, null, `${faqStats.total} perguntas ativas`),
    mod(
      'vereadores',
      'Vereadores',
      '/painel/vereadores',
      vereadores,
      null,
      `${vereadores.total} vereadores ativos`
    ),
    mod(
      'comissoes',
      'Comissões',
      '/painel/comissoes',
      comissoes,
      null,
      `${comissoes.total} comissões ativas`
    ),
  ]
}

/* ============================== Snapshots (evolução do índice) ============================== */

type Scores = ReturnType<typeof computeScores>

/** Salva no máximo 1 snapshot por dia e devolve a série para o gráfico de evolução. */
async function snapshotAndLoad(scores: Scores) {
  const last = await AtriconSnapshot.query().orderBy('created_at', 'desc').first()
  const today = DateTime.now().startOf('day')
  if (!last || last.createdAt < today) {
    await AtriconSnapshot.create({
      index: scores.index,
      level: scores.level,
      dimensions: scores.dimensions.map((d) => ({ key: d.key, label: d.label, pct: d.pct })),
      totals: {
        criteria: scores.totals.criteria,
        met: scores.totals.met,
        external: scores.totals.external,
        partial: scores.totals.partial,
        pending: scores.totals.pending,
        notApplicable: scores.totals.notApplicable,
      },
    })
  }
  const rows = await AtriconSnapshot.query().orderBy('created_at', 'desc').limit(60)
  return rows
    .reverse()
    .map((s) => ({ date: s.createdAt.toISODate(), index: s.index, level: s.level }))
}

/* ============================== Relatório / quinzena ============================== */

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
    const [matrix, contentMap, atriconLogoUrl] = await Promise.all([
      buildMatrix(),
      buildContentMap(),
      SiteSetting.getValue('atricon_logo_url'),
    ])
    const scores = computeScores(matrix)
    const snapshots = await snapshotAndLoad(scores)
    return inertia.render('admin/atricon/index', {
      matrix,
      scores,
      contentMap,
      snapshots,
      atriconLogoUrl: atriconLogoUrl || null,
      checkedAt: DateTime.now().toISO(),
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

    const status = request.input('status') as AtriconStatusValue | 'auto'

    // "auto" remove o override manual: o critério volta a seguir a verificação automática
    if (status === 'auto') {
      if (!criterion.autoCheck) {
        session.flash('error', 'Este critério não possui verificação automática.')
        return response.redirect().back()
      }
      await AtriconStatus.query().where('criterion_code', code).delete()
      session.flash('success', `Critério ${code} voltou a seguir a verificação automática.`)
      return response.redirect().toPath('/painel/atricon')
    }

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

    session.flash(
      'success',
      criterion.autoCheck
        ? `Critério ${code} atualizado (override manual sobre a verificação automática).`
        : `Critério ${code} atualizado.`
    )
    return response.redirect().toPath('/painel/atricon')
  }

  /** Relatório quinzenal de pendências (imprimível ou CSV), com os status efetivos. */
  async report({ inertia, request, response }: HttpContext) {
    const matrix = await buildMatrix()
    const scores = computeScores(matrix)
    const fortnight = currentFortnight(DateTime.now())
    const atriconLogoUrl = (await SiteSetting.getValue('atricon_logo_url')) || null

    const pendings = matrix
      .filter((c) => c.status === 'pendente' || c.status === 'parcial')
      .map((c) => ({
        code: c.code,
        dimension: ATRICON_DIMENSIONS.find((d) => d.key === c.dimension)?.label ?? c.dimension,
        title: c.title,
        classification: c.classification,
        status: c.status,
        source: c.source,
        hint: c.hint,
        notes: c.notes,
        autoDetail: c.auto?.detail ?? null,
        actionHref: c.actionHref,
      }))

    if (request.input('format') === 'csv') {
      const esc = (v: string) => `"${(v || '').replace(/"/g, '""')}"`
      const rows = [
        [
          'Critério',
          'Dimensão',
          'Exigência',
          'Classificação',
          'Situação',
          'Origem',
          'Verificação automática',
          'Como atender',
          'Observações',
        ].join(';'),
        ...pendings.map((p) =>
          [
            p.code,
            esc(p.dimension),
            esc(p.title),
            p.classification,
            p.status,
            p.source === 'auto' ? 'automática' : p.source === 'manual' ? 'manual' : 'padrão',
            esc(p.autoDetail ?? ''),
            esc(p.hint),
            esc(p.notes ?? ''),
          ].join(';')
        ),
      ]
      response.header('Content-Type', 'text/csv; charset=utf-8')
      response.header(
        'Content-Disposition',
        `attachment; filename="pendencias-pntp-${DateTime.now().toFormat('yyyy-MM-dd')}.csv"`
      )
      // BOM para o Excel reconhecer UTF-8
      return response.send('﻿' + rows.join('\n'))
    }

    return inertia.render('admin/atricon/report', {
      pendings,
      scores,
      fortnight,
      atriconLogoUrl,
      generatedAt: DateTime.now().setLocale('pt-BR').toFormat("dd/MM/yyyy 'às' HH:mm"),
    })
  }
}
