import { existsSync, readFileSync } from 'node:fs'
import app from '@adonisjs/core/services/app'
import OfficialGazetteEntry from '#models/official_gazette_entry'

interface WpDiarioRecord {
  codigo: string
  titulo: string
  tipo: string | null
  data: string | null
  link: string | null
  pdfUrl: string | null
}

interface Logger {
  info: (message: string) => void
  success: (message: string) => void
  warning: (message: string) => void
}

const consoleLogger: Logger = {
  info: (message) => console.log(message),
  success: (message) => console.log(message),
  warning: (message) => console.warn(message),
}

function cleanTitle(record: WpDiarioRecord): string {
  const title = record.titulo?.trim()
  if (title) return title
  return record.tipo ? `${record.tipo} - ${record.codigo}` : `Diário Oficial - ${record.codigo}`
}

function validDate(value: string | null): string | null {
  if (!value) return null
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}

export async function importWpDiarioOficial(
  opts: { logger?: Logger; dryRun?: boolean } = {}
): Promise<{ records: number; created: number; updated: number; skipped: number; skippedFile?: boolean }> {
  const logger = opts.logger ?? consoleLogger
  const path = app.makePath('database', 'wp_diario_oficial.json')

  if (!existsSync(path)) {
    logger.warning('  wp_diario_oficial.json não encontrado - pulando Diário Oficial')
    return { records: 0, created: 0, updated: 0, skipped: 0, skippedFile: true }
  }

  const data = JSON.parse(readFileSync(path, 'utf-8')) as { records: WpDiarioRecord[] }
  const records = data.records || []
  logger.info(`\nDiário Oficial (WordPress/GET Public): ${records.length} registro(s)`)

  if (opts.dryRun) {
    return { records: records.length, created: 0, updated: 0, skipped: 0 }
  }

  let created = 0
  let updated = 0
  let skipped = 0

  for (const record of records) {
    const code = record.codigo?.trim()
    const publicationDate = validDate(record.data)
    if (!code || !publicationDate) {
      skipped++
      continue
    }

    const payload = {
      publicationDate,
      description: cleanTitle(record),
      fileUrl: record.pdfUrl || record.link,
    }

    const existing = await OfficialGazetteEntry.findBy('editionNumber', code)
    if (existing) {
      existing.merge(payload)
      await existing.save()
      updated++
      continue
    }

    await OfficialGazetteEntry.create({
      editionNumber: code,
      ...payload,
    })
    created++
  }

  logger.success(`  Diário Oficial: ${created} novo(s), ${updated} atualizado(s), ${skipped} ignorado(s)`)
  return { records: records.length, created, updated, skipped }
}
