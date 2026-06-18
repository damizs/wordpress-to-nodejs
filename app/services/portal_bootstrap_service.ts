import { DateTime } from 'luxon'
import { readFileSync, existsSync } from 'node:fs'
import app from '@adonisjs/core/services/app'
import TransparencySection from '#models/transparency_section'
import TransparencyLink from '#models/transparency_link'
import SiteSetting from '#models/site_setting'
import AtriconStatus from '#models/atricon_status'
import Page from '#models/page'
import { ATRICON_CRITERIA } from '#helpers/atricon_matrix'
import {
  DEFAULT_FOOTER_COLUMNS,
  DEFAULT_HEADER_MENU,
  normalizeHeaderMenu,
  type FooterColumn,
  type MenuItem,
} from '#controllers/admin/menus_controller'

interface BootstrapLink {
  title: string
  slug: string
  url: string
  is_external: boolean
  open_mode: string
  section?: string
}

interface BootstrapData {
  links: BootstrapLink[]
  atricon_externals: {
    esic_url: string
    ouvidoria_url: string
    portal_contabil: string
    radar_atricon?: string
  }
}

interface Logger {
  info: (m: string) => void
  success: (m: string) => void
  warning: (m: string) => void
}

const consoleLogger: Logger = {
  info: (m) => console.log(m),
  success: (m) => console.log(m),
  warning: (m) => console.warn(m),
}

const SECTION_ICONS: Record<string, string> = {
  'Despesas e Receitas': 'DollarSign',
  'Pessoal e Servidores': 'Users',
  'Licitações e Contratos': 'FileText',
  'Gestão e Planejamento': 'BarChart3',
  'Legislação e Normas': 'Scale',
  Outros: 'FolderOpen',
}

function sectionForTitle(title: string): string {
  const l = title.toLowerCase()
  if (
    l.includes('despesa') ||
    l.includes('receita') ||
    l.includes('orçament') ||
    l.includes('diária') ||
    l.includes('diaria') ||
    l.includes('covid') ||
    l.includes('pagamento') ||
    l.includes('extra') ||
    l.includes('demostrativ') ||
    l.includes('demonstrativ') ||
    l.includes('portal da transparência')
  )
    return 'Despesas e Receitas'
  if (
    l.includes('servidor') ||
    l.includes('folha') ||
    l.includes('cedido') ||
    l.includes('comissiona') ||
    l.includes('efetivo') ||
    l.includes('lotação') ||
    l.includes('lotacao') ||
    l.includes('remuneração') ||
    l.includes('remuneracao') ||
    l.includes('quadro funcional') ||
    l.includes('padrão remuneratório') ||
    l.includes('padrao remuneratorio')
  )
    return 'Pessoal e Servidores'
  if (
    l.includes('contrato') ||
    l.includes('licitaç') ||
    l.includes('licitac') ||
    l.includes('convenio') ||
    l.includes('convênio') ||
    l.includes('edital') ||
    l.includes('aviso de licita')
  )
    return 'Licitações e Contratos'
  if (
    l.includes('rgf') ||
    l.includes('rreo') ||
    l.includes('gestão') ||
    l.includes('gestao') ||
    l.includes('planej') ||
    l.includes('prestação') ||
    l.includes('prestacao') ||
    l.includes('pca') ||
    l.includes('ppa') ||
    l.includes('parecer') ||
    l.includes('carta')
  )
    return 'Gestão e Planejamento'
  if (
    l.includes('lei') ||
    l.includes('regulament') ||
    l.includes('lai') ||
    l.includes('regimento') ||
    l.includes('e-sic') ||
    l.includes('esic')
  )
    return 'Legislação e Normas'
  if (l.includes('ouvidoria')) return 'Outros'
  if (l.includes('dados abertos') || l.includes('organograma')) return 'Outros'
  return 'Outros'
}

function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

function mapOpenMode(raw: string): string {
  if (raw === 'modal') return 'modal'
  return 'nova_aba'
}

