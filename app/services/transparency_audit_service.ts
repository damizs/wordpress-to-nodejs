import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import TransparencyLink from '#models/transparency_link'
import TransparencySection from '#models/transparency_section'
import { assertFetchableWebUrl } from '#helpers/safe_url'

/** Metas de atualização por tipo de conteúdo (PNTP / ritmo legislativo). */
export const FRESHNESS_DAYS = {
  /** Atas, pautas e votações — sessões ordinárias quinzenais */
  biweekly: 15,
  /** Notícias e transparência contínua */
  monthly: 30,
  /** Licitações, contratos, publicações */
  quarterly: 90,
} as const

export type LinkHealth = 'ok' | 'parcial' | 'falha' | 'externo_ok' | 'externo_falha' | 'invalido'

export interface ModuleSnapshot {
  total: number
  latest: DateTime | null
  thresholdDays: number | null
}

export interface LinkAuditItem {
  id: number
  title: string
  url: string
  sectionTitle: string
  isExternal: boolean
  openMode: string
  health: LinkHealth
  detail: string
  matchedModule: string | null
  contentTotal: number | null
  contentLatest: string | null
  httpStatus: number | null
  adminHref: string | null
}

export interface TransparencyAuditReport {
  links: LinkAuditItem[]
  summary: {
    total: number
    ok: number
    parcial: number
    falha: number
    externo: number
  }
  /** Links internos apontando para módulos vazios ou desatualizados */
  contentGaps: LinkAuditItem[]
  checkedAt: string
}

export interface ModuleProbe {
  key: string
  label: string
  adminHref: string
  table: string
  dateColumn: string
  thresholdDays: number | null
  where?: (q: ReturnType<typeof db.from>) => ReturnType<typeof db.from>
}

/** Rotas internas do portal → tabela/fonte de dados para validar conteúdo. */
const INTERNAL_ROUTES: Array<{ prefix: string; probe: ModuleProbe }> = [
  {
    prefix: '/atas',
    probe: {
      key: 'atas',
      label: 'Atas',
      adminHref: '/painel/atas',
      table: 'atas',
      dateColumn: 'document_date',
      thresholdDays: FRESHNESS_DAYS.biweekly,
      where: (q) => q.where('is_published', true),
    },
  },
  {
    prefix: '/pautas',
    probe: {
      key: 'pautas',
      label: 'Pautas',
      adminHref: '/painel/pautas',
      table: 'pautas',
      dateColumn: 'document_date',
      thresholdDays: FRESHNESS_DAYS.biweekly,
      where: (q) => q.where('is_published', true),
    },
  },
  {
    prefix: '/votacoes',
    probe: {
      key: 'votacoes',
      label: 'Votações nominais',
      adminHref: '/painel/votacoes',
      table: 'nominal_votings',
      dateColumn: 'voting_date',
      thresholdDays: FRESHNESS_DAYS.biweekly,
      where: (q) => q.where('is_published', true),
    },
  },
  {
    prefix: '/licitacoes',
    probe: {
      key: 'licitacoes',
      label: 'Licitações',
      adminHref: '/painel/licitacoes',
      table: 'licitacoes',
      dateColumn: 'coalesce(updated_at, created_at)',
      thresholdDays: FRESHNESS_DAYS.quarterly,
      where: (q) => q.where('is_active', true),
    },
  },
  {
    prefix: '/contratos',
    probe: {
      key: 'contratos',
      label: 'Contratos',
      adminHref: '/painel/contratos',
      table: 'contracts',
      dateColumn: 'coalesce(updated_at, created_at)',
      thresholdDays: null,
      where: (q) => q.where('is_active', true),
    },
  },
  {
    prefix: '/duodecimos',
    probe: {
      key: 'duodecimos',
      label: 'Duodécimos',
      adminHref: '/painel/duodecimos',
      table: 'duodecimos',
      dateColumn: 'coalesce(updated_at, created_at)',
      thresholdDays: FRESHNESS_DAYS.monthly,
    },
  },
  {
    prefix: '/relatorios-fiscais',
    probe: {
      key: 'relatorios-fiscais',
      label: 'Relatórios Fiscais',
      adminHref: '/painel/relatorios-fiscais',
      table: 'fiscal_reports',
      dateColumn: 'coalesce(updated_at, created_at)',
      thresholdDays: null,
      where: (q) => q.where('is_active', true),
    },
  },
  {
    prefix: '/atividades-legislativa',
    probe: {
      key: 'atividades',
      label: 'Atividades legislativas',
      adminHref: '/painel/atividades',
      table: 'legislative_activities',
      dateColumn: 'coalesce(session_date, created_at)',
      thresholdDays: FRESHNESS_DAYS.quarterly,
      where: (q) => q.where('is_active', true),
    },
  },
  {
    prefix: '/publicacoes-oficiais',
    probe: {
      key: 'publicacoes',
      label: 'Publicações oficiais',
      adminHref: '/painel/publicacoes',
      table: 'official_publications',
      dateColumn: 'publication_date',
      thresholdDays: FRESHNESS_DAYS.quarterly,
    },
  },
  {
    prefix: '/diario-oficial',
    probe: {
      key: 'diario',
      label: 'Diário Oficial',
      adminHref: '/diario-oficial',
      table: 'official_gazette_entries',
      dateColumn: 'publication_date',
      thresholdDays: FRESHNESS_DAYS.quarterly,
    },
  },
]

