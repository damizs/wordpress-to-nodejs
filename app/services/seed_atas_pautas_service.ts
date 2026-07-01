import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

function sqlDate(value: unknown): string | null {
  if (!value) return null
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return DateTime.fromJSDate(value).toISODate()
  }

  const text = String(value).trim()
  const explicit = text.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
  if (explicit) return explicit

  const iso = DateTime.fromISO(text)
  if (iso.isValid) return iso.toISODate()

  const sql = DateTime.fromSQL(text)
  if (sql.isValid) return sql.toISODate()

  const js = new Date(text)
  if (!Number.isNaN(js.getTime())) return DateTime.fromJSDate(js).toISODate()

  return null
}

function dateFromSession(session: Record<string, any>): string {
  const explicitDate = sqlDate(session.session_date)
  if (explicitDate) return explicitDate

  const createdAt = sqlDate(session.created_at)
  if (createdAt) return createdAt

  return DateTime.now().toISODate()
}

function yearFromSession(session: Record<string, any>, documentDate: string): number | null {
  const year = Number(session.year || String(documentDate).slice(0, 4))
  return Number.isFinite(year) ? year : null
}

/** Completa atas/pautas a partir de `plenary_sessions` sem sobrescrever cadastros manuais. */
export async function seedAtasPautasFromSessions(): Promise<{ atas: number; pautas: number }> {
  const now = DateTime.now().toSQL({ includeOffset: false })
  let atas = 0
  let pautas = 0

  const existingAtaSlugs = new Set(
    (await db.from('atas').select('slug')).map((row) => String(row.slug))
  )
  const ataSessions = await db
    .from('plenary_sessions')
    .whereNotNull('slug')
    .orderBy('session_date', 'asc')
    .orderBy('id', 'asc')
  const seenAtas = new Set<string>()
  for (const session of ataSessions) {
    const slug = String(session.slug || '')
    if (!slug || seenAtas.has(slug) || existingAtaSlugs.has(slug)) continue
    seenAtas.add(slug)
    existingAtaSlugs.add(slug)

    const documentDate = dateFromSession(session)
    await db.table('atas').insert({
      title: session.title,
      slug,
      type: session.type || 'ordinaria',
      document_date: documentDate,
      year: yearFromSession(session, documentDate),
      doc_time: session.start_time,
      content: session.minutes,
      file_url: session.file_url,
      is_published: true,
      display_order: 0,
      created_at: now,
      updated_at: now,
    })
    atas++
  }

  const existingPautaSlugs = new Set(
    (await db.from('pautas').select('slug')).map((row) => String(row.slug))
  )
  const pautaSessions = await db
    .from('plenary_sessions')
    .whereNotNull('slug')
    .whereNotNull('agenda')
    .where('agenda', '!=', '')
    .orderBy('session_date', 'asc')
    .orderBy('id', 'asc')
  const seenPautas = new Set<string>()
  for (const session of pautaSessions) {
    const slug = String(session.slug || '')
    if (!slug || seenPautas.has(slug) || existingPautaSlugs.has(slug)) continue
    seenPautas.add(slug)
    existingPautaSlugs.add(slug)

    const documentDate = dateFromSession(session)
    await db.table('pautas').insert({
      title: session.title,
      slug,
      type: session.type || 'ordinaria',
      document_date: documentDate,
      year: yearFromSession(session, documentDate),
      doc_time: session.start_time,
      content: session.agenda,
      file_url: null,
      is_published: true,
      display_order: 0,
      created_at: now,
      updated_at: now,
    })
    pautas++
  }

  return { atas, pautas }
}
