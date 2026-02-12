import type { HttpContext } from '@adonisjs/core/http'
import PlenarySession from '#models/plenary_session'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

export default class PlenarySessionsController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const year = request.input('year', '')
    const type = request.input('type', '')

    let query = PlenarySession.query().orderBy('session_date', 'desc')
    if (year) query = query.where('year', year)
    if (type) query = query.where('type', type)

    const sessions = await query.paginate(page, 20)
    return inertia.render('admin/plenary-sessions/index', {
      sessions: sessions.serialize(),
      filters: { year, type },
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/plenary-sessions/form', { session: null })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only([
      'title', 'type', 'session_date', 'year', 'start_time',
      'status', 'agenda', 'minutes', 'video_url',
    ])

    let fileUrl: string | null = null
    const file = request.file('file', { size: '20mb', extnames: ['pdf'] })
    if (file) {
      const uploadDir = join(app.publicPath(), 'uploads', 'atas')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const fileName = `ata-${cuid()}.${file.extname}`
      await file.move(uploadDir, { name: fileName })
      fileUrl = `/uploads/atas/${fileName}`
    }

    await PlenarySession.create({
      title: data.title,
      type: data.type || 'ordinaria',
      sessionDate: data.session_date,
      year: data.year ? parseInt(data.year) : new Date(data.session_date).getFullYear(),
      startTime: data.start_time || null,
      status: data.status || 'realizada',
      agenda: data.agenda || null,
      minutes: data.minutes || null,
      videoUrl: data.video_url || null,
      fileUrl,
    })

    session.flash('success', 'Sessão cadastrada com sucesso!')
    return response.redirect().toPath('/painel/sessoes')
  }

  async edit({ params, inertia }: HttpContext) {
    const plenarySession = await PlenarySession.findOrFail(params.id)
    return inertia.render('admin/plenary-sessions/form', { session: plenarySession.serialize() })
  }

  async update({ params, request, response, session }: HttpContext) {
    const plenarySession = await PlenarySession.findOrFail(params.id)
    const data = request.only([
      'title', 'type', 'session_date', 'year', 'start_time',
      'status', 'agenda', 'minutes', 'video_url',
    ])

    const file = request.file('file', { size: '20mb', extnames: ['pdf'] })
    if (file) {
      const uploadDir = join(app.publicPath(), 'uploads', 'atas')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const fileName = `ata-${cuid()}.${file.extname}`
      await file.move(uploadDir, { name: fileName })
      plenarySession.fileUrl = `/uploads/atas/${fileName}`
    }

    plenarySession.merge({
      title: data.title,
      type: data.type || 'ordinaria',
      sessionDate: data.session_date,
      year: data.year ? parseInt(data.year) : new Date(data.session_date).getFullYear(),
      startTime: data.start_time || null,
      status: data.status || 'realizada',
      agenda: data.agenda || null,
      minutes: data.minutes || null,
      videoUrl: data.video_url || null,
    })
    await plenarySession.save()

    session.flash('success', 'Sessão atualizada com sucesso!')
    return response.redirect().toPath('/painel/sessoes')
  }

  async destroy({ params, response, session }: HttpContext) {
    const plenarySession = await PlenarySession.findOrFail(params.id)
    await plenarySession.delete()
    session.flash('success', 'Sessão excluída com sucesso!')
    return response.redirect().toPath('/painel/sessoes')
  }
}
