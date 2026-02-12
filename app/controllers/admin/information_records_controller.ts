import type { HttpContext } from '@adonisjs/core/http'
import InformationRecord from '#models/information_record'
import SystemCategory from '#models/system_category'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

export default class InformationRecordsController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const category = request.input('category', '')
    const year = request.input('year', '')

    let query = InformationRecord.query().orderBy('year', 'desc').orderBy('created_at', 'desc')
    if (category) query = query.where('category', category)
    if (year) query = query.where('year', year)

    const records = await query.paginate(page, 20)
    return inertia.render('admin/information-records/index', {
      records: records.serialize(),
      filters: { category, year },
    })
  }

  async create({ inertia }: HttpContext) {
    const categories = await SystemCategory.byType('information_record')
    return inertia.render('admin/information-records/form', { record: null, categories: categories.map((c) => c.serialize()) })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['title', 'category', 'year', 'content', 'reference_date'])

    let fileUrl: string | null = null
    const file = request.file('file', { size: '20mb', extnames: ['pdf'] })
    if (file) {
      const uploadDir = join(app.publicPath(), 'uploads', 'acesso-informacao')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const fileName = `info-${cuid()}.${file.extname}`
      await file.move(uploadDir, { name: fileName })
      fileUrl = `/uploads/acesso-informacao/${fileName}`
    }

    await InformationRecord.create({
      title: data.title,
      category: data.category,
      year: parseInt(data.year),
      content: data.content || null,
      referenceDate: data.reference_date || null,
      fileUrl,
      isActive: true,
    })

    session.flash('success', 'Registro cadastrado com sucesso!')
    return response.redirect().toPath('/painel/acesso-informacao')
  }

  async edit({ params, inertia }: HttpContext) {
    const record = await InformationRecord.findOrFail(params.id)
    const categories = await SystemCategory.byType('information_record')
    return inertia.render('admin/information-records/form', { record: record.serialize(), categories: categories.map((c) => c.serialize()) })
  }

  async update({ params, request, response, session }: HttpContext) {
    const record = await InformationRecord.findOrFail(params.id)
    const data = request.only(['title', 'category', 'year', 'content', 'reference_date', 'is_active'])

    const file = request.file('file', { size: '20mb', extnames: ['pdf'] })
    if (file) {
      const uploadDir = join(app.publicPath(), 'uploads', 'acesso-informacao')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const fileName = `info-${cuid()}.${file.extname}`
      await file.move(uploadDir, { name: fileName })
      record.fileUrl = `/uploads/acesso-informacao/${fileName}`
    }

    record.merge({
      title: data.title,
      category: data.category,
      year: parseInt(data.year),
      content: data.content || null,
      referenceDate: data.reference_date || null,
      isActive: data.is_active === 'true' || data.is_active === true,
    })
    await record.save()

    session.flash('success', 'Registro atualizado com sucesso!')
    return response.redirect().toPath('/painel/acesso-informacao')
  }

  async destroy({ params, response, session }: HttpContext) {
    const record = await InformationRecord.findOrFail(params.id)
    await record.delete()
    session.flash('success', 'Registro excluído com sucesso!')
    return response.redirect().toPath('/painel/acesso-informacao')
  }
}
