import { readFileSync, existsSync } from 'node:fs'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import app from '@adonisjs/core/services/app'
import InformationRecord from '#models/information_record'
import SystemCategory from '#models/system_category'

interface WpAnexo {
  nome: string | null
  url: string | null
  mime: string | null
  ordem: number
}
interface WpRecord {
  secao: string
  ano: number | null
  titulo: string
  conteudo: string | null
  dataReferencia: string | null
  ordem: number
  ativo: boolean
  anexos: WpAnexo[]
}
interface Logger {
  info: (m: string) => void
  success: (m: string) => void
  warning: (m: string) => void
  error: (m: string) => void
}

const consoleLogger: Logger = {
  info: (m) => console.log(m),
  success: (m) => console.log(m),
  warning: (m) => console.warn(m),
  error: (m) => console.error(m),
}

/** Nomes amigáveis das seções PNTP (slug → rótulo). */
const NAME_MAP: Record<string, string> = {
  estagiarios: 'Estagiários',
  terceirizados: 'Terceirizados',
  concursos: 'Concursos',
  estrutura: 'Estrutura Organizacional',
  diarias: 'Diárias',
  'acordos-firmados': 'Acordos Firmados',
  obras: 'Obras',
  'prestacao-contas': 'Prestação de Contas',
  'relatorio-gestao': 'Relatório de Gestão',
  'apreciacao-contas': 'Apreciação de Contas',
  rgf: 'RGF — Relatório de Gestão Fiscal',
  'plano-estrategico': 'Plano Estratégico',
  'parecer-contas': 'Parecer de Contas',
  'carta-servicos': 'Carta de Serviços',
  'plano-contratacoes': 'Plano de Contratações (PCA)',
  'verbas-indenizatorias': 'Verbas Indenizatórias',
  'transferencia-voluntaria': 'Transferências Voluntárias',
  'transferencias-realizadas': 'Transferências Realizadas',
  'adesao-ata-srp': 'Adesão a Ata de Registro de Preços',
  'licitantes-sancionados': 'Licitantes Sancionados',
  ocp: 'Ordem Cronológica de Pagamentos',
  contratos: 'Contratos',
  aditivos: 'Aditivos Contratuais',
  'fiscal-contrato': 'Fiscais de Contrato',
  duodecimo: 'Duodécimos',
  'despesas-mensais': 'Despesas Mensais',
  'empenhos-detalhados': 'Empenhos Detalhados',
}

/**
 * Alias de slug WP → slug canônico já semeado (03_system_categories_seeder),
 * para os registros caírem na categoria existente em vez de criar duplicata.
 */
const SLUG_ALIAS: Record<string, string> = {
  'verbas-indenizatorias': 'verbas',
  estrutura: 'estrutura-organizacional',
  'acordos-firmados': 'acordos',
  'apreciacao-contas': 'apreciacao',
  'plano-contratacoes': 'pca',
  'transferencia-voluntaria': 'transferencias-recebidas',
}

function canon(secao: string): string {
  return SLUG_ALIAS[secao] || secao
}

function titleize(slug: string): string {
  return slug
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

function cleanFileLabel(nome: string | null): string {
  if (!nome) return 'documento'
  return nome
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim()
}

function naturalKey(title: string, category: string, year: number): string {
  return `${category}\u0000${year}\u0000${title}`
}

function uniqueRecordTitle(
  baseTitle: string,
  category: string,
  year: number,
  used: Set<string>,
  fileLabel?: string | null
): string {
  let title = baseTitle
  let key = naturalKey(title, category, year)
  if (!used.has(key)) {
    used.add(key)
    return title
  }

  const label = fileLabel ? cleanFileLabel(fileLabel) : 'documento'
  title = `${baseTitle} — ${label}`
  key = naturalKey(title, category, year)
  let suffix = 2
  while (used.has(key)) {
    title = `${baseTitle} — ${label} ${suffix++}`
    key = naturalKey(title, category, year)
  }
  used.add(key)
  return title
}

/** Caminho local determinístico a partir da URL do anexo (idempotente). */
function localNameFromUrl(url: string): string {
  try {
    const u = new URL(url)
    const after = u.pathname.split('/uploads/').pop() || u.pathname
    return after.replace(/^\/+/, '').replace(/[^a-zA-Z0-9._-]+/g, '-')
  } catch {
    return url.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-120)
  }
}

async function downloadFile(url: string, destDir: string, logger: Logger): Promise<string | null> {
  const localName = localNameFromUrl(url)
  const destPath = join(destDir, localName)
  const publicUrl = `/uploads/acesso-informacao/wp/${localName}`
  if (existsSync(destPath)) return publicUrl
  try {
    const res = await fetch(url)
    if (!res.ok) {
      logger.warning(`    download ${res.status} ${url}`)
      return null
    }
    const buf = Buffer.from(await res.arrayBuffer())
    await writeFile(destPath, buf)
    return publicUrl
  } catch (e) {
    logger.warning(`    download falhou ${url}: ${e instanceof Error ? e.message : e}`)
    return null
  }
}