const moduleCache = new Map<string, ModuleSnapshot>()

/**
 * Cache em memória do relatório de auditoria (TTL curto). Evita rodar dezenas de
 * verificações HTTP externas a cada GET do Radar. Chaveado por `checkExternal`,
 * já que a verificação externa muda o resultado.
 */
const AUDIT_TTL_MS = 30 * 60 * 1000
const auditCache = new Map<string, { at: number; report: TransparencyAuditReport }>()

/** Invalida o cache da auditoria (use após editar links/seções da transparência). */
export function clearTransparencyAuditCache(): void {
  auditCache.clear()
}

function toDateTime(value: unknown): DateTime | null {
  if (!value) return null
  const iso = DateTime.fromISO(String(value))
  if (iso.isValid) return iso
  const sql = DateTime.fromSQL(String(value))
  return sql.isValid ? sql : null
}

export function normalizePath(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed || trimmed === '#' || trimmed.startsWith('javascript:')) return null
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const u = new URL(trimmed)
      return u.pathname.replace(/\/$/, '') || '/'
    }
    const path = trimmed.split('?')[0].split('#')[0]
    return path.startsWith('/') ? path.replace(/\/$/, '') || '/' : `/${path}`.replace(/\/$/, '')
  } catch {
    return null
  }
}

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url.trim())
}

function resolveProbe(path: string): ModuleProbe | null {
  if (path.startsWith('/transparencia')) return null
  const match = INTERNAL_ROUTES.find((r) => path === r.prefix || path.startsWith(`${r.prefix}/`))
  return match?.probe ?? null
}

async function probeModule(probe: ModuleProbe): Promise<ModuleSnapshot> {
  const cached = moduleCache.get(probe.key)
  if (cached) return cached

  let query = db.from(probe.table)
  if (probe.where) query = probe.where(query)
  const row = await query
    .select(db.raw('count(*) as total'))
    .select(db.raw(`max(${probe.dateColumn}) as latest`))
    .first()

  const snapshot: ModuleSnapshot = {
    total: Number(row?.total ?? 0),
    latest: toDateTime(row?.latest),
    thresholdDays: probe.thresholdDays,
  }
  moduleCache.set(probe.key, snapshot)
  return snapshot
}

export function evaluateModuleHealth(
  probe: ModuleProbe,
  snap: ModuleSnapshot
): { health: LinkHealth; detail: string } {
  if (snap.total === 0) {
    return {
      health: 'falha',
      detail: `Link aponta para ${probe.label}, mas o módulo está vazio — cadastre conteúdo`,
    }
  }
  if (snap.thresholdDays === null || !snap.latest) {
    return {
      health: 'ok',
      detail: `${snap.total} registro(s) em ${probe.label}`,
    }
  }
  const daysSince = DateTime.now().diff(snap.latest, 'days').days
  if (daysSince <= snap.thresholdDays) {
    return {
      health: 'ok',
      detail: `${snap.total} registro(s) — última atualização em ${snap.latest.toFormat('dd/MM/yyyy')} (meta: ${snap.thresholdDays} dias)`,
    }
  }
  return {
    health: 'parcial',
    detail: `${snap.total} registro(s), porém desatualizado — última em ${snap.latest.toFormat('dd/MM/yyyy')} (há ${Math.floor(daysSince)} dias; meta: ${snap.thresholdDays} dias)`,
  }
}

/**
 * Segue redirects manualmente (até `maxHops`) revalidando cada destino contra a
 * allowlist anti-SSRF — assim um redirect 3xx não pode escapar para um host
 * privado/interno (o `redirect:'manual'` impede o fetch nativo de segui-lo).
 */
async function safeFetch(
  startUrl: string,
  method: 'HEAD' | 'GET',
  maxHops = 4
): Promise<Response> {
  let current = startUrl
  for (let hop = 0; hop <= maxHops; hop++) {
    const safe = assertFetchableWebUrl(current)
    if (!safe) {
      throw new Error('URL aponta para destino não permitido (privado/interno ou protocolo inválido)')
    }
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    let res: Response
    try {
      res = await fetch(safe, {
        method,
        signal: controller.signal,
        redirect: 'manual',
        headers: { 'User-Agent': 'CamaraPortal-TransparencyAudit/1.0' },
      })
    } finally {
      clearTimeout(timer)
    }
    const isRedirect = res.status >= 300 && res.status < 400 && res.headers.has('location')
    if (!isRedirect) return res
    const next = new URL(res.headers.get('location')!, safe).toString()
    current = next
  }
  throw new Error('Muitos redirecionamentos')
}

