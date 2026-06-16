import type { HttpContext } from '@adonisjs/core/http'
import Seal from '#models/seal'
import app from '@adonisjs/core/services/app'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync, unlinkSync } from 'node:fs'
import { saveOptimizedImage } from '#helpers/image_upload'

export default class SealsController {
  async index({ inertia }: HttpContext) {
    const seals = await Seal.query().orderBy('sort_order', 'asc')
    return inertia.render('admin/seals/index', { seals })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/seals/form', { seal: null })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['title', 'description', 'link_url', 'sort_order', 'is_active'])
    const image = request.file('image', {
      size: '2mb',
      extnames: ['png', 'jpg', 'jpeg', 'webp'],
    })
    let imageUrl: string | null = null

    if (image) {
      const uploadDir = join(app.publicPath(), 'uploads', 'seals')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const saved = await saveOptimizedImage(image, uploadDir, {
        prefix: 'seal',
        publicUrlBase: '/uploads/seals',
        maxWidth: 1200,
        maxHeight: 1200,
      })
      imageUrl = saved.url
    }

    const isActive = data.is_active === 'true' || data.is_active === true || data.is_active === '1'

    await Seal.create({
      title: data.title,
      description: data.description || null,
      imageUrl,
      linkUrl: data.link_url || null,
      sortOrder: Number(data.sort_order) || 0,
      isActive,
    })

    session.flash('success', 'Selo criado com sucesso!')
    return response.redirect('/painel/selos')
  }

  async edit({ params, inertia }: HttpContext) {
    const seal = await Seal.findOrFail(params.id)
    return inertia.render('admin/seals/form', { seal })
  }

  async update({ params, request, response, session }: HttpContext) {
    const seal = await Seal.findOrFail(params.id)
    const data = request.only(['title', 'description', 'link_url', 'sort_order', 'is_active'])
    const image = request.file('image', {
      size: '2mb',
      extnames: ['png', 'jpg', 'jpeg', 'webp'],
    })

    // Só atualiza imagem se uma nova foi enviada
    if (image && image.size > 0) {
      // Deleta imagem antiga
      if (seal.imageUrl) {
        const oldPath = join(app.publicPath(), seal.imageUrl)
        if (existsSync(oldPath)) {
          try {
            unlinkSync(oldPath)
          } catch (e) {
            console.log('Error deleting old image:', e)
          }
        }
      }
      const uploadDir = join(app.publicPath(), 'uploads', 'seals')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const saved = await saveOptimizedImage(image, uploadDir, {
        prefix: 'seal',
        publicUrlBase: '/uploads/seals',
        maxWidth: 1200,
        maxHeight: 1200,
      })
      seal.imageUrl = saved.url
    }

    seal.title = data.title
    seal.description = data.description || null
    seal.linkUrl = data.link_url || null
    seal.sortOrder = Number(data.sort_order) || 0

    // Processa is_active de várias formas possíveis
    const isActive = data.is_active === 'true' || data.is_active === true || data.is_active === '1'
    seal.isActive = isActive

    await seal.save()

    session.flash('success', 'Selo atualizado!')
    return response.redirect('/painel/selos')
  }

  async destroy({ params, response, session }: HttpContext) {
    const seal = await Seal.findOrFail(params.id)
    if (seal.imageUrl) {
      const imagePath = join(app.publicPath(), seal.imageUrl)
      if (existsSync(imagePath))
        try {
          unlinkSync(imagePath)
        } catch {}
    }
    await seal.delete()
    session.flash('success', 'Selo excluído!')
    return response.redirect('/painel/selos')
  }
}
