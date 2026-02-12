import type { HttpContext } from '@adonisjs/core/http'
import OfficialPublication from '#models/official_publication'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

export default class OfficialPublicationsController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const type = request.input('type', '')

    let query = OfficialPublication.query().orderBy('publication_date', 'desc')
    if (type) query = query.where('type', type)

    const publications = await query.paginate(page, 20)
    return inertia.render('admin/publications/index', {
      publications: publications.serialize(),
      filters: { type },
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/publications/form', { publication: null })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['title', 'type', 'number', 'publication_date', 'description'])

    let fileUrl: string | null = null
    const file = request.file('file', { size: '20mb', extnames: ['pdf'] })
    if (file) {
      const uploadDir = join(app.publicPath(), 'uploads', 'publicacoes')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const fileName = `pub-${cuid()}.${file.extname}`
      await file.move(uploadDir, { name: fileName })
      fileUrl = `/uploads/publicacoes/${fileName}`
    }

    await OfficialPublication.create({
      title: data.title,
      type: data.type,
      number: data.number || null,
      publicationDate: data.publication_date,
      description: data.description || null,
      fileUrl,
    })

    session.flash('success', 'Publicação cadastrada com sucesso!')
    return response.redirect().toPath('/painel/publicacoes')
  }

  async edit({ params, inertia }: HttpContext) {
    const publication = await OfficialPublication.findOrFail(params.id)
    return inertia.render('admin/publications/form', { publication: publication.serialize() })
  }

  async update({ params, request, response, session }: HttpContext) {
    const publication = await OfficialPublication.findOrFail(params.id)
    const data = request.only(['title', 'type', 'number', 'publication_date', 'description'])

    const file = request.file('file', { size: '20mb', extnames: ['pdf'] })
    if (file) {
      const uploadDir = join(app.publicPath(), 'uploads', 'publicacoes')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const fileName = `pub-${cuid()}.${file.extname}`
      await file.move(uploadDir, { name: fileName })
      publication.fileUrl = `/uploads/publicacoes/${fileName}`
    }

    publication.merge({
      title: data.title,
      type: data.type,
      number: data.number || null,
      publicationDate: data.publication_date,
      description: data.description || null,
    })
    await publication.save()

    session.flash('success', 'Publicação atualizada com sucesso!')
    return response.redirect().toPath('/painel/publicacoes')
  }

  async destroy({ params, response, session }: HttpContext) {
    const publication = await OfficialPublication.findOrFail(params.id)
    await publication.delete()
    session.flash('success', 'Publicação excluída com sucesso!')
    return response.redirect().toPath('/painel/publicacoes')
  }
}
