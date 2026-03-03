import type { HttpContext } from '@adonisjs/core/http'
import Seal from '#models/seal'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync, unlinkSync } from 'node:fs'

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
    const image = request.file('image', { size: '2mb', extnames: ['png', 'jpg', 'jpeg', 'webp', 'svg'] })
    let imageUrl: string | null = null
    
    console.log('STORE - data received:', data)
    
    if (image) {
      const uploadDir = join(app.publicPath(), 'uploads', 'seals')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const fileName = 'seal-' + cuid() + '.' + image.extname
      await image.move(uploadDir, { name: fileName })
      if (image.state === 'moved') imageUrl = '/uploads/seals/' + fileName
      console.log('STORE - image saved:', imageUrl)
    }

    const isActive = data.is_active === 'true' || data.is_active === true || data.is_active === '1'
    console.log('STORE - isActive:', isActive, 'raw:', data.is_active)

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
    const image = request.file('image', { size: '2mb', extnames: ['png', 'jpg', 'jpeg', 'webp', 'svg'] })
    
    console.log('UPDATE - seal id:', params.id)
    console.log('UPDATE - data received:', data)
    console.log('UPDATE - current imageUrl:', seal.imageUrl)
    console.log('UPDATE - new image:', image ? 'yes' : 'no')
    
    // Só atualiza imagem se uma nova foi enviada
    if (image && image.size > 0) {
      // Deleta imagem antiga
      if (seal.imageUrl) {
        const oldPath = join(app.publicPath(), seal.imageUrl)
        if (existsSync(oldPath)) {
          try { unlinkSync(oldPath) } catch (e) { console.log('Error deleting old image:', e) }
        }
      }
      const uploadDir = join(app.publicPath(), 'uploads', 'seals')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const fileName = 'seal-' + cuid() + '.' + image.extname
      await image.move(uploadDir, { name: fileName })
      if (image.state === 'moved') {
        seal.imageUrl = '/uploads/seals/' + fileName
        console.log('UPDATE - new image saved:', seal.imageUrl)
      }
    }

    seal.title = data.title
    seal.description = data.description || null
    seal.linkUrl = data.link_url || null
    seal.sortOrder = Number(data.sort_order) || 0
    
    // Processa is_active de várias formas possíveis
    const isActive = data.is_active === 'true' || data.is_active === true || data.is_active === '1'
    seal.isActive = isActive
    
    console.log('UPDATE - isActive:', isActive, 'raw:', data.is_active, typeof data.is_active)
    
    await seal.save()
    
    console.log('UPDATE - saved seal:', seal.toJSON())

    session.flash('success', 'Selo atualizado!')
    return response.redirect('/painel/selos')
  }

  async destroy({ params, response, session }: HttpContext) {
    const seal = await Seal.findOrFail(params.id)
    if (seal.imageUrl) {
      const imagePath = join(app.publicPath(), seal.imageUrl)
      if (existsSync(imagePath)) try { unlinkSync(imagePath) } catch {}
    }
    await seal.delete()
    session.flash('success', 'Selo excluído!')
    return response.redirect('/painel/selos')
  }
}
