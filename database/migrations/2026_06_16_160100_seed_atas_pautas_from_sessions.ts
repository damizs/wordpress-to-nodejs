import { BaseSchema } from '@adonisjs/lucid/schema'
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

/**
 * Move o conteúdo de atas (minutes/file_url) e pautas (agenda) que estava em
 * `plenary_sessions` para as novas tabelas independentes. Idempotente: usa o
 * slug como chave e só cria o que ainda não existe.
 */
export default class extends BaseSchema {
  async up() {
    const now = DateTime.now().toSQL({ includeOffset: false })

    const existingAtaSlugs = new Set(
      (await db.from('atas').select('slug')).map((row) => String(row.slug))
    )
    const ataSessions = await db
      .from('plenary_sessions')
      .whereNotNull('slug')
      .orderBy('session_date', 'asc')
      .orderBy('id', 'asc')
    const seenAtas = new Set<string>()
    for (const s of ataSessions) {
      const slug = String(s.slug || '')
      if (!slug || seenAtas.has(slug) || existingAtaSlugs.has(slug)) continue
      seenAtas.add(slug)
      existingAtaSlugs.add(slug)
      const documentDate = sqlDate(s.session_date) || sqlDate(s.created_at) || DateTime.now().toISODate()
      const year = Number(s.year || documentDate.slice(0, 4))
      await db.table('atas').insert({
        title: s.title,
        slug,
        type: s.type || 'ordinaria',
        document_date: documentDate,
        year: Number.isFinite(year) ? year : null,
        doc_time: s.start_time,
        content: s.minutes,
        file_url: s.file_url,
        is_published: true,
        display_order: 0,
        created_at: now,
        updated_at: now,
      })
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
    for (const s of pautaSessions) {
      const slug = String(s.slug || '')
      if (!slug || seenPautas.has(slug) || existingPautaSlugs.has(slug)) continue
      seenPautas.add(slug)
      existingPautaSlugs.add(slug)
      const documentDate = sqlDate(s.session_date) || sqlDate(s.created_at) || DateTime.now().toISODate()
      const year = Number(s.year || documentDate.slice(0, 4))
      await db.table('pautas').insert({
        title: s.title,
        slug,
        type: s.type || 'ordinaria',
        document_date: documentDate,
        year: Number.isFinite(year) ? year : null,
        doc_time: s.start_time,
        content: s.agenda,
        file_url: null,
        is_published: true,
        display_order: 0,
        created_at: now,
        updated_at: now,
      })
    }
  }

  async down() {
    // Não remove dados: as tabelas são derrubadas pela migration de criação.
  }
}
