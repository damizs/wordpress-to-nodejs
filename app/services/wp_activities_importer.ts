import { readFileSync, existsSync } from 'node:fs'
import { mkdir, copyFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import { cuid } from '@adonisjs/core/helpers'
import Councilor from '#models/councilor'
import LegislativeActivity from '#models/legislative_activity'
import { buildActivitySummary } from '#helpers/text_excerpt'
/**
 * Importa as Atividades Legislativas (CPT `a-legislativa`) com a AUTORIA dos
 * vereadores, a partir de `database/wp_activities.json` (gerado por
 * `scripts/extract_wp_activities.mjs`). É a FONTE ÚNICA de `legislative_activities`:
 * limpa + reimporta + sincroniza o pivô `legislative_activity_authors`,
 * casando autor↔vereador por slug/nome/nome-parlamentar. Idempotente.
 */

interface WpActivity {
  wpId: string
  title: string
  slug: string
  type: string
  number: string | null
  year: number | null
  date: string | null
  situacao: string | null
  ementa?: string | null
  content: string
  anexoPath: string | null
  status: string
  authors: { name: string; parliamentaryName: string | null; slug: string }[]
}

interface Logger {
  info(msg: string): void
  success(msg: string): void
  warning(msg: string): void
}

const consoleLogger: Logger = {
  info: (m) => console.log(m),
  success: (m) => console.log(m),
  warning: (m) => console.warn(m),
}

export function normName(s: string | null | undefined): string {
  return (s || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function slugify(t: string): string {
  return (t || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

/** Limpeza leve do HTML/conteúdo vindo do WordPress (shortcodes, escapes). */
function cleanContent(c: string): string {
  let text = (c || '')
    .replace(/\\\\r\\\\n/g, '\n')
    .replace(/\\r\\n/g, '\n')
    .replace(/\\\\"/g, '"')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\'/g, "'")
    .replace(/\[\/?(vc_|et_|fusion_|elementor)[^\]]*\]/g, '')
    .replace(/\r\n/g, '\n')
    .trim()
  if (!/<(p|div|h[1-6]|ul|ol|table|blockquote)\b/i.test(text)) {
    text = text
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
      .join('\n')
  }
  return text
}

/** Valores aceitos pelo CHECK/enum de `legislative_activities.status`. */
const DB_STATUSES = ['tramitando', 'aprovado', 'rejeitado', 'arquivado'] as const
type DbStatus = (typeof DB_STATUSES)[number]

function mapStatus(situacao: string | null): DbStatus {
  if (!situacao) return 'tramitando'
  const s = situacao.toLowerCase()
  if (s.includes('aprov') || s.includes('sancion')) return 'aprovado'
  if (s.includes('rejeit') || s.includes('reprov')) return 'rejeitado'
  if (s.includes('arquiv')) return 'arquivado'
  if (s.includes('vet')) return 'arquivado'
  if (s.includes('apresent') || s.includes('tramit') || s.includes('andamento')) return 'tramitando'
  const normalized = s.replace(/\s+/g, '_') as DbStatus
  if (DB_STATUSES.includes(normalized)) return normalized
  return 'tramitando'
}

const LIVE_SITE = 'https://camaradesume.pb.gov.br'

/** Resolve PDF da matéria: arquivo local da migração WP ou download do site ao vivo. */
async function resolvePdfUrl(
  anexoPath: string | null,
  wpDir: string,
  slug: string
): Promise<string | null> {
  if (!anexoPath) return null

  const rel = anexoPath.replace(/^\/+/, '')
  const localSrc = join(app.publicPath(), wpDir.replace(/^\//, ''), rel)
  if (existsSync(localSrc)) {
    const destDir = join(app.publicPath(), 'uploads', 'atividades')
    if (!existsSync(destDir)) await mkdir(destDir, { recursive: true })
    const ext = rel.split('.').pop() || 'pdf'
    const destName = `${slug}-${cuid()}.${ext}`
    await copyFile(localSrc, join(destDir, destName))
    return `/uploads/atividades/${destName}`
  }

  const remote = `${LIVE_SITE}/wp-content/uploads/${rel}`
  try {
    const res = await fetch(remote, { redirect: 'follow' })
    if (!res.ok) return remote
    const buf = Buffer.from(await res.arrayBuffer())
    const destDir = join(app.publicPath(), 'uploads', 'atividades')
    if (!existsSync(destDir)) await mkdir(destDir, { recursive: true })
    const ext = rel.split('.').pop()?.toLowerCase() === 'pdf' ? 'pdf' : 'pdf'
    const destName = `${slug}-${cuid()}.${ext}`
    await writeFile(join(destDir, destName), buf)
    return `/uploads/atividades/${destName}`
  } catch {
    return remote
  }
}

export async function importActivitiesWithAuthors(
  opts: { wpDir?: string; logger?: Logger } = {}
): Promise<{ ok: number; links: number; unmatched: string[]; skipped?: boolean }> {
  const logger = opts.logger ?? consoleLogger
  const wpDir = opts.wpDir ?? '/uploads/wp-migration'

  const path = app.makePath('database', 'wp_activities.json')
  if (!existsSync(path)) {
    logger.warning('  wp_activities.json não encontrado — pulando atividades + autoria')
    return { ok: 0, links: 0, unmatched: [], skipped: true }
  }
  const { activities } = JSON.parse(readFileSync(path, 'utf-8')) as { activities: WpActivity[] }
  logger.info(`\n━━━ Atividades + Autoria: ${activities.length} itens ━━━`)

  // Fonte única e autoritativa: limpa atividades + pivô e reimporta
  // (evita duplicatas com as atividades legadas, que usavam outro slug).
  await db.from('legislative_activity_authors').delete()
  await LegislativeActivity.query().delete()

  // Lookup de vereadores por chave normalizada (nome, nome completo, parlamentar, slug)
  const councilors = await Councilor.all()
  const byKey = new Map<string, number>()
  const addKey = (k: string | null | undefined, id: number) => {
    const n = normName(k)
    if (n) byKey.set(n, id)
  }
  for (const c of councilors) {
    addKey(c.name, c.id)
    addKey(c.fullName, c.id)
    addKey(c.parliamentaryName, c.id)
    addKey(c.slug, c.id)
  }

  let ok = 0
  let links = 0
  let failed = 0
  const unmatched = new Set<string>()
  for (const a of activities) {
    try {
      const slug = a.slug || slugify(`${a.type}-${a.number ?? a.wpId}`)
      const year = a.year || (a.date ? Number.parseInt(String(a.date).slice(0, 4)) : 2025)
      const content = cleanContent(a.content || '')
      const summary = buildActivitySummary(a.ementa, content, a.title)
      const fileUrl = await resolvePdfUrl(a.anexoPath, wpDir, slug)
      const status = mapStatus(a.situacao)

      const activity = await LegislativeActivity.updateOrCreate(
        { slug },
        {
          title: a.title,
          slug,
          type: a.type || 'Matéria',
          number: a.number || '',
          year,
          summary,
          content,
          status,
          author: a.authors?.[0]?.parliamentaryName || a.authors?.[0]?.name || null,
          sessionDate: a.date || null,
          fileUrl,
          isActive: a.status ? a.status === 'publish' : true,
        }
      )

      const ids: number[] = []
      for (const au of a.authors || []) {
        const id =
          byKey.get(normName(au.slug)) ??
          byKey.get(normName(au.name)) ??
          byKey.get(normName(au.parliamentaryName))
        if (id) ids.push(id)
        else if (au.name) unmatched.add(au.name)
      }
      await activity.related('authors').sync([...new Set(ids)])
      links += ids.length
      ok++
    } catch (err) {
      failed++
      const msg = err instanceof Error ? err.message : String(err)
      logger.warning(`  FAIL ${a.slug || a.title}: ${msg.slice(0, 120)}`)
    }
  }

  logger.success(`  Atividades: ${ok} upsert, ${links} vínculos de autoria${failed ? `, ${failed} falha(s)` : ''}`)
  if (unmatched.size > 0) {
    logger.warning(`  Autores sem vereador: ${[...unmatched].join('; ')}`)
  }
  return { ok, links, unmatched: [...unmatched] }
}
