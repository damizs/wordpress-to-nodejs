import type { HttpContext } from '@adonisjs/core/http'
import Licitacao from '#models/licitacao'
import { generateSlug } from '#helpers/slug'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

export default class LicitacoesController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const status = request.input('status', '')
    const modality = request.input('modality', '')

    let query = Licitacao.query().orderBy('created_at', 'desc')
    if (status) query = query.where('status', status)
    if (modality) query = query.where('modality', modality)

    const licitacoes = await query.paginate(page, 20)
    return inertia.render('admin/licitacoes/index', {
      licitacoes: licitacoes.serialize(),
      filters: { status, modality },
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/licitacoes/form', { licitacao: null })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only([
      'title', 'number', 'modality', 'status', 'object', 'content',
      'estimated_value', 'opening_date', 'closing_date', 'year',
    ])

    let fileUrl: string | null = null
    const file = request.file('file', { size: '20mb', extnames: ['pdf'] })
    if (file) {
      const uploadDir = join(app.publicPath(), 'uploads', 'licitacoes')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const fileName = `lic-${cuid()}.${file.extname}`
      await file.move(uploadDir, { name: fileName })
      fileUrl = `/uploads/licitacoes/${fileName}`
    }

    const slug = request.input('slug') || generateSlug(`${data.title}${data.number ? '-' + data.number : ''}`)

    await Licitacao.create({
      title: data.title,
      slug,
      number: data.number || null,
      modality: data.modality || null,
      status: data.status || 'aberta',
      object: data.object || null,
      content: data.content || null,
      estimatedValue: data.estimated_value ? parseFloat(data.estimated_value) : null,
      openingDate: data.opening_date || null,
      closingDate: data.closing_date || null,
      year: data.year ? parseInt(data.year) : new Date().getFullYear(),
      fileUrl,
      isActive: true,
    })

    session.flash('success', 'Licitação cadastrada com sucesso!')
    return response.redirect().toPath('/painel/licitacoes')
  }

  async edit({ params, inertia }: HttpContext) {
    const licitacao = await Licitacao.findOrFail(params.id)
    return inertia.render('admin/licitacoes/form', { licitacao: licitacao.serialize() })
  }

  async update({ params, request, response, session }: HttpContext) {
    const licitacao = await Licitacao.findOrFail(params.id)
    const data = request.only([
      'title', 'number', 'modality', 'status', 'object', 'content',
      'estimated_value', 'opening_date', 'closing_date', 'year', 'is_active',
    ])

    const file = request.file('file', { size: '20mb', extnames: ['pdf'] })
    if (file) {
      const uploadDir = join(app.publicPath(), 'uploads', 'licitacoes')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const fileName = `lic-${cuid()}.${file.extname}`
      await file.move(uploadDir, { name: fileName })
      licitacao.fileUrl = `/uploads/licitacoes/${fileName}`
    }

    licitacao.merge({
      title: data.title,
      number: data.number || null,
      modality: data.modality || null,
      status: data.status || 'aberta',
      object: data.object || null,
      content: data.content || null,
      estimatedValue: data.estimated_value ? parseFloat(data.estimated_value) : null,
      openingDate: data.opening_date || null,
      closingDate: data.closing_date || null,
      year: data.year ? parseInt(data.year) : null,
      isActive: data.is_active === 'true' || data.is_active === true,
    })
    await licitacao.save()

    session.flash('success', 'Licitação atualizada!')
    return response.redirect().toPath('/painel/licitacoes')
  }

  async destroy({ params, response, session }: HttpContext) {
    const licitacao = await Licitacao.findOrFail(params.id)
    await licitacao.delete()
    session.flash('success', 'Licitação excluída!')
    return response.redirect().toPath('/painel/licitacoes')
  }
}
