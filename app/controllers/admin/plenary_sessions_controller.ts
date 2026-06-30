import type { HttpContext } from '@adonisjs/core/http'
import PlenarySession from '#models/plenary_session'
import SystemCategory from '#models/system_category'
import { sessionSlug } from '#helpers/slug'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { sanitizeRichHtml } from '#helpers/sanitize_html'
import { normalizeSafeWebUrl } from '#helpers/safe_url'
import { assertSafeUpload } from '#helpers/upload_security'
import TrashService from '#services/trash_service'

export default class PlenarySessionsController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const year = request.input('year', '')
    const type = request.input('type', '')

    let query = PlenarySession.query().whereNull('deleted_at').orderBy('session_date', 'desc')
    if (year) query = query.where('year', year)
    if (type) query = query.where('type', type)

    const sessions = await query.paginate(page, 20)
    return inertia.render('admin/plenary-sessions/index', {
      sessions: sessions.serialize(),
      filters: { year, type },
    })
  }

  async create({ inertia }: HttpContext) {
    const sessionTypes = await SystemCategory.byType('session_type')
    return inertia.render('admin/plenary-sessions/form', {
      session: null,
      sessionTypes: sessionTypes.map((t) => t.serialize()),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only([
      'title',
      'type',
      'session_date',
      'year',
      'start_time',
      'status',
      'agenda',
      'minutes',
      'video_url',
      'file_url',
      'voting_system_id',
      'voting_system_url',
    ])

    const plenarySession = await PlenarySession.create({
      title: data.title,
      slug: sessionSlug(data.title, data.session_date),
      type: data.type || 'ordinaria',
      sessionDate: data.session_date,
      year: data.year ? Number.parseInt(data.year) : new Date(data.session_date).getFullYear(),
      startTime: data.start_time || null,
      status: data.status || 'realizada',
      agenda: sanitizeRichHtml(data.agenda) || null,
      minutes: sanitizeRichHtml(data.minutes) || null,
      videoUrl: normalizeSafeWebUrl(data.video_url),
      fileUrl: normalizeSafeWebUrl(data.file_url),
      votingSystemId: data.voting_system_id || null,
      votingSystemUrl: normalizeSafeWebUrl(data.voting_system_url),
    })
    await this.saveFile(request, plenarySession)

    session.flash('success', 'Sessão cadastrada com sucesso!')
    return response.redirect().toPath('/painel/sessoes')
  }

  async edit({ params, inertia }: HttpContext) {
    const plenarySession = await PlenarySession.findOrFail(params.id)
    const sessionTypes = await SystemCategory.byType('session_type')
    return inertia.render('admin/plenary-sessions/form', {
      session: plenarySession.serialize(),
      sessionTypes: sessionTypes.map((t) => t.serialize()),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const plenarySession = await PlenarySession.findOrFail(params.id)
    const data = request.only([
      'title',
      'type',
      'session_date',
      'year',
      'start_time',
      'status',
      'agenda',
      'minutes',
      'video_url',
      'file_url',
      'voting_system_id',
      'voting_system_url',
    ])

    plenarySession.merge({
      title: data.title,
      slug: plenarySession.slug || sessionSlug(data.title, data.session_date),
      type: data.type || 'ordinaria',
      sessionDate: data.session_date,
      year: data.year ? Number.parseInt(data.year) : new Date(data.session_date).getFullYear(),
      startTime: data.start_time || null,
      status: data.status || 'realizada',
      agenda: sanitizeRichHtml(data.agenda) || null,
      minutes: sanitizeRichHtml(data.minutes) || null,
      videoUrl: normalizeSafeWebUrl(data.video_url),
      votingSystemId: data.voting_system_id || null,
      votingSystemUrl: normalizeSafeWebUrl(data.voting_system_url),
    })
    // PDF: URL externa textual só substitui quando enviada; o upload novo
    // (request.file('file')) tem prioridade; sem nenhum dos dois, mantém o PDF atual.
    const externalFileUrl = normalizeSafeWebUrl(data.file_url)
    if (externalFileUrl) plenarySession.fileUrl = externalFileUrl
    await this.saveFile(request, plenarySession)
    await plenarySession.save()

    session.flash('success', 'Sessão atualizada com sucesso!')
    return response.redirect().toPath('/painel/sessoes')
  }

  async destroy(ctx: HttpContext) {
    const { params, response, session } = ctx
    const plenarySession = await PlenarySession.findOrFail(params.id)
    await TrashService.moveToTrash(plenarySession, ctx, {
      displayName: plenarySession.title,
      resource: 'sessao',
    })
    session.flash('success', 'Sessão movida para a lixeira.')
    return response.redirect().toPath('/painel/sessoes')
  }

  private async saveFile(request: HttpContext['request'], plenarySession: PlenarySession) {
    const file = request.file('file', { size: '30mb', extnames: ['pdf'] })
    if (!file) return

    await assertSafeUpload(file, ['pdf'])
    const uploadDir = join(app.publicPath(), 'uploads', 'sessoes')
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

    const fileName = `sessao-${cuid()}.${file.extname}`
    await file.move(uploadDir, { name: fileName })
    if (file.state === 'moved') {
      plenarySession.fileUrl = `/uploads/sessoes/${fileName}`
      await plenarySession.save()
    }
  }
}