function loadBootstrap(): BootstrapData | null {
  const path = app.makePath('database/transparency_bootstrap.json')
  if (!existsSync(path)) return null
  return JSON.parse(readFileSync(path, 'utf8')) as BootstrapData
}

function parseJsonMenu<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as T) : fallback
  } catch {
    return fallback
  }
}

function patchMenuHref(items: MenuItem[], labelMatch: RegExp, href: string): MenuItem[] {
  return items.map((item) => {
    const children = item.children?.map((c) =>
      labelMatch.test(c.label) ? { ...c, href } : c
    )
    const hrefPatched = labelMatch.test(item.label) ? href : item.href
    return { ...item, href: hrefPatched, ...(children ? { children } : {}) }
  })
}

function patchFooterHref(columns: FooterColumn[], labelMatch: RegExp, href: string): FooterColumn[] {
  return columns.map((col) => ({
    ...col,
    links: col.links.map((l) => (labelMatch.test(l.label) ? { ...l, href } : l)),
  }))
}

async function ensureSection(name: string, order: number): Promise<TransparencySection> {
  const slug = slugify(name)
  let section = await TransparencySection.findBy('slug', slug)
  if (!section) {
    section = await TransparencySection.create({
      title: name,
      slug,
      icon: SECTION_ICONS[name] || 'Link',
      displayOrder: order,
      isActive: true,
    })
  }
  return section
}

async function upsertTransparencyLinks(links: BootstrapLink[], logger: Logger) {
  const sectionOrder = [
    'Despesas e Receitas',
    'Pessoal e Servidores',
    'Licitações e Contratos',
    'Gestão e Planejamento',
    'Legislação e Normas',
    'Outros',
  ]
  const sections = new Map<string, TransparencySection>()
  for (let i = 0; i < sectionOrder.length; i++) {
    sections.set(sectionOrder[i], await ensureSection(sectionOrder[i], i + 1))
  }

  let created = 0
  let updated = 0
  const counters = new Map<string, number>()

  for (const item of links) {
    const secName = item.section || sectionForTitle(item.title)
    const section = sections.get(secName) || sections.get('Outros')!
    const order = (counters.get(secName) ?? 0) + 1
    counters.set(secName, order)

    const isExternal = item.is_external || item.url.startsWith('http')
    let existing: TransparencyLink | null = null
    if (item.slug) {
      existing = await TransparencyLink.query().where('slug', item.slug).first()
    }
    if (!existing) {
      existing = await TransparencyLink.query()
        .where('sectionId', section.id)
        .where('title', item.title)
        .first()
    }
    if (!existing) {
      existing = await TransparencyLink.query().where('title', item.title).first()
    }

    const payload = {
      sectionId: section.id,
      title: item.title,
      slug: item.slug || slugify(item.title),
      url: item.url,
      isExternal,
      openMode: mapOpenMode(item.open_mode),
      hideChrome: false,
      displayOrder: order,
    }

    if (existing) {
      existing.merge(payload)
      await existing.save()
      updated++
    } else {
      await TransparencyLink.create(payload)
      created++
    }
  }

  logger.success(`  Transparência: ${created} link(s) criado(s), ${updated} atualizado(s)`)
}

