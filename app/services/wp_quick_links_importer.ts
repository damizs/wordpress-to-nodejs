import { existsSync, readFileSync } from 'node:fs'
import app from '@adonisjs/core/services/app'
import QuickLink from '#models/quick_link'

interface WpQuickLink {
  secao_id: string
  title: string
  url: string
  icon: string | null
  color: string | null
  active: boolean
  displayOrder: number
}

interface Logger {
  info(message: string): void
  success(message: string): void
  warning(message: string): void
}

const consoleLogger: Logger = {
  info: (message) => console.log(message),
  success: (message) => console.log(message),
  warning: (message) => console.warn(message),
}

const iconMap: Record<string, string> = {
  'fas fa-video': 'Video',
  'fas fa-users': 'Users',
  'fas fa-building': 'Building2',
  'fas fa-landmark': 'Landmark',
  'fas fa-user-tie': 'UserCheck',
  'fas fa-award': 'Award',
  'fas fa-file-alt': 'FileText',
  'fas fa-table': 'Table',
  'fas fa-hard-hat': 'HardHat',
  'fas fa-dollar-sign': 'DollarSign',
  'fas fa-coins': 'Coins',
  'fas fa-user-graduate': 'GraduationCap',
  'fas fa-id-badge': 'BadgeCheck',
  'fas fa-clipboard-list': 'ClipboardList',
  'fas fa-handshake': 'Handshake',
  'fas fa-file-signature': 'FileSignature',
  'fas fa-sitemap': 'Network',
  'fas fa-chart-pie': 'PieChart',
  'fas fa-envelope-open-text': 'MailOpen',
  'fas fa-clipboard-check': 'ClipboardCheck',
  'fas fa-chart-line': 'TrendingUp',
  'fas fa-book-open': 'BookOpen',
  'fas fa-exclamation-circle': 'AlertCircle',
  'fas fa-gavel': 'Gavel',
  'fas fa-search': 'Search',
  'fas fa-calendar': 'Calendar',
  'fas fa-file-contract': 'FileText',
}

function normalizeUrl(url: string): string {
  return url
    .replace('https://camaradesume.pb.gov.br/', '/')
    .replace('http://camaradesume.pb.gov.br/', '/')
}

export async function importWpQuickLinks(
  opts: { logger?: Logger } = {}
): Promise<{ imported: number; updated: number; skipped: number; ignored: number; skippedFile?: boolean }> {
  const logger = opts.logger ?? consoleLogger
  const path = app.makePath('database', 'wp_quick_links.json')

  if (!existsSync(path)) {
    logger.warning('  wp_quick_links.json nao encontrado - pulando links rapidos')
    return { imported: 0, updated: 0, skipped: 0, ignored: 0, skippedFile: true }
  }

  const data = JSON.parse(readFileSync(path, 'utf-8')) as { records: WpQuickLink[] }
  const records = data.records || []
  const legislative = records.filter((link) => String(link.secao_id) === '1')
  const ignored = records.length - legislative.length

  logger.info(
    `\nLinks rapidos (WordPress): ${legislative.length} atalhos da home (${ignored} links PNTP ignorados)`
  )

  let imported = 0
  let updated = 0
  let skipped = 0

  for (const [index, link] of legislative.entries()) {
    if (!link.active || !link.title || !link.url) {
      skipped++
      continue
    }

    const url = normalizeUrl(link.url)
    const payload = {
      title: link.title,
      url,
      icon: iconMap[link.icon || ''] || 'Link',
      color: link.color,
      displayOrder: link.displayOrder || index + 1,
      isActive: true,
      openMode: 'nova_aba',
      hideChrome: true,
    }

    const existing = await QuickLink.query().where('title', link.title).first()
    if (existing) {
      existing.merge(payload)
      await existing.save()
      updated++
      continue
    }

    await QuickLink.create(payload)
    imported++
  }

  logger.success(`  Links rapidos: ${imported} novo(s), ${updated} atualizado(s), ${skipped} ignorado(s)`)
  return { imported, updated, skipped, ignored }
}
