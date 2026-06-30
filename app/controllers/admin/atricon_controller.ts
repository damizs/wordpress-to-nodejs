import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import AtriconStatus from '#models/atricon_status'
import AtriconSnapshot from '#models/atricon_snapshot'
import SiteSetting from '#models/site_setting'
import TransparencyLink from '#models/transparency_link'
import TransparencySection from '#models/transparency_section'
import {
  ATRICON_CRITERIA,
  ATRICON_DIMENSIONS,
  CLASSIFICATION_WEIGHT,
  STATUS_CREDIT,
  MET_STATUSES,
  SUBDIM_LABEL,
  SUBDIM_WEIGHT,
  criterionActionHref,
  requiredSubdims,
  transparencyLevel,
  type AtriconCriterion,
  type AtriconStatusValue,
  type AtriconSubdim,
} from '#helpers/atricon_matrix'
import TransparencyAuditService, { FRESHNESS_DAYS } from '#services/transparency_audit_service'

const VALID_STATUSES: AtriconStatusValue[] = [
  'atendido',
  'parcial',
  'pendente',
  'externo',
  'nao_se_aplica',
  'nao_ocorre',
]

/**
 * Validade de um override manual divergente: passados N dias em que o override
 * ainda contradiz a verificação automática, o critério é sinalizado como "revisar"
 * (GAP de confiabilidade). NÃO apaga o override — apenas pede reconferência, pois
 * uma divergência antiga costuma indicar que a auto-checagem mudou desde a edição.
 */
const OVERRIDE_REVIEW_DAYS = 90

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

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function hasUsefulUrl(value: unknown): boolean {
  const text = String(value ?? '').trim()
  return text !== '' && text !== '#'
}

interface TableStats {
  total: number
  recent: number
  yearCount: number
  /** Quantidade de exercícios (anos) distintos com registro — base para a Série Histórica (H). */
  distinctYears: number
  latest: DateTime | null
}

/**
 * Estatística verídica de uma tabela: total, registros desde `since`,
 * registros do ano corrente, nº de exercícios distintos e data do registro mais recente.
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
    .select(db.raw(`count(distinct extract(year from ${dateExpr})) as distinct_years`))
    .select(db.raw(`max(${dateExpr}) as latest`))
    .first()
  return {
    total: Number(row?.total ?? 0),
    recent: Number(row?.recent ?? 0),
    yearCount: Number(row?.year_count ?? 0),
    distinctYears: Number(row?.distinct_years ?? 0),
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

/** Veredito automático por subdimensão (apenas D/A/H são auto-verificáveis; G/F dependem de conferência). */
export type SubcheckMap = Partial<Record<AtriconSubdim, AutoVerdict>>

export interface AutoCheckResult {
  status: AutoVerdict
  detail: string
  /** Veredito por subdimensão quando o módulo tem dados para medir (D/A/H). */
  subchecks?: SubcheckMap
}

const ok = (detail: string): AutoCheckResult => ({ status: 'ok', detail })
const parcial = (detail: string): AutoCheckResult => ({ status: 'parcial', detail })
const falha = (detail: string): AutoCheckResult => ({ status: 'falha', detail })

/**
 * Deriva os veredictos de Disponibilidade (D), Atualidade (A) e Série Histórica (H)
 * a partir das estatísticas reais de um módulo. Gravação (G) e Filtro (F) não são
 * auto-detectáveis e ficam para conferência manual.
 */
function statsSubchecks(
  stats: TableStats,
  opts: { thresholdDays?: number | null; history?: boolean }
): SubcheckMap {
  const sub: SubcheckMap = {}
  sub.D = stats.total > 0 ? 'ok' : 'falha'
  if (opts.thresholdDays != null) {
    if (!stats.latest) sub.A = 'falha'
    else {
      const days = Math.floor(DateTime.now().diff(stats.latest, 'days').days)
      sub.A = days <= opts.thresholdDays ? 'ok' : 'parcial'
    }
  }
  if (opts.history) {
    sub.H = stats.distinctYears >= 3 ? 'ok' : stats.distinctYears >= 1 ? 'parcial' : 'falha'
  }
  return sub
}

/**
 * Frescor periódico (ex.: quinzenal para atas/pautas/votações).
 * ok = há conteúdo e última publicação dentro do prazo;
 * parcial = há conteúdo, mas passou do prazo;
 * falha = módulo vazio.
 */
function periodicFreshness(
  stats: TableStats,
  label: string,
  maxDays: number,
  year: number
): AutoCheckResult {
  if (stats.total === 0) return falha(`Nenhuma ${label} publicada`)
  if (!stats.latest) {
    return parcial(`${stats.total} ${label}(s) cadastrada(s), mas sem data de publicação registrada`)
  }
  const daysSince = Math.floor(DateTime.now().diff(stats.latest, 'days').days)
  const latestFmt = fmtDate(stats.latest)
  if (daysSince <= maxDays) {
    return ok(
      `${stats.total} ${label}(s) — última em ${latestFmt} (dentro da meta de ${maxDays} dias; ${stats.recent} no período)`
    )
  }
  if (stats.yearCount > 0) {
    return parcial(
      `${stats.total} ${label}(s), porém a última foi em ${latestFmt} (há ${daysSince} dias) — meta: atualizar a cada ${maxDays} dias após cada sessão`
    )
  }
  return falha(
    `${stats.total} ${label}(s), mas nenhuma de ${year} — última em ${latestFmt}. Publique regularmente.`
  )
}

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
  'diarias': 'continuo',
  'ocp': 'continuo',
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
 * Checa frescor com metas por módulo: quinzenal (15 dias) para atas/pautas/votações,
 * 90 dias para licitações, 30 dias para notícias etc.
 */