async function applySiteSettings(externals: BootstrapData['atricon_externals'], logger: Logger) {
  await SiteSetting.setValue('esic_new_url', externals.esic_url, 'esic', 'text')
  await SiteSetting.setValue('esic_consult_url', externals.esic_url, 'esic', 'text')
  await SiteSetting.setValue('ouvidoria_url', externals.ouvidoria_url, 'general', 'text')
  await SiteSetting.setValue(
    'portal_contabil_url',
    externals.portal_contabil,
    'general',
    'text'
  )

  const esicHref = '/#esic'
  const ouvHref = '/ouvidoria'

  const headerRaw = await SiteSetting.getValue('header_menu')
  const header = normalizeHeaderMenu(
    patchMenuHref(
      patchMenuHref(parseJsonMenu(headerRaw, DEFAULT_HEADER_MENU), /e-?sic/i, esicHref),
      /ouvidoria/i,
      ouvHref
    )
  )
  if (!header.some((i) => i.children?.some((c) => /e-?sic/i.test(c.label)))) {
    const cidadao = header.find((i) => /cidad/i.test(i.label))
    if (cidadao?.children) {
      cidadao.children.unshift({ label: 'E-SIC', href: esicHref })
    }
  }
  await SiteSetting.setValue('header_menu', JSON.stringify(header), 'menus', 'json')

  const footerRaw = await SiteSetting.getValue('footer_columns')
  let footer = patchFooterHref(
    patchFooterHref(parseJsonMenu(footerRaw, DEFAULT_FOOTER_COLUMNS), /e-?sic/i, esicHref),
    /ouvidoria/i,
    ouvHref
  )
  await SiteSetting.setValue('footer_columns', JSON.stringify(footer), 'menus', 'json')

  logger.success('  Site settings e menus (E-SIC/Ouvidoria) atualizados')
}

async function markAtriconExternals(externals: BootstrapData['atricon_externals'], logger: Logger) {
  const externalCriteria = ATRICON_CRITERIA.filter((c) => c.external)
  let count = 0
  for (const c of externalCriteria) {
    let evidenceUrl = externals.esic_url
    if (c.dimension === 'ouvidoria') evidenceUrl = externals.ouvidoria_url
    if (c.route === '/dados-abertos') evidenceUrl = '/dados-abertos'

    await AtriconStatus.updateOrCreate(
      { criterionCode: c.code },
      {
        status: 'externo',
        evidenceUrl,
        notes: 'Marcado automaticamente pelo portal:bootstrap (sistema externo contratado).',
        updatedBy: null,
      }
    )
    count++
  }
  logger.success(`  ATRICON: ${count} critério(s) externos marcados`)
}

async function ensureSicPage(logger: Logger) {
  const slug = 'regulamentacao-lai'
  const existing = await Page.findBy('slug', slug)
  if (existing) return

  await Page.create({
    title: 'Regulamentação da LAI',
    slug,
    content: '',
    blocks: [
      {
        type: 'heading',
        text: 'Regulamentação da Lei de Acesso à Informação',
      },
      {
        type: 'text',
        text: 'A Câmara Municipal de Sumé observa a Lei Federal nº 12.527/2011 (Lei de Acesso à Informação — LAI). Os atos normativos locais que regulamentam o acesso à informação nesta Casa estão disponíveis nas Publicações Oficiais e nas perguntas frequentes sobre LAI.',
      },
      {
        type: 'buttons',
        items: [
          { label: 'Publicações Oficiais', url: '/publicacoes-oficiais', variant: 'primary' },
          { label: 'Perguntas sobre LAI', url: '/perguntas-frequentes', variant: 'secondary' },
          { label: 'Fazer pedido (e-SIC)', url: '/#esic', variant: 'secondary' },
        ],
      },
    ],
    metaDescription:
      'Regulamentação local da Lei de Acesso à Informação (LAI) na Câmara Municipal de Sumé.',
    heroSubtitle: 'Lei nº 12.527/2011 — transparência e acesso à informação pública',
    isPublished: true,
    publishedAt: DateTime.now(),
  })
  logger.success('  Página "Regulamentação da LAI" criada')
}

export interface PortalBootstrapResult {
  skipped: boolean
  linksCreated?: number
  linksUpdated?: number
}

export async function runPortalBootstrap(opts?: {
  logger?: Logger
}): Promise<PortalBootstrapResult> {
  const logger = opts?.logger ?? consoleLogger
  const data = loadBootstrap()
  if (!data) {
    logger.warning('database/transparency_bootstrap.json não encontrado — bootstrap ignorado.')
    return { skipped: true }
  }

  logger.info('━━━ Portal bootstrap: links externos + configuração ━━━')
  await upsertTransparencyLinks(data.links, logger)
  await applySiteSettings(data.atricon_externals, logger)
  await markAtriconExternals(data.atricon_externals, logger)
  await ensureSicPage(logger)

  return { skipped: false }
}