/**
 * Importa os Registros de Informação (PNTP) extraídos do WordPress, baixando os
 * PDFs do site ao vivo para o portal. Idempotente: faz upsert por
 * (categoria-slug, título, ano) e não apaga registros cadastrados à mão.
 */
export async function importPntpRecords(
  opts: { logger?: Logger; skipDownload?: boolean } = {}
): Promise<{ records: number; files: number; categories: number; skipped?: boolean }> {
  const logger = opts.logger ?? consoleLogger
  const path = join(app.appRoot.pathname, 'database', 'wp_pntp.json')
  if (!existsSync(path)) {
    logger.warning('  wp_pntp.json não encontrado — pulando PNTP')
    return { records: 0, files: 0, categories: 0, skipped: true }
  }
  const data = JSON.parse(readFileSync(path, 'utf-8')) as { records: WpRecord[] }
  const records = data.records || []
  logger.info(`\n━━━ PNTP (Acesso à Informação): ${records.length} registros ━━━`)

  // Garante as categorias (seções) existentes
  const seen = new Set<string>()
  const existingCats = await SystemCategory.query().where('type', 'information_record')
  const catSlugs = new Set(existingCats.map((c) => c.slug))
  let createdCats = 0
  let order = 50
  for (const r of records) {
    const slug = canon(r.secao)
    if (seen.has(slug)) continue
    seen.add(slug)
    if (!catSlugs.has(slug)) {
      await SystemCategory.create({
        type: 'information_record',
        name: NAME_MAP[r.secao] || titleize(slug),
        slug,
        displayOrder: order++,
        isActive: true,
      })
      catSlugs.add(slug)
      createdCats++
    }
  }
  if (createdCats > 0) logger.success(`  ${createdCats} categoria(s) criada(s)`)

  // Diretório de destino dos PDFs
  const destDir = join(app.publicPath(), 'uploads', 'acesso-informacao', 'wp')
  if (!existsSync(destDir)) await mkdir(destDir, { recursive: true })

  const urlCache = new Map<string, string | null>()
  const usedRecordKeys = new Set<string>()
  const seenFileKeys = new Set<string>()
  const fileBackedKeys = new Set<string>()
  for (const r of records) {
    const slug = canon(r.secao)
    const year = r.ano || new Date().getFullYear()
    const anexos = (r.anexos || []).filter((a) => a.url)
    if (anexos.length > 0) fileBackedKeys.add(naturalKey(r.titulo, slug, year))
  }
  let okRecords = 0
  let okFiles = 0

  for (const r of records) {
    const slug = canon(r.secao)
    const year = r.ano || new Date().getFullYear()
    const anexos = (r.anexos || []).filter((a) => a.url)

    if (anexos.length === 0) {
      if (!r.conteudo && fileBackedKeys.has(naturalKey(r.titulo, slug, year))) continue
      // Registro sem anexo: vira nota informativa (conteúdo/declaração)
      const title = uniqueRecordTitle(r.titulo, slug, year, usedRecordKeys)
      await upsertRecord(title, slug, year, r.conteudo, r.dataReferencia, null, r.ordem, r.ativo)
      okRecords++
      continue
    }

    let idx = 0
    for (const a of anexos) {
      const fileKey = `${slug}\u0000${year}\u0000${a.url}`
      if (seenFileKeys.has(fileKey)) continue
      seenFileKeys.add(fileKey)

      let fileUrl: string | null
      if (urlCache.has(a.url!)) {
        fileUrl = urlCache.get(a.url!)!
      } else {
        fileUrl = opts.skipDownload ? null : await downloadFile(a.url!, destDir, logger)
        // Fallback: se o download falhar, mantém o link remoto para não quebrar
        if (!fileUrl) fileUrl = a.url
        else okFiles++
        urlCache.set(a.url!, fileUrl)
      }

      // Título: único quando há vários anexos no mesmo registro
      const baseTitle = anexos.length > 1 ? `${r.titulo} — ${cleanFileLabel(a.nome)}` : r.titulo
      const title = uniqueRecordTitle(baseTitle, slug, year, usedRecordKeys, a.nome)
      // Conteúdo só no primeiro item do grupo (evita duplicar HTML extenso)
      const content = idx === 0 ? r.conteudo : null
      await upsertRecord(title, slug, year, content, r.dataReferencia, fileUrl, r.ordem * 10 + idx, r.ativo)
      okRecords++
      idx++
    }
  }

  logger.success(`  PNTP: ${okRecords} registro(s), ${okFiles} arquivo(s) baixado(s)`)
  return { records: okRecords, files: okFiles, categories: createdCats }
}

async function upsertRecord(
  title: string,
  category: string,
  year: number,
  content: string | null,
  referenceDate: string | null,
  fileUrl: string | null,
  displayOrder: number,
  isActive: boolean
) {
  const existing = await InformationRecord.query()
    .where('title', title)
    .where('category', category)
    .where('year', year)
    .first()
  if (existing) {
    existing.merge({ content, referenceDate, fileUrl, displayOrder, isActive })
    await existing.save()
    return
  }
  await InformationRecord.create({
    title,
    category,
    year,
    content,
    referenceDate,
    fileUrl,
    isActive,
    displayOrder,
    openMode: 'nova_aba',
    hideChrome: true,
  })
}
