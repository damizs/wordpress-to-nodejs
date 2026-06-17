import type { HttpContext } from '@adonisjs/core/http'
import LegislativeActivity, { type TramitationStep } from '#models/legislative_activity'
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

  private parseTramitationSteps(text: string | null | undefined): TramitationStep[] | null {
    const lines = String(text || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)

    if (lines.length === 0) return null

    return lines.map((line) => {
      const parts = line.split('|').map((part) => part.trim())
      if (parts.length === 1) return { title: parts[0] }
      if (parts.length === 2) return { title: parts[0], description: parts[1] }
      return {
        date: parts[0] || null,
        title: parts[1] || 'Etapa',
        description: parts.slice(2).join(' | ') || null,
      }
    })
  }

  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const type = request.input('type', '')
    const year = request.input('year', '')
    const origin = request.input('origin', '')
    const search = request.input('search', '')

    let query = LegislativeActivity.query().orderBy('year', 'desc').orderBy('created_at', 'desc')
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
    const types = await LegislativeActivity.query().distinct('type').orderBy('type')
    const years = await LegislativeActivity.query().distinct('year').orderBy('year', 'desc')

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
      'voting_system_id',
      'voting_system_url',
    ])
    data.year = Number.parseInt(data.year)
    data.status = this.normalizeStatus(data.status)
    data.summary = sanitizePlainText(data.summary)
    data.content = sanitizeRichHtml(data.content)
    data.file_url = normalizeSafeWebUrl(data.file_url)
    data.voting_system_url = normalizeSafeWebUrl(data.voting_system_url)

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
    const tramitationSteps = this.parseTramitationSteps(request.input('tramitation_steps_text'))

    const activity = await LegislativeActivity.create({
      ...data,
      slug,
      isActive: true,
      votingSystemId: data.voting_system_id || null,
      votingSystemUrl: data.voting_system_url || null,
      tramitationSteps,
    })
    if (authorIds.length > 0) await activity.related('authors').sync(authorIds)

    session.flash('success', 'Atividade legislativa cadastrada!')
    return response.redirect().toPath('/painel/atividades')
  }

  async edit({ params, inertia }: HttpContext) {
    const activity = await LegislativeActivity.query()
      .where('id', params.id)
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
      'file_url',
      'session_date',
      'voting_system_id',
      'voting_system_url',
    ])
    data.year = Number.parseInt(data.year)
    data.status = this.normalizeStatus(data.status)
    data.summary = sanitizePlainText(data.summary)
    data.content = sanitizeRichHtml(data.content)
    data.file_url = normalizeSafeWebUrl(data.file_url)
    data.voting_system_url = normalizeSafeWebUrl(data.voting_system_url)

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

    const slug =
      activity.slug || request.input('slug') || activitySlug(data.type, data.number, data.author)
    const tramitationSteps = this.parseTramitationSteps(request.input('tramitation_steps_text'))

    activity.merge({
      ...data,
      slug,
      votingSystemId: data.voting_system_id || null,
      votingSystemUrl: data.voting_system_url || null,
      tramitationSteps,
    })
    await activity.save()
    await activity.related('authors').sync(authorIds)

    session.flash('success', 'Atividade legislativa atualizada!')
    return response.redirect().toPath('/painel/atividades')
  }

  async destroy({ params, response, session }: HttpContext) {
    const activity = await LegislativeActivity.findOrFail(params.id)
    await activity.delete()
    session.flash('success', 'Atividade legislativa excluída!')
    return response.redirect().toPath('/painel/atividades')
  }
}
