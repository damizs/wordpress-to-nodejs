import type { HttpContext } from '@adonisjs/core/http'
import LegislativeActivity from '#models/legislative_activity'
import Councilor from '#models/councilor'
import { activitySlug } from '#helpers/slug'
import {
  LEGISLATIVE_ORIGINS,
  inferLegislativeOrigin,
  legislativeOriginLabel,
  normalizeLegislativeOrigin,
} from '#helpers/legislative_origin'
import { sanitizeRichHtml, sanitizePlainText } from '#helpers/sanitize_html'
import { normalizeSafeWebUrl } from '#helpers/safe_url'
import { assertSafeUpload } from '#helpers/upload_security'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import TrashService from '#services/trash_service'

export default class LegislativeActivitiesController {
  private async councilorOptions() {
    const councilors = await Councilor.query()
      .where('is_active', true)
      .orderBy('display_order', 'asc')
    return councilors.map((c) => ({
      id: c.id,
      name: c.parliamentaryName || c.name,
      party: c.party,
      photo: c.photoUrl,
    }))
  }

  /** Resolve o texto do campo author a partir dos vereadores selecionados + texto livre */
  private async resolveAuthor(authorIds: number[], freeText: string | null) {
    if (authorIds.length === 0) return freeText
    const selected = await Councilor.query().whereIn('id', authorIds)
    const names = selected.map((c) => c.parliamentaryName || c.name)
    if (freeText && freeText.trim() !== '') names.push(freeText.trim())
    return names.join(', ')
  }

