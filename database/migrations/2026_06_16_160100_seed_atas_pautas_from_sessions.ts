import { BaseSchema } from '@adonisjs/lucid/schema'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

/**
 * Move o conteúdo de atas (minutes/file_url) e pautas (agenda) que estava em
 * `plenary_sessions` para as novas tabelas independentes. Idempotente: só roda
 * quando as tabelas de destino estão vazias.
 */
export default class extends BaseSchema {
  async up() {
    const now = DateTime.now().toSQL({ includeOffset: false })

    const atasCount = await db.from('atas').count('* as total')
    if (Number(atasCount[0].total) === 0) {
      const sessions = await db
        .from('plenary_sessions')
        .whereNotNull('slug')
        .where((q) => {
          q.whereNotNull('file_url').orWhere((s) => {
            s.whereNotNull('minutes').where('minutes', '!=', '')
          })
        })
      const seen = new Set<string>()
      for (const s of sessions) {
        if (seen.has(s.slug)) continue
        seen.add(s.slug)
        await db.table('atas').insert({
          title: s.title,
          slug: s.slug,
          type: s.type || 'ordinaria',
          document_date: s.session_date,
          year: s.year,
          doc_time: s.start_time,
          content: s.minutes,
          file_url: s.file_url,
          is_published: true,
          display_order: 0,
          created_at: now,
          updated_at: now,
        })
      }
    }

    const pautasCount = await db.from('pautas').count('* as total')
    if (Number(pautasCount[0].total) === 0) {
      const sessions = await db
        .from('plenary_sessions')
        .whereNotNull('slug')
        .whereNotNull('agenda')
        .where('agenda', '!=', '')
      const seen = new Set<string>()
      for (const s of sessions) {
        if (seen.has(s.slug)) continue
        seen.add(s.slug)
        await db.table('pautas').insert({
          title: s.title,
          slug: s.slug,
          type: s.type || 'ordinaria',
          document_date: s.session_date,
          year: s.year,
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
  }

  async down() {
    // Não remove dados: as tabelas são derrubadas pela migration de criação.
  }
}
