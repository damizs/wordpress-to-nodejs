import type { HttpContext } from '@adonisjs/core/http'
import Pauta from '#models/pauta'
import SystemCategory from '#models/system_category'
import { sessionSlug } from '#helpers/slug'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { sanitizeRichHtml } from '#helpers/sanitize_html'
import { assertSafeUpload } from '#helpers/upload_security'

export default class PautasController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const year = request.input('year', '')
    const type = request.input('type', '')

    let query = Pauta.query().orderBy('document_date', 'desc')
    if (year) query = query.where('year', year)
    if (type) query = query.where('type', type)

    const pautas = await query.paginate(page, 20)
    const yearRows = await Pauta.query().distinct('year').orderBy('year', 'desc')

    return inertia.render('admin/pautas/index', {
      pautas: pautas.serialize(),
      filters: { year, type },
      years: yearRows.map((r) => r.year).filter(Boolean),
    })
  }

  async create({ inertia }: HttpContext) {
    const sessionTypes = await SystemCategory.byType('session_type')
    return inertia.render('admin/pautas/form', {
      pauta: null,
      sessionTypes: sessionTypes.map((t) => t.serialize()),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = this.payload(request)
    const pauta = await Pauta.create({
      ...data,
      slug: await this.uniqueSlug(sessionSlug(data.title, data.documentDate)),
    })
    await this.saveFile(request, pauta)

    session.flash('success', 'Pauta cadastrada com sucesso!')
    return response.redirect().toPath('/painel/pautas')
  }

  async edit({ params, inertia }: HttpContext) {
    const pauta = await Pauta.findOrFail(params.id)
    const sessionTypes = await SystemCategory.byType('session_type')
    return inertia.render('admin/pautas/form', {
      pauta: pauta.serialize(),
      sessionTypes: sessionTypes.map((t) => t.serialize()),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const pauta = await Pauta.findOrFail(params.id)
    pauta.merge(this.payload(request))
    await this.saveFile(request, pauta)
    await pauta.save()

    session.flash('success', 'Pauta atualizada com sucesso!')
    return response.redirect().toPath('/painel/pautas')
  }

  async destroy({ params, response, session }: HttpContext) {
    const pauta = await Pauta.findOrFail(params.id)
    await pauta.delete()
    session.flash('success', 'Pauta excluída com sucesso!')
    return response.redirect().toPath('/painel/pautas')
  }

  /* ============================== Helpers ============================== */

  private payload(request: HttpContext['request']) {
    const d = request.only([
      'title',
      'type',
      'document_date',
      'year',
      'doc_time',
      'content',
      'is_published',
    ])
    const documentDate = d.document_date
    return {
      title: d.title,
      type: d.type || 'ordinaria',
      documentDate,
      year: d.year ? Number.parseInt(d.year) : new Date(documentDate).getFullYear(),
      docTime: d.doc_time || null,
      content: sanitizeRichHtml(d.content) || null,
      isPublished:
        d.is_published === undefined ? true : d.is_published === 'true' || d.is_published === true,
    }
  }

  private async uniqueSlug(base: string): Promise<string> {
    let slug = base || `pauta-${cuid()}`
    let n = 2
    while (await Pauta.findBy('slug', slug)) {
      slug = `${base}-${n++}`
    }
    return slug
  }

  private async saveFile(request: HttpContext['request'], pauta: Pauta) {
    const file = request.file('file', { size: '30mb', extnames: ['pdf'] })
    if (!file) return
    await assertSafeUpload(file, ['pdf'])
    const uploadDir = join(app.publicPath(), 'uploads', 'pautas')
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
    const fileName = `pauta-${cuid()}.${file.extname}`
    await file.move(uploadDir, { name: fileName })
    if (file.state === 'moved') {
      pauta.fileUrl = `/uploads/pautas/${fileName}`
      await pauta.save()
    }
  }
}