async function runAutoChecks(): Promise<Record<string, AutoCheckResult>> {
  const now = DateTime.now()
  const year = now.year
  const yearStart = now.startOf('year').toFormat('yyyy-MM-dd')
  const d15 = now.minus({ days: FRESHNESS_DAYS.biweekly }).toFormat('yyyy-MM-dd')
  const d90 = now.minus({ days: FRESHNESS_DAYS.quarterly }).toFormat('yyyy-MM-dd')

  const [settings, activeSections, rawLinks, infoCategories] = await Promise.all([
    SiteSetting.allAsObject(),
    TransparencySection.query().where('is_active', true).whereNull('deleted_at'),
    TransparencyLink.query().whereNull('deleted_at'),
    loadInfoCategories(),
  ])
  const activeSectionIds = new Set(activeSections.map((section) => section.id))
  const links = rawLinks.filter((link) => activeSectionIds.has(link.sectionId))
  const linkTitles = links.map((l) => `${l.title}`.toLowerCase())
  // Verifica o DESTINO do botão Radar (URL oficial), não apenas o título do link.
  const radarByUrl = links.some((l) =>
    `${l.url}`.toLowerCase().includes('radardatransparencia.atricon.org.br')
  )
  const radarLink = radarByUrl || linkTitles.some((t) => t.includes('radar'))

  const [
    councilors,
    publications,
    faq,
    licitacoes,
    licitacaoDocs,
    licitacoesSemDocs,
    contratoDocs,
    contractsTotal,
    contractsFiscais,
    atas,
    pautas,
    committees,
    activities,
    surveys,
    transparencySections,
    mesaRow,
    votacoes,
    rgfModule,
    rgfInfo,
    duodecimosRow,
    laiRegulationPages,
    liveSessions,
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
    tableCount('contracts', (q) => q.where('is_active', true)),
    tableCount('contracts', (q) => q.where('is_active', true).whereNotNull('fiscal_name').where('fiscal_name', '!=', '')),
    tableStats('atas', 'document_date', d15, yearStart, (q) => q.where('is_published', true)),
    tableStats('pautas', 'document_date', d15, yearStart, (q) => q.where('is_published', true)),
    tableCount('committees', (q) => q.where('is_active', true)),
    db
      .from('legislative_activities')
      .where('is_active', true)
      .select(db.raw('count(*) as total'))
      .select(db.raw('count(case when year = ? then 1 end) as year_count', [year]))
      .select(db.raw('max(year) as latest_year'))
      .select(db.raw("count(case when summary is not null and summary != '' then 1 end) as with_summary"))
      .select(db.raw('count(case when file_url is not null and file_url != \'\' then 1 end) as with_pdf'))
      .first(),
    tableStats('satisfaction_surveys', 'created_at', d90, yearStart),
    tableCount('transparency_sections', (q) => q.where('is_active', true)),
    db
      .from('councilor_positions as cp')
      .leftJoin('biennia as b', 'b.id', 'cp.biennium_id')
      .select(db.raw('count(*) as total'))
      .select(db.raw('count(case when b.is_current then 1 end) as current_count'))
      .first(),
    tableStats('nominal_votings', 'voting_date', d15, yearStart, (q) =>
      q.where('is_published', true)
    ),
    tableCount('fiscal_reports', (q) =>
      q.where('is_active', true).whereNotNull('file_url').where('report_type', 'RGF')
    ),
    tableCount('information_records', (q) =>
      q.where('is_active', true).where('category', 'rgf').whereNotNull('file_url')
    ),
    db
      .from('duodecimos')
      .select(db.raw('count(*) as total'))
      .select(db.raw('count(case when year = ? then 1 end) as current_year', [year]))
      .select(
        db.raw('count(case when year = ? and recebido is not null then 1 end) as current_received', [
          year,
        ])
      )
      .select(db.raw('count(distinct year) as distinct_years'))
      .select(db.raw('max(coalesce(repasse_date::timestamp, updated_at, created_at)) as latest'))
      .first(),
    tableCount('pages', (q) =>
      q
        .where('is_published', true)
        .whereIn('slug', ['regulamentacao-lai', 'lei-de-acesso-a-informacao', 'lai'])
    ),
    tableCount('plenary_sessions', (q) =>
      q.whereNotNull('video_url').where('video_url', '!=', '')
    ),
  ])

  const mesaTotal = Number(mesaRow?.total ?? 0)
  const mesaCurrent = Number(mesaRow?.current_count ?? 0)
  const actTotal = Number(activities?.total ?? 0)
  const actYear = Number(activities?.year_count ?? 0)
  const actLatestYear = activities?.latest_year ? Number(activities.latest_year) : null
  const actWithSummary = Number(activities?.with_summary ?? 0)
  const actWithPdf = Number(activities?.with_pdf ?? 0)
  const rgfTotal = rgfModule + rgfInfo
  const duodecimosTotal = Number(duodecimosRow?.total ?? 0)
  const duodecimosCurrentYear = Number(duodecimosRow?.current_year ?? 0)
  const duodecimosReceived = Number(duodecimosRow?.current_received ?? 0)
  const duodecimosDistinctYears = Number(duodecimosRow?.distinct_years ?? 0)
  const duodecimosLatest = toDateTime(duodecimosRow?.latest)
  const esicOk = hasUsefulUrl(settings.esic_new_url) || hasUsefulUrl(settings.esic_consult_url)
  const ouvidoriaOk = hasUsefulUrl(settings.ouvidoria_url)
  const hasContactChannel = Boolean(settings.footer_email || settings.footer_phone || ouvidoriaOk)
  const sicHasResponsibleUnit = Boolean(settings.sic_unit || settings.sic_monitoring_authority)
  const sicHasLocation = Boolean(settings.homepage_esic_address || settings.footer_address)
  const sicHasHours = Boolean(settings.homepage_esic_hours || settings.footer_hours)
  const sicHasPhone = Boolean(settings.homepage_esic_phone || settings.esic_phone || settings.footer_phone)
  const sicHasEmail = Boolean(settings.homepage_esic_email || settings.esic_email || settings.footer_email)
  const sicContactMissing = [
    !sicHasResponsibleUnit && 'unidade/setor responsável',
    !sicHasLocation && 'endereço físico',
    !sicHasPhone && 'telefone',
    !sicHasEmail && 'e-mail',
    !sicHasHours && 'horário de atendimento',
  ].filter(Boolean)

  const checks: Record<string, AutoCheckResult> = {
    always: ok('Recurso nativo do portal — disponível em todas as páginas'),

    siteSearch: ok('Busca global nativa disponível em /busca e acessível pela lupa do cabeçalho'),

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
      ? ok(
          radarByUrl
            ? 'Botão do Radar da Transparência aponta para radardatransparencia.atricon.org.br'
            : 'Link do Radar da Transparência cadastrado na transparência'
        )
      : falha('Cadastre o botão do Radar da Transparência (radardatransparencia.atricon.org.br) na transparência/capa'),

    duodecimos:
      duodecimosTotal === 0
        ? falha('Nenhum duodécimo cadastrado no módulo Receita/Duodécimos')
        : duodecimosCurrentYear > 0 && duodecimosReceived > 0
          ? ok(
              `${duodecimosTotal} duodécimo(s) cadastrados; ${duodecimosReceived} repasse(s) recebido(s) em ${year} (último em ${fmtDate(duodecimosLatest)})`
            )
          : duodecimosCurrentYear > 0
            ? parcial(
                `${duodecimosCurrentYear} duodécimo(s) de ${year}, mas sem valor recebido informado — complete a realização da receita`
              )
            : parcial(
                `${duodecimosTotal} duodécimo(s), mas nenhum registro do exercício ${year} — gere/atualize o ano atual`
              ),

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

    contracts:
      contractsTotal > 0
        ? ok(`${contractsTotal} contrato(s) cadastrado(s) no módulo Contratos`)
        : falha('Nenhum contrato no módulo Contratos — importe das licitações e complete os dados'),

    contractsFiscais:
      contractsTotal === 0
        ? falha('Cadastre os contratos para então informar os fiscais')
        : contractsFiscais === contractsTotal
          ? ok(`Todos os ${contractsTotal} contratos têm fiscal designado`)
          : contractsFiscais > 0
            ? parcial(`${contractsFiscais} de ${contractsTotal} contratos com fiscal informado — complete os demais`)
            : falha('Nenhum contrato tem fiscal informado — preencha o fiscal e a portaria de designação'),

    rgf:
      rgfTotal > 0
        ? ok(`${rgfTotal} RGF publicado(s) (Relatórios Fiscais + Acesso à Informação)`)
        : falha('Nenhum RGF publicado — cadastre em Relatórios Fiscais (por ano/período) ou na seção RGF do Acesso à Informação'),

    atas: periodicFreshness(atas, 'ata', FRESHNESS_DAYS.biweekly, year),

    pautas: periodicFreshness(pautas, 'pauta', FRESHNESS_DAYS.biweekly, year),

    committees:
      committees > 0 ? ok(`${committees} comissões ativas`) : falha('Nenhuma comissão ativa cadastrada'),

    activities:
      actTotal === 0
        ? falha('Nenhuma atividade legislativa cadastrada')
        : actYear > 0
          ? actWithSummary >= actTotal * 0.8
            ? ok(
                `${actTotal} atividades (${actYear} de ${year}); ementa em ${actWithSummary}; PDF nativo em ${actWithPdf} (demais via exportação/impressão)`
              )
            : parcial(
                `${actTotal} atividades (${actYear} de ${year}), mas só ${actWithSummary} com ementa/resumo — complete via importação ou edição`
              )
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

    votacoes: periodicFreshness(votacoes, 'votação nominal', FRESHNESS_DAYS.biweekly, year),

    laiRegulation:
      laiRegulationPages > 0
        ? ok('Página publicada com a regulamentação local da LAI')
        : falha('Publique uma página com a regulamentação local da Lei de Acesso à Informação'),

    sitemap: ok('Mapa do site nativo disponível em /mapa-do-site'),

    dpo:
      settings.dpo_ordinance_pdf_url && hasContactChannel
        ? ok('Política de privacidade com portaria do encarregado e canal de contato')
        : hasContactChannel
          ? parcial('Há canal de contato para LGPD, mas falta anexar a portaria do encarregado em Aparência')
          : falha('Informe canal de contato do encarregado/LGPD e anexe a portaria em Aparência'),

    privacyPolicy: ok('Política de Privacidade publicada em /politica-de-privacidade'),

    digitalServices:
      esicOk && ouvidoriaOk
        ? ok('e-SIC e Ouvidoria eletrônica configurados como serviços digitais externos')
        : esicOk || ouvidoriaOk
          ? parcial('Há canal digital configurado, mas falta e-SIC ou Ouvidoria eletrônica')
          : falha('Configure os links externos do e-SIC e da Ouvidoria em Aparência/menus'),

    esicDigital: esicOk
      ? ok('e-SIC eletrônico configurado e publicado no portal')
      : falha('Configure o link do e-SIC eletrônico em Aparência ou Menus do Site'),

    sicContact:
      esicOk && sicContactMissing.length === 0
        ? ok('SIC com sistema eletrônico, endereço físico, telefone, e-mail e horário de atendimento')
        : esicOk
          ? parcial(`e-SIC configurado, mas falta explicitar: ${sicContactMissing.join(', ')}`)
          : falha('Configure o e-SIC e os dados da unidade responsável pelo SIC físico'),

    // Checagem REAL (antes era sempre "ok"): a página /dados-abertos é nativa (JSON/CSV
    // + licença CC BY 4.0 + dicionário), mas o critério 15.4 exige pelo menos um
    // conjunto legível por máquina COM dados. Confirmamos isso contra o banco usando
    // contagens já carregadas (vereadores/publicações/atas) — sem consulta extra.
    openData:
      councilors > 0 || publications.total > 0 || atas.total > 0
        ? ok('Dados abertos nativos em JSON e CSV (licença CC BY 4.0 + dicionário de campos), com pelo menos um conjunto de dados preenchido e legível por máquina')
        : parcial('Página de dados abertos disponível (JSON/CSV + licença + dicionário), mas ainda sem registros para exportar — publique conteúdo para gerar conjuntos legíveis por máquina'),

    liveSessions:
      liveSessions > 0
        ? ok(`${liveSessions} sessão(ões) com link de vídeo/transmissão cadastrado`)
        : hasUsefulUrl(settings.social_youtube)
          ? parcial('Canal do YouTube configurado, mas nenhuma sessão possui link de transmissão/vídeo')
          : falha('Configure o YouTube e cadastre o link de transmissão/vídeo nas sessões'),
  }

  // Veredictos por subdimensão (D/A/H) para os módulos com dados de data/série.
  // Gravação (G) e Filtro (F) não são auto-detectáveis e ficam para conferência.
  checks.atas.subchecks = statsSubchecks(atas, { thresholdDays: FRESHNESS_DAYS.biweekly, history: true })
  checks.pautas.subchecks = statsSubchecks(pautas, { thresholdDays: FRESHNESS_DAYS.biweekly, history: true })
  checks.votacoes.subchecks = statsSubchecks(votacoes, { thresholdDays: FRESHNESS_DAYS.biweekly, history: true })
  checks.publications.subchecks = statsSubchecks(publications, { thresholdDays: FRESHNESS_DAYS.quarterly, history: true })
  checks.licitacoes.subchecks = statsSubchecks(licitacoes, { thresholdDays: FRESHNESS_DAYS.quarterly, history: true })
  checks.survey.subchecks = statsSubchecks(surveys, { thresholdDays: FRESHNESS_DAYS.quarterly })
  checks.duodecimos.subchecks = {
    D: duodecimosTotal > 0 ? 'ok' : 'falha',
    A: duodecimosReceived > 0 ? 'ok' : duodecimosCurrentYear > 0 ? 'parcial' : 'falha',
    H: duodecimosDistinctYears >= 3 ? 'ok' : duodecimosDistinctYears >= 1 ? 'parcial' : 'falha',
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

/** Crédito de cada subdimensão auto-verificável (D/A/H) no índice. */
const VERDICT_CREDIT: Record<AutoVerdict, number> = { ok: 1, parcial: 0.5, falha: 0 }

/**
 * Crédito do critério no índice (0..1) ou null quando excluído (nao_se_aplica).
 * Para critérios que seguem a verificação automática e têm subdimensões mensuráveis
 * (D/A/H), pondera o crédito pelos pesos PNTP (D30/A30/H20) em vez do crédito binário
 * do status — ex.: atualidade parcial deixa de "zerar" ou "encher" o critério inteiro.
 * Gravação (G) e Filtro (F) ficam para conferência manual e não entram nesta média.
 */
function creditOf(
  status: AtriconStatusValue,
  source: 'auto' | 'manual' | 'padrao',
  subdimensions: Array<{ key: AtriconSubdim; status: AutoVerdict | 'manual' }> | null
): number | null {
  const base = STATUS_CREDIT[status]
  if (base === null) return null
  if (source === 'auto' && subdimensions && subdimensions.length > 0) {
    // Pondera TODAS as subdimensões exigidas pelo critério (D30/A30/H20/G10/F10),
    // não apenas as auto-detectáveis. As medíveis (D/A/H) usam o veredito real do
    // auto-check; Gravação (G) e Filtro (F) — que não são auto-detectáveis — herdam
    // o crédito do veredito GERAL do critério (base do status efetivo).
    // Assim o peso de G/F ENTRA no índice em vez de ser descartado: critérios
    // plenamente atendidos seguem 1,0 (G/F = base = 1) e critérios parciais deixam
    // de ignorar 20% do peso — evita inflar a nota com export/filtro não verificados.
    const wsum = subdimensions.reduce((s, sd) => s + SUBDIM_WEIGHT[sd.key], 0)
    const earned = subdimensions.reduce((s, sd) => {
      const credit = sd.status === 'manual' ? base : VERDICT_CREDIT[sd.status as AutoVerdict]
      return s + SUBDIM_WEIGHT[sd.key] * credit
    }, 0)
    if (wsum > 0) return Math.round((earned / wsum) * 1000) / 1000
  }
  return base
}

/* ============================== Onde resolver / lacuna (o que falta) ============================== */

type CriterionPlace =
  | 'sistema_externo'
  | 'pagina_acesso_informacao'
  | 'transparencia_ou_link_externo'
  | 'modulo_nativo'
  | 'pagina_publica'
  | 'avaliacao_manual'

/** Onde a informação do critério vive (ou deve viver) — base da orientação de correção. */
function placeOf(
  c: Pick<AtriconCriterion, 'external' | 'autoCheck' | 'route' | 'keywords'>,
  status: AtriconStatusValue,
  actionHref: string | null
): CriterionPlace {
  if (c.external || status === 'externo') return 'sistema_externo'
  if (c.autoCheck?.startsWith('info:')) return 'pagina_acesso_informacao'
  if (c.route?.startsWith('/transparencia') || (!c.autoCheck && c.keywords?.length)) {
    return 'transparencia_ou_link_externo'
  }
  if (actionHref?.startsWith('/painel/')) return 'modulo_nativo'
  if (c.route) return 'pagina_publica'
  return 'avaliacao_manual'
}

/** Ação concreta por local de resolução (o quê fazer e onde). */
const PLACE_ACTION: Record<CriterionPlace, string> = {
  modulo_nativo:
    'Preencha o módulo nativo do painel indicado abaixo — os dados publicados alimentam a página pública e a verificação automática.',
  pagina_acesso_informacao:
    'Cadastre o documento/registro na categoria correspondente do módulo Acesso à Informação (mantenha o exercício mais recente publicado).',
  transparencia_ou_link_externo:
    'Em Links da Transparência, configure ou atualize o link que aponta para o conteúdo (módulo nativo) ou para o sistema oficial/contábil externo.',
  sistema_externo:
    'Garanta que o link do sistema externo (e-SIC/Ouvidoria/portal contratado) esteja visível, válido e atualizado no portal — é o que o avaliador confere.',
  pagina_publica: 'Publique ou ajuste a página pública correspondente no portal.',
  avaliacao_manual:
    'Confira manualmente o conteúdo publicado e registre a evidência/observação neste critério.',
}

/** Rótulo do botão de atalho conforme o local de resolução. */
function moduleLinkLabel(place: CriterionPlace): string {
  switch (place) {
    case 'modulo_nativo':
      return 'Abrir módulo no painel'
    case 'pagina_acesso_informacao':
      return 'Abrir Acesso à Informação'
    case 'transparencia_ou_link_externo':
      return 'Abrir Links da Transparência'
    case 'sistema_externo':
      return 'Configurar link do sistema externo'
    case 'pagina_publica':
      return 'Abrir página pública'
    default:
      return 'Abrir atalho'
  }
}

export interface CriterionGap {
  /** O que a ATRICON exige (texto da matriz). */
  exigencia: string
  /** O que foi detectado / por que está pendente. */
  motivo: string
  /** Ação concreta derivada do local de resolução (dimensão/critério). */
  acao: string
  /** Orientação de como atender (hint da matriz). */
  comoResolver: string
  /** Deep-link do módulo/atalho que resolve, com rótulo. */
  moduloLink: { href: string; label: string } | null
  /** Categoria do local de resolução. */
  place: CriterionPlace
}

/**
 * Enriquece cada critério com a explicação do que falta: exigência (matriz),
 * motivo (evidência do auto-check / verificação manual pendente / sistema externo),
 * ação concreta e link do módulo que resolve.
 */
function buildGap(
  c: AtriconCriterion,
  opts: {
    status: AtriconStatusValue
    auto: AutoCheckResult | null
    place: CriterionPlace
    actionHref: string | null
  }
): CriterionGap {
  const { status, auto, place, actionHref } = opts
  let motivo: string
  if (auto) {
    // Evidência verídica do auto-check (contagens/datas) ou de links relacionados.
    motivo = auto.detail
  } else if (place === 'sistema_externo' || status === 'externo') {
    motivo =
      'Depende de sistema externo contratado — confirme que o link de acesso está visível, válido e atualizado no portal.'
  } else {
    motivo =
      'Verificação manual pendente — este critério não tem detecção automática; confira o conteúdo publicado e registre a evidência.'
  }
  return {
    exigencia: c.title,
    motivo,
    acao: PLACE_ACTION[place],
    comoResolver: c.hint,
    moduloLink: actionHref ? { href: actionHref, label: moduleLinkLabel(place) } : null,
    place,
  }
}

/**
 * Monta a matriz. Precedência do status efetivo:
 * 1. Critério com autoCheck e SEM registro manual → status da verificação em tempo real.
 * 2. Critério com autoCheck e COM registro manual → o manual vale (override explícito),
 *    sinalizado com `source: 'manual'` e `divergent` quando contradiz a verificação.
 * 3. Critério sem autoCheck → manual (ou padrão: externo/pendente).
 */
async function buildMatrix() {
  const [saved, auto, rawLinks, activeSections] = await Promise.all([
    AtriconStatus.all(),
    runAutoChecks(),
    TransparencyLink.query().whereNull('deleted_at'),
    TransparencySection.query().where('is_active', true).whereNull('deleted_at'),
  ])
  const sectionById = new Map(activeSections.map((section) => [section.id, section]))
  const links = rawLinks.filter((link) => sectionById.has(link.sectionId))
  const statusByCode = new Map(saved.map((s) => [s.criterionCode, s]))
  const checkedAt = DateTime.now().toISO()

  return ATRICON_CRITERIA.map((c) => {
    const record = statusByCode.get(c.code)
    const matchedLinks = c.keywords
      ? links
          .filter((l) => {
            const sectionTitle = sectionById.get(l.sectionId)?.title ?? ''
            const haystack = normalizeSearch(`${l.title} ${l.url} ${sectionTitle}`)
            return c.keywords!.some((k) => haystack.includes(normalizeSearch(k)))
          })
          .map((l) => ({ title: l.title, url: l.url, section: sectionById.get(l.sectionId)?.title ?? null }))
          .slice(0, 3)
      : []
    const keywordEvidence =
      !c.autoCheck && !c.external && matchedLinks.length > 0
        ? parcial(
            `${matchedLinks.length} link(s) relacionado(s) encontrado(s) na Transparência; valide conteúdo, atualidade, série histórica, relatório e filtro conforme o critério`
          )
        : null
    const autoResult = (c.autoCheck && auto[c.autoCheck]) || keywordEvidence
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

    // GUARDRAIL de obrigação legal: "não ocorre" não pode creditar um critério de
    // publicação obrigatória por lei. A UI já bloqueia novos registros assim; este
    // clamp protege dados legados — força o status efetivo a "pendente" para não
    // inflar o índice nem a regra dos essenciais (honestidade > pontuação).
    const legalNonOccurrenceBlocked = status === 'nao_ocorre' && Boolean(c.legalObligation)
    if (legalNonOccurrenceBlocked) status = 'pendente'

    const divergent = source === 'manual' && autoStatus !== null && status !== autoStatus

    // VALIDADE do override manual: override que diverge da auto-checagem há mais de
    // OVERRIDE_REVIEW_DAYS dias entra em "revisar". Não apagamos o dado — só sinalizamos
    // (uma divergência antiga geralmente significa que a auto-checagem mudou depois).
    const overrideAgeDays =
      source === 'manual' && record?.updatedAt
        ? Math.floor(DateTime.now().diff(record.updatedAt, 'days').days)
        : null
    const overrideStale =
      divergent && overrideAgeDays !== null && overrideAgeDays > OVERRIDE_REVIEW_DAYS

    // Detalhamento por subdimensão (D/A/H auto; G/F sempre para conferência manual)
    const autoSubs = autoResult?.subchecks
    const subdimensions = requiredSubdims(c).map((sd) => ({
      key: sd,
      label: SUBDIM_LABEL[sd],
      status: (autoSubs?.[sd] ?? 'manual') as AutoVerdict | 'manual',
    }))

    // Crédito ponderado por TODAS as subdimensões exigidas (D30/A30/H20/G10/F10)
    // para auto-verificados; G/F herdam o veredito geral (ver creditOf).
    const credit = creditOf(status, source, subdimensions)

    // Onde resolver + explicação "o que falta" (exigência/motivo/como resolver/link).
    const actionHref = criterionActionHref(c)
    const place = placeOf(c, status, actionHref)
    const gap = buildGap(c, { status, auto: autoResult, place, actionHref })

    return {
      ...c,
      status,
      source,
      autoStatus,
      divergent,
      // Sinalizações de confiabilidade (não alteram crédito além do clamp legal):
      legalNonOccurrenceBlocked,
      overrideAgeDays,
      overrideStale,
      needsReview: overrideStale,
      subdimensions,
      credit,
      // Ganho real em pontos do índice ao concluir o critério (preenchido em attachIndexGain).
      indexGain: 0,
      evidenceUrl: record?.evidenceUrl ?? null,
      notes: record?.notes ?? null,
      lastUpdate: record?.updatedAt?.toISO() ?? null,
      auto: autoResult
        ? { status: autoResult.status, detail: autoResult.detail, checkedAt }
        : null,
      autoLinks: matchedLinks,
      actionHref,
      gap,
    }
  })
}

type MatrixItem = Awaited<ReturnType<typeof buildMatrix>>[number]
type Scores = ReturnType<typeof computeScores>

function criterionPlace(c: MatrixItem): CriterionPlace {
  return placeOf(c, c.status, c.actionHref)
}

function buildEvidencePack({
  matrix,
  scores,
  contentMap,
  linkAudit,
}: {
  matrix: MatrixItem[]
  scores: Scores
  contentMap: ContentModule[]
  linkAudit: Awaited<ReturnType<typeof TransparencyAuditService.audit>>
}) {
  const pending = matrix
    .filter((c) => c.status === 'pendente' || c.status === 'parcial' || c.divergent)
    .map((c) => ({
      code: c.code,
      title: c.title,
      dimension: c.dimension,
      classification: c.classification,
      status: c.status,
      source: c.source,
      place: criterionPlace(c),
      route: c.route ?? null,
      actionHref: c.actionHref,
      autoDetail: c.auto?.detail ?? null,
      divergent: c.divergent,
      // Override manual divergente e vencido (pede reconferência) e obrigação legal
      // que teve "não ocorre" rebaixado a pendente — entram na leitura periódica da IA.
      overrideStale: c.overrideStale,
      overrideAgeDays: c.overrideAgeDays,
      legalNonOccurrenceBlocked: c.legalNonOccurrenceBlocked,
      // Ganho real em pontos do índice ao concluir o critério — base da priorização.
      indexGain: c.indexGain,
      hint: c.hint,
      notes: c.notes,
    }))
    // Overrides a revisar primeiro, depois maior impacto no índice, depois divergências.
    .sort(
      (a, b) =>
        Number(b.overrideStale) - Number(a.overrideStale) ||
        b.indexGain - a.indexGain ||
        Number(b.divergent) - Number(a.divergent)
    )

  const contentGaps = contentMap
    .filter((m) => m.freshness !== 'em_dia')
    .map((m) => ({
      key: m.key,
      label: m.label,
      adminHref: m.adminHref,
      total: m.total,
      latest: m.latest,
      freshness: m.freshness,
      detail: m.detail,
    }))

  return {
    generatedAt: DateTime.now().toISO(),
    purpose:
      'Pacote de evidencias para leitura periodica por IA e conferencias PNTP/ATRICON do portal da Camara Municipal de Sume.',
    disclaimer:
      'Ferramenta interna de autodiagnostico e preparacao. NAO e a avaliacao oficial do PNTP/ATRICON nem substitui a autoavaliacao no sistema Avalia, a validacao pelo Tribunal de Contas ou o Radar da Transparencia Publica oficial. Indices e niveis aqui sao estimativas para orientar a equipe.',
    readingFlow: [
      {
        step: 1,
        title: 'Ler matriz PNTP',
        instruction:
          'Priorizar criterios essenciais, pendentes, parciais e divergencias entre verificacao automatica e override manual.',
      },
      {
        step: 2,
        title: 'Conferir fontes do portal',
        instruction:
          'Abrir route/actionHref, validar se ha conteudo publico, filtros, serie historica, data de atualizacao e exportacao quando aplicavel.',
      },
      {
        step: 3,
        title: 'Separar dependencias externas',
        instruction:
          'e-SIC, Ouvidoria, folha e remuneracao podem ficar em sistemas externos, mas os links devem estar visiveis, validos e atualizados na Transparencia.',
      },
      {
        step: 4,
        title: 'Preencher ou sinalizar',
        instruction:
          'Quando o dado for interno, orientar o cadastro no modulo correto. Quando for externo, registrar link/evidencia e manter status como sistema externo.',
      },
      {
        step: 5,
        title: 'Revalidar',
        instruction:
          'Reabrir o Radar apos a correcao para atualizar verificacoes automaticas, links auditados e snapshot diario.',
      },
    ],
    summary: {
      index: scores.index,
      level: scores.level,
      allEssentialsMet: scores.allEssentialsMet,
      totals: scores.totals,
      contentGaps: contentGaps.length,
      transparencyLinkGaps: linkAudit.contentGaps.length,
      checkedLinks: linkAudit.summary.total,
    },
    periodicity: {
      recommended: 'quinzenal durante o ciclo PNTP e mensal fora do ciclo',
      fastChecks:
        'Atas, pautas e votacoes: meta de 15 dias. Noticias/transparencia continua: 30 dias. Licitacoes/contratos/publicacoes: 90 dias.',
    },
    categories: {
      ownInformationPages: matrix.filter((c) => c.autoCheck?.startsWith('info:')).map((c) => c.code),
      nativeModules: matrix.filter((c) => criterionPlace(c) === 'modulo_nativo').map((c) => c.code),
      transparencyOrExternalLinks: matrix
        .filter((c) => criterionPlace(c) === 'transparencia_ou_link_externo')
        .map((c) => c.code),
      externalSystems: matrix.filter((c) => criterionPlace(c) === 'sistema_externo').map((c) => c.code),
    },
    priorities: pending,
    contentMap,
    transparencyAudit: linkAudit,
    criteria: matrix.map((c) => ({
      code: c.code,
      dimension: c.dimension,
      title: c.title,
      classification: c.classification,
      verification: c.verification,
      subdimensions: c.subdimensions,
      status: c.status,
      source: c.source,
      place: criterionPlace(c),
      route: c.route ?? null,
      actionHref: c.actionHref,
      evidenceUrl: c.evidenceUrl,
      auto: c.auto,
      autoLinks: c.autoLinks,
      divergent: c.divergent,
      hint: c.hint,
      notes: c.notes,
    })),
  }
}

/* ============================== Índice PNTP ============================== */

/** Índice PNTP: pesos por dimensão e por classificação do critério. */
function computeScores(matrix: MatrixItem[]) {
  const dimensions = ATRICON_DIMENSIONS.map((dim) => {
    const items = matrix.filter((c) => c.dimension === dim.key)
    const considered = items.filter((c) => c.credit !== null)
    const totalWeight = considered.reduce(
      (sum, c) => sum + CLASSIFICATION_WEIGHT[c.classification],
      0
    )
    const earnedWeight = considered.reduce(
      (sum, c) => sum + CLASSIFICATION_WEIGHT[c.classification] * (c.credit ?? 0),
      0
    )
    const pct = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 100
    return {
      ...dim,
      totalWeight,
      total: items.length,
      met: items.filter((c) => MET_STATUSES.includes(c.status as AtriconStatusValue)).length,
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
  const allEssentialsMet = essentials.every((c) =>
    MET_STATUSES.includes(c.status as AtriconStatusValue)
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
      // Overrides manuais divergentes e vencidos (pedem reconferência) e critérios
      // de obrigação legal que tinham "não ocorre" rebaixado a pendente.
      staleOverrides: matrix.filter((c) => c.overrideStale).length,
      legalNonOccurrenceBlocked: matrix.filter((c) => c.legalNonOccurrenceBlocked).length,
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
  const d15 = now.minus({ days: FRESHNESS_DAYS.biweekly }).toFormat('yyyy-MM-dd')
  const d30 = now.minus({ days: FRESHNESS_DAYS.monthly }).toFormat('yyyy-MM-dd')
  const d90 = now.minus({ days: FRESHNESS_DAYS.quarterly }).toFormat('yyyy-MM-dd')

  const [
    noticias,
    atas,
    pautas,
    licitacoes,
    contratos,
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
    relatoriosFiscais,
    duodecimos,
  ] = await Promise.all([
    tableStats('news', 'published_at', d30, yearStart, (q) => q.where('status', 'published')),
    tableStats('atas', 'document_date', d15, yearStart, (q) => q.where('is_published', true)),
    tableStats('pautas', 'document_date', d15, yearStart, (q) => q.where('is_published', true)),
    tableStats('licitacoes', 'coalesce(updated_at, created_at)', d90, yearStart, (q) =>
      q.where('is_active', true)
    ),
    tableStats('contracts', 'coalesce(updated_at, created_at)', d90, yearStart, (q) =>
      q.where('is_active', true)
    ),
    tableStats(
      'legislative_activities',
      'coalesce(session_date, created_at)',
      d90,
      yearStart,
      (q) => q.where('is_active', true)
    ),
    tableStats('nominal_votings', 'voting_date', d15, yearStart, (q) =>
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
    tableStats('fiscal_reports', 'coalesce(updated_at, created_at)', d90, yearStart, (q) =>
      q.where('is_active', true)
    ),
    tableStats('duodecimos', 'coalesce(repasse_date::timestamp, updated_at, created_at)', d30, yearStart),
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
      '/painel/atas',
      atas,
      FRESHNESS_DAYS.biweekly,
      `${atas.recent} ata(s) nos últimos ${FRESHNESS_DAYS.biweekly} dias; ${atas.yearCount} em ${year}`
    ),
    mod(
      'pautas',
      'Pautas das sessões',
      '/painel/pautas',
      pautas,
      FRESHNESS_DAYS.biweekly,
      `${pautas.recent} pauta(s) nos últimos ${FRESHNESS_DAYS.biweekly} dias; ${pautas.yearCount} em ${year}`
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
      'duodecimos',
      'Receita / Duodécimos',
      '/painel/duodecimos',
      duodecimos,
      FRESHNESS_DAYS.monthly,
      `${duodecimos.recent} atualização(ões) nos últimos 30 dias; ${duodecimos.yearCount} registro(s) em ${year}`
    ),
    mod(
      'relatorios-fiscais',
      'Relatórios Fiscais (RGF/RREO)',
      '/painel/relatorios-fiscais',
      relatoriosFiscais,
      null,
      `${relatoriosFiscais.total} relatório(s) publicado(s)`
    ),
    mod(
      'contratos',
      'Contratos',
      '/painel/contratos',
      contratos,
      null,
      `${contratos.total} contrato(s) cadastrado(s)`
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
      FRESHNESS_DAYS.biweekly,
      `${votacoes.recent} votação(ões) nos últimos ${FRESHNESS_DAYS.biweekly} dias; ${votacoes.yearCount} em ${year}`
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

/* ============================== Índice: ganho real por critério ============================== */

/**
 * Preenche `indexGain` de cada critério: quantos pontos do índice geral seriam ganhos
 * ao levar o critério ao crédito pleno (1,0), considerando o peso da classificação,
 * o peso da dimensão e o crédito atual. Permite priorizar "o que falta" por impacto real.
 */
function attachIndexGain(matrix: MatrixItem[], scores: Scores): void {
  const weightSum = scores.dimensions.reduce((s, d) => s + d.weight, 0)
  const dimByKey = new Map(scores.dimensions.map((d) => [d.key, d]))
  for (const c of matrix) {
    const dim = dimByKey.get(c.dimension)
    if (!dim || c.credit === null || dim.totalWeight <= 0 || weightSum <= 0) {
      c.indexGain = 0
      continue
    }
    const deltaEarned = CLASSIFICATION_WEIGHT[c.classification] * (1 - c.credit)
    const deltaPct = (deltaEarned / dim.totalWeight) * 100
    c.indexGain = Math.round(((deltaPct * dim.weight) / weightSum) * 100) / 100
  }
}

/* ============================== Snapshots (evolução do índice) ============================== */

/** Lê a série de snapshots para o gráfico de evolução (somente leitura — sem efeito colateral). */
async function loadSnapshotSeries() {
  const rows = await AtriconSnapshot.query().orderBy('created_at', 'desc').limit(60)
  return rows
    .reverse()
    .map((s) => ({ date: s.createdAt.toISODate(), index: s.index, level: s.level }))
}

/** Grava no máximo 1 snapshot por dia. Idempotente. Devolve true se criou. */
async function writeDailySnapshot(scores: Scores): Promise<boolean> {
  const last = await AtriconSnapshot.query().orderBy('created_at', 'desc').first()
  const today = DateTime.now().startOf('day')
  if (last && last.createdAt >= today) return false
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
  return true
}

/**
 * Calcula a matriz/índice e grava o snapshot diário (idempotente).
 * Chamado pelo comando `node ace atricon:snapshot` — NÃO durante um GET.
 */
export async function recordAtriconSnapshot() {
  const matrix = await buildMatrix()
  const scores = computeScores(matrix)
  const created = await writeDailySnapshot(scores)
  return { created, index: scores.index, level: scores.level }
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
  /**
   * Radar ATRICON é INTERNO — apenas o master (super_admin) acessa, mesmo que
   * outro papel tenha a permissão pntp.gerenciar. Gate aplicado em toda action.
   * Retorna true se já respondeu (bloqueou) — o chamador deve dar return.
   */
  private blockNonMaster(ctx: HttpContext): boolean {
    if (ctx.auth.user?.role !== 'super_admin') {
      ctx.response.redirect('/painel')
      return true
    }
    return false
  }

  async index({ inertia, auth, response }: HttpContext) {
    if (this.blockNonMaster({ auth, response } as HttpContext)) return
    const [matrix, contentMap, linkAudit, atriconLogoUrl] = await Promise.all([
      buildMatrix(),
      buildContentMap(),
      TransparencyAuditService.audit({ checkExternal: true }),
      SiteSetting.getValue('atricon_logo_url'),
    ])
    const scores = computeScores(matrix)
    attachIndexGain(matrix, scores)
    // Leitura apenas — o snapshot diário é gravado pelo comando `atricon:snapshot`.
    const snapshots = await loadSnapshotSeries()
    return inertia.render('admin/atricon/index', {
      matrix,
      scores,
      contentMap,
      linkAudit,
      snapshots,
      atriconLogoUrl: atriconLogoUrl || null,
      checkedAt: DateTime.now().toISO(),
      fortnight: currentFortnight(DateTime.now()),
    })
  }

  async updateStatus({ params, request, response, session, auth }: HttpContext) {
    if (this.blockNonMaster({ auth, response } as HttpContext)) return
    const code = params.code
    const criterion = ATRICON_CRITERIA.find((c) => c.code === code)
    if (!criterion) {
      session.flash('error', 'Critério não encontrado.')
      return response.redirect().back()
    }

    const status = request.input('status') as AtriconStatusValue | 'auto'

    // "auto" remove o override manual: o critério volta a seguir a verificação automática
    if (status === 'auto') {
      if (!criterion.autoCheck && !criterion.keywords?.length) {
        session.flash('error', 'Este critério não possui verificação automática ou evidência por link.')
        return response.redirect().back()
      }
      await AtriconStatus.query().where('criterion_code', code).delete()
      session.flash('success', `Critério ${code} voltou a seguir a verificação automática/evidências.`)
      return response.redirect().toPath('/painel/atricon')
    }

    if (!VALID_STATUSES.includes(status)) {
      session.flash('error', 'Status inválido.')
      return response.redirect().back()
    }

    // Declaração de "não ocorrência" é vedada para obrigações legais de publicação.
    if (status === 'nao_ocorre' && criterion.legalObligation) {
      session.flash(
        'error',
        `O critério ${code} é de publicação obrigatória por lei e não admite declaração de não ocorrência.`
      )
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
      criterion.autoCheck || criterion.keywords?.length
        ? `Critério ${code} atualizado (override manual sobre a verificação automática).`
        : `Critério ${code} atualizado.`
    )
    return response.redirect().toPath('/painel/atricon')
  }

  /** Relatório quinzenal de pendências (imprimível ou CSV), com os status efetivos. */
  async report({ inertia, request, response, auth }: HttpContext) {
    if (this.blockNonMaster({ auth, response } as HttpContext)) return
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
      const esc = (value: string) => {
        const raw = `${value || ''}`
        const safe = /^[=+\-@]/.test(raw.trim()) ? `'${raw}` : raw
        return `"${safe.replace(/"/g, '""')}"`
      }
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
      return response.send('\ufeff' + rows.join('\n'))
    }

    return inertia.render('admin/atricon/report', {
      pendings,
      scores,
      fortnight,
      atriconLogoUrl,
      generatedAt: DateTime.now().setLocale('pt-BR').toFormat("dd/MM/yyyy 'às' HH:mm"),
    })
  }

  async evidencePack({ response, auth }: HttpContext) {
    if (this.blockNonMaster({ auth, response } as HttpContext)) return
    const [matrix, contentMap, linkAudit] = await Promise.all([
      buildMatrix(),
      buildContentMap(),
      TransparencyAuditService.audit({ checkExternal: true }),
    ])
    const scores = computeScores(matrix)
    attachIndexGain(matrix, scores)
    const pack = buildEvidencePack({ matrix, scores, contentMap, linkAudit })

    response.header('Content-Type', 'application/json; charset=utf-8')
    return response.send(JSON.stringify(pack, null, 2))
  }
}
