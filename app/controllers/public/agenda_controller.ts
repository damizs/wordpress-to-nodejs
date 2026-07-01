import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import PlenarySession from '#models/plenary_session'
import SiteSetting from '#models/site_setting'
import { camara } from '#config/camara'

const TYPE_LABELS: Record<string, string> = {
  ordinaria: 'Ordinária',
  extraordinaria: 'Extraordinária',
  solene: 'Solene',
  especial: 'Especial',
}

const STATUS_LABELS: Record<string, string> = {
  agendada: 'Agendada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
}

function escapeIcs(value: string | null | undefined) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

function formatIcsDateTime(date: string, time?: string | null) {
  const normalizedTime = time || '09:00'
  const dt = DateTime.fromISO(`${date}T${normalizedTime}`, { zone: 'America/Sao_Paulo' })
  return dt.isValid ? dt.toFormat("yyyyMMdd'T'HHmmss") : date.replace(/-/g, '')
}

function configuredHost() {
  const value = camara.siteUrl || camara.baseUrl
  try {
    return new URL(value).host
  } catch {
    return value.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'localhost'
  }
}

export default class AgendaController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const year = request.input('ano', '')
    const type = request.input('tipo', '')
    const status = request.input('situacao', '')
    const search = request.input('busca', '')

    let query = PlenarySession.query().whereNull('deleted_at').orderBy('session_date', 'desc')
    if (year) query = query.where('year', Number.parseInt(year))
    if (type) query = query.where('type', type)
    if (status) query = query.where('status', status)
    if (search) {
      query = query.where((q) => {
        q.whereILike('title', `%${search}%`).orWhereILike('agenda', `%${search}%`)
      })
    }

    const [sessions, years, types] = await Promise.all([
      query.paginate(page, 20),
      PlenarySession.query()
        .whereNull('deleted_at')
        .distinct('year')
        .whereNotNull('year')
        .orderBy('year', 'desc'),
      PlenarySession.query()
        .whereNull('deleted_at')
        .distinct('type')
        .whereNotNull('type')
        .orderBy('type', 'asc'),
    ])
    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/agenda/index', {
      sessions: sessions.all().map((session) => ({
        id: session.id,
        title: session.title,
        slug: session.slug,
        type: session.type,
        type_label: TYPE_LABELS[session.type] || session.type,
        session_date: session.sessionDate,
        start_time: session.startTime,
        status: session.status,
        status_label: STATUS_LABELS[session.status] || session.status,
        agenda: session.agenda,
        minutes: session.minutes,
        video_url: session.videoUrl,
        file_url: session.fileUrl,
        voting_system_url: session.votingSystemUrl,
      })),
      pagination: {
        currentPage: sessions.currentPage,
        lastPage: sessions.lastPage,
        total: sessions.total,
      },
      years: years.map((row) => row.year).filter(Boolean),
      types: types.map((row) => ({ value: row.type, label: TYPE_LABELS[row.type] || row.type })),
      statuses: Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
      filters: { year, type, status, search },
      siteSettings,
    })
  }

  async ics({ request, response }: HttpContext) {
    const sessions = await PlenarySession.query()
      .whereNull('deleted_at')
      .orderBy('session_date', 'asc')
      .limit(500)
    const host = request.header('host') || configuredHost()
    const uidHost = host.replace(/:\d+$/, '')
    const proto = request.header('x-forwarded-proto') || 'https'
    const baseUrl = `${proto}://${host}`
    const now = DateTime.now().toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'")

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      `PRODID:-//${escapeIcs(camara.nome)}//Agenda//PT-BR`,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:Agenda de Sessões - ${escapeIcs(camara.nome)}`,
      'X-WR-TIMEZONE:America/Sao_Paulo',
    ]

    for (const session of sessions) {
      const start = formatIcsDateTime(session.sessionDate, session.startTime)
      const end = DateTime.fromFormat(start, "yyyyMMdd'T'HHmmss", { zone: 'America/Sao_Paulo' })
        .plus({ hours: 2 })
        .toFormat("yyyyMMdd'T'HHmmss")
      const url = `${baseUrl}/agenda`
      const description = [
        `Tipo: ${TYPE_LABELS[session.type] || session.type}`,
        `Situação: ${STATUS_LABELS[session.status] || session.status}`,
        session.agenda ? `Pauta: ${session.agenda}` : '',
        session.videoUrl ? `Vídeo: ${session.videoUrl}` : '',
        session.votingSystemUrl ? `Sistema de votação: ${session.votingSystemUrl}` : '',
      ]
        .filter(Boolean)
        .join('\n')

      lines.push(
        'BEGIN:VEVENT',
        `UID:sessao-${session.id}@${uidHost}`,
        `DTSTAMP:${now}`,
        `DTSTART;TZID=America/Sao_Paulo:${start}`,
        `DTEND;TZID=America/Sao_Paulo:${end}`,
        `SUMMARY:${escapeIcs(session.title)}`,
        `DESCRIPTION:${escapeIcs(description)}`,
        `URL:${url}`,
        `STATUS:${session.status === 'cancelada' ? 'CANCELLED' : 'CONFIRMED'}`,
        'END:VEVENT'
      )
    }

    lines.push('END:VCALENDAR')
    response.header('Content-Type', 'text/calendar; charset=utf-8')
    response.header('Content-Disposition', 'attachment; filename="agenda-sessoes.ics"')
    return response.send(lines.join('\r\n'))
  }
}