async function checkExternalUrl(url: string): Promise<{ health: LinkHealth; status: number | null; detail: string }> {
  if (!assertFetchableWebUrl(url)) {
    return {
      health: 'invalido',
      status: null,
      detail: 'URL externa inválida ou apontando para destino interno/privado — não verificada por segurança',
    }
  }
  try {
    let res = await safeFetch(url, 'HEAD')
    if (res.status === 405 || res.status === 501) {
      res = await safeFetch(url, 'GET')
    }
    if (res.ok) {
      return { health: 'externo_ok', status: res.status, detail: `URL externa responde (${res.status})` }
    }
    return {
      health: 'externo_falha',
      status: res.status,
      detail: `URL externa retornou HTTP ${res.status} — verifique se o link ainda é válido`,
    }
  } catch (e: any) {
    return {
      health: 'externo_falha',
      status: null,
      detail: `Não foi possível acessar a URL externa${e?.message ? `: ${e.message}` : ''}`,
    }
  }
}

/** Audita links da transparência: URL válida, conteúdo interno preenchido/atualizado, URLs externas acessíveis. */
export default class TransparencyAuditService {
  static async audit(options: { checkExternal?: boolean } = {}): Promise<TransparencyAuditReport> {
    const checkExternal = options.checkExternal !== false

    // Servimos do cache quando ainda fresco (evita verificações HTTP sequenciais a cada GET).
    const cacheKey = checkExternal ? 'ext' : 'noext'
    const cached = auditCache.get(cacheKey)
    if (cached && Date.now() - cached.at < AUDIT_TTL_MS) {
      return cached.report
    }

    moduleCache.clear()

    const [sections, links] = await Promise.all([
      TransparencySection.query().where('is_active', true).orderBy('display_order'),
      TransparencyLink.query().orderBy('display_order'),
    ])
    const sectionById = new Map(sections.map((s) => [s.id, s.title]))

    // Verificações em paralelo (Promise.all preserva a ordem dos links).
    const items: LinkAuditItem[] = await Promise.all(
      links.map(async (link): Promise<LinkAuditItem> => {
        const sectionTitle = sectionById.get(link.sectionId) ?? 'Sem seção'
        const base: Omit<LinkAuditItem, 'health' | 'detail'> = {
          id: link.id,
          title: link.title,
          url: link.url,
          sectionTitle,
          isExternal: link.isExternal,
          openMode: link.openMode,
          matchedModule: null,
          contentTotal: null,
          contentLatest: null,
          httpStatus: null,
          adminHref: '/painel/transparencia',
        }

        const path = normalizePath(link.url)
        if (!path) {
          return {
            ...base,
            health: 'invalido',
            detail: 'URL vazia, inválida ou placeholder — configure o destino do link',
          }
        }

        const probe = resolveProbe(path)
        if (probe && (!isExternalUrl(link.url) || link.url.includes('camaradesume') || link.url.includes('localhost'))) {
          const snap = await probeModule(probe)
          const { health, detail } = evaluateModuleHealth(probe, snap)
          return {
            ...base,
            health,
            detail,
            matchedModule: probe.label,
            contentTotal: snap.total,
            contentLatest: snap.latest?.toISODate() ?? null,
            adminHref: probe.adminHref,
          }
        }

        if (link.isExternal || isExternalUrl(link.url)) {
          if (!checkExternal) {
            return {
              ...base,
              health: 'externo_ok',
              detail: 'Link externo (verificação HTTP desativada nesta execução)',
            }
          }
          const ext = await checkExternalUrl(link.url)
          return {
            ...base,
            health: ext.health,
            detail: ext.detail,
            httpStatus: ext.status,
            matchedModule: 'Sistema externo',
          }
        }

        // Rota interna sem mapeamento direto (página estática, transparência modal etc.)
        if (path.startsWith('/transparencia')) {
          return {
            ...base,
            health: 'ok',
            detail: 'Deep-link de transparência — conteúdo definido no modal do link',
            matchedModule: 'Transparência',
          }
        }

        return {
          ...base,
          health: 'parcial',
          detail: `Rota interna (${path}) sem verificação automática de conteúdo — confira manualmente`,
          matchedModule: path,
        }
      })
    )

    const summary = {
      total: items.length,
      ok: items.filter((i) => i.health === 'ok' || i.health === 'externo_ok').length,
      parcial: items.filter((i) => i.health === 'parcial').length,
      falha: items.filter((i) => i.health === 'falha' || i.health === 'invalido' || i.health === 'externo_falha').length,
      externo: items.filter((i) => i.isExternal || isExternalUrl(i.url)).length,
    }

    const contentGaps = items.filter(
      (i) => i.health === 'falha' || i.health === 'parcial' || i.health === 'externo_falha' || i.health === 'invalido'
    )

    const report: TransparencyAuditReport = {
      links: items,
      summary,
      contentGaps,
      checkedAt: DateTime.now().toISO(),
    }
    auditCache.set(cacheKey, { at: Date.now(), report })
    return report
  }
}