  private normalizeStatus(status: string | null | undefined) {
    const value = String(status || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    if (value.includes('aprov') || value.includes('sancion')) return 'aprovado'
    if (value.includes('rejeit') || value.includes('reprov')) return 'rejeitado'
    if (value.includes('arquiv') || value.includes('vet')) return 'arquivado'
    return 'tramitando'
  }

  /**
   * Faz upload do arquivo da matéria (PDF/DOC/DOCX) para public/uploads/atividades
   * e retorna o caminho público; retorna null quando nenhum arquivo é enviado.
   */
  private async saveUploadedFile(request: HttpContext['request']): Promise<string | null> {
    const file = request.file('file', { size: '15mb', extnames: ['pdf', 'doc', 'docx'] })
    if (!file) return null
    await assertSafeUpload(file, ['pdf', 'doc', 'docx'])
    const uploadDir = join(app.publicPath(), 'uploads', 'atividades')
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
    const fileName = `atividade-${cuid()}.${file.extname}`
    await file.move(uploadDir, { name: fileName })
    return file.state === 'moved' ? `/uploads/atividades/${fileName}` : null
  }

  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const type = request.input('type', '')
    const year = request.input('year', '')
    const origin = request.input('origin', '')
    const search = request.input('search', '')

    let query = LegislativeActivity.query()
      .whereNull('deleted_at')
      .orderBy('year', 'desc')
      .orderBy('created_at', 'desc')
    if (type) query = query.where('type', type)
    if (year) query = query.where('year', Number.parseInt(year))
    if (origin) query = query.where('origin', normalizeLegislativeOrigin(origin))
    if (search)
      query = query.where((q) => {
        q.whereILike('summary', `%${search}%`)
          .orWhereILike('number', `%${search}%`)
          .orWhereILike('title', `%${search}%`)
      })

    const activities = await query.paginate(page, 20)
    const types = await LegislativeActivity.query().whereNull('deleted_at').distinct('type').orderBy('type')
    const years = await LegislativeActivity.query().whereNull('deleted_at').distinct('year').orderBy('year', 'desc')

    return inertia.render('admin/activities/index', {
      activities: activities.serialize(),
      filters: { type, year, origin, search },
      types: types.map((t) => t.type),
      years: years.map((y) => y.year),
      origins: LEGISLATIVE_ORIGINS.map((value) => ({
        value,
        label: legislativeOriginLabel(value),
      })),
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/activities/form', {
      activity: null,
      councilors: await this.councilorOptions(),
      authorIds: [],
      origins: LEGISLATIVE_ORIGINS.map((value) => ({
        value,
        label: legislativeOriginLabel(value),
      })),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only([
      'title',
      'type',
      'number',
      'year',
      'summary',
      'content',
      'status',
      'origin',
      'author',
      'file_url',
      'session_date',
    ])
    data.year = Number.parseInt(data.year)
    data.status = this.normalizeStatus(data.status)
    data.summary = sanitizePlainText(data.summary)
    data.content = sanitizeRichHtml(data.content)
    // Upload do arquivo (PDF/DOC/DOCX); aceita file_url textual como fallback.
    data.file_url = (await this.saveUploadedFile(request)) || normalizeSafeWebUrl(data.file_url)

    const authorIds = (request.input('author_ids', []) as (number | string)[])
      .map(Number)
      .filter((n) => Number.isFinite(n))
    data.author = await this.resolveAuthor(authorIds, data.author)
    data.origin =
      data.origin && data.origin !== 'nao_informado'
        ? normalizeLegislativeOrigin(data.origin)
        : inferLegislativeOrigin({
            type: data.type,
            title: data.title,
            summary: data.summary,
            content: data.content,
            author: data.author,
            authorsCount: authorIds.length,
          })

    const slug = request.input('slug') || activitySlug(data.type, data.number, data.author)

    const activity = await LegislativeActivity.create({
      ...data,
      slug,
      isActive: true,
    })
    if (authorIds.length > 0) await activity.related('authors').sync(authorIds)

    session.flash('success', 'Atividade legislativa cadastrada!')
    return response.redirect().toPath('/painel/atividades')
  }

  async edit({ params, inertia }: HttpContext) {
    const activity = await LegislativeActivity.query()
      .where('id', params.id)
      .whereNull('deleted_at')
      .preload('authors')
      .firstOrFail()
    return inertia.render('admin/activities/form', {
      activity: activity.serialize(),
      councilors: await this.councilorOptions(),
      authorIds: activity.authors.map((a) => a.id),
      origins: LEGISLATIVE_ORIGINS.map((value) => ({
        value,
        label: legislativeOriginLabel(value),
      })),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const activity = await LegislativeActivity.findOrFail(params.id)
    const data = request.only([
      'title',
      'type',
      'number',
      'year',
      'summary',
      'content',
      'status',
      'origin',
      'author',
      'session_date',
    ])
    data.year = Number.parseInt(data.year)
    data.status = this.normalizeStatus(data.status)
    data.summary = sanitizePlainText(data.summary)
    data.content = sanitizeRichHtml(data.content)

    const authorIds = (request.input('author_ids', []) as (number | string)[])
      .map(Number)
      .filter((n) => Number.isFinite(n))
    data.author = await this.resolveAuthor(authorIds, data.author)
    data.origin =
      data.origin && data.origin !== 'nao_informado'
        ? normalizeLegislativeOrigin(data.origin)
        : inferLegislativeOrigin({
            type: data.type,
            title: data.title,
            summary: data.summary,
            content: data.content,
            author: data.author,
            authorsCount: authorIds.length,
            fallback: activity.origin,
          })

    // Upload do arquivo: novo arquivo substitui; file_url textual é fallback;
    // sem arquivo nem URL, o file_url atual é preservado.
    const uploadedFileUrl = await this.saveUploadedFile(request)
    if (uploadedFileUrl) {
      activity.fileUrl = uploadedFileUrl
    } else {
      const textualFileUrl = normalizeSafeWebUrl(request.input('file_url'))
      if (textualFileUrl) activity.fileUrl = textualFileUrl
    }

    const slug =
      activity.slug || request.input('slug') || activitySlug(data.type, data.number, data.author)

    activity.merge({
      ...data,
      slug,
    })
    await activity.save()
    await activity.related('authors').sync(authorIds)

    session.flash('success', 'Atividade legislativa atualizada!')
    return response.redirect().toPath('/painel/atividades')
  }

  async destroy(ctx: HttpContext) {
    const { params, response, session } = ctx
    const activity = await LegislativeActivity.findOrFail(params.id)
    await TrashService.moveToTrash(activity, ctx, {
      displayName: activity.title || activity.summary,
      resource: 'atividade_legislativa',
    })
    session.flash('success', 'Atividade legislativa movida para a lixeira.')
    return response.redirect().toPath('/painel/atividades')
  }
}
