import type { HttpContext } from '@adonisjs/core/http'
import Ata from '#models/ata'
import SystemCategory from '#models/system_category'
import { sessionSlug } from '#helpers/slug'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

export default class AtasController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const year = request.input('year', '')
    const type = request.input('type', '')

    let query = Ata.query().orderBy('document_date', 'desc')
    if (year) query = query.where('year', year)
    if (type) query = query.where('type', type)

    const atas = await query.paginate(page, 20)
    const yearRows = await Ata.query().distinct('year').orderBy('year', 'desc')

    return inertia.render('admin/atas/index', {
      atas: atas.serialize(),
      filters: { year, type },
      years: yearRows.map((r) => r.year).filter(Boolean),
    })
  }

  async create({ inertia }: HttpContext) {
    const sessionTypes = await SystemCategory.byType('session_type')
    return inertia.render('admin/atas/form', {
      ata: null,
      sessionTypes: sessionTypes.map((t) => t.serialize()),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = this.payload(request)
    const ata = await Ata.create({
      ...data,
      slug: await this.uniqueSlug(sessionSlug(data.title, data.documentDate)),
    })
    await this.saveFile(request, ata)

    session.flash('success', 'Ata cadastrada com sucesso!')
    return response.redirect().toPath('/painel/atas')
  }

  async edit({ params, inertia }: HttpContext) {
    const ata = await Ata.findOrFail(params.id)
    const sessionTypes = await SystemCategory.byType('session_type')
    return inertia.render('admin/atas/form', {
      ata: ata.serialize(),
      sessionTypes: sessionTypes.map((t) => t.serialize()),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const ata = await Ata.findOrFail(params.id)
    ata.merge(this.payload(request))
    await this.saveFile(request, ata)
    await ata.save()

    session.flash('success', 'Ata atualizada com sucesso!')
    return response.redirect().toPath('/painel/atas')
  }

  async destroy({ params, response, session }: HttpContext) {
    const ata = await Ata.findOrFail(params.id)
    await ata.delete()
    session.flash('success', 'Ata excluída com sucesso!')
    return response.redirect().toPath('/painel/atas')
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
      content: d.content || null,
      isPublished:
        d.is_published === undefined ? true : d.is_published === 'true' || d.is_published === true,
    }
  }

  private async uniqueSlug(base: string): Promise<string> {
    let slug = base || `ata-${cuid()}`
    let n = 2
    while (await Ata.findBy('slug', slug)) {
      slug = `${base}-${n++}`
    }
    return slug
  }

  private async saveFile(request: HttpContext['request'], ata: Ata) {
    const file = request.file('file', { size: '30mb', extnames: ['pdf'] })
    if (!file) return
    const uploadDir = join(app.publicPath(), 'uploads', 'atas')
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
    const fileName = `ata-${cuid()}.${file.extname}`
    await file.move(uploadDir, { name: fileName })
    if (file.state === 'moved') {
      ata.fileUrl = `/uploads/atas/${fileName}`
      await ata.save()
    }
  }
}
