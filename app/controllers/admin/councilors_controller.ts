import type { HttpContext } from '@adonisjs/core/http'
import Councilor from '#models/councilor'
import Legislature from '#models/legislature'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

export default class CouncilorsController {
  async index({ inertia }: HttpContext) {
    const councilors = await Councilor.query()
      .preload('legislature')
      .orderBy('display_order', 'asc')
    return inertia.render('admin/councilors/index', {
      councilors: councilors.map((c) => c.serialize()),
    })
  }

  async create({ inertia }: HttpContext) {
    const legislatures = await Legislature.query().orderBy('number', 'desc')
    return inertia.render('admin/councilors/form', {
      councilor: null,
      legislatures: legislatures.map((l) => l.serialize()),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only([
      'name', 'slug', 'party', 'email', 'phone', 'bio', 'role',
      'is_active', 'legislature_id', 'display_order',
    ])

    data.is_active = data.is_active === 'true' || data.is_active === true
    data.display_order = parseInt(data.display_order) || 0

    // Generate slug if not provided
    if (!data.slug) {
      data.slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    let photoUrl: string | null = null
    // Handle photo upload
    const photo = request.file('photo', { size: '2mb', extnames: ['png', 'jpg', 'jpeg', 'webp'] })
    if (photo) {
      const uploadDir = join(app.publicPath(), 'uploads', 'vereadores')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const fileName = `vereador-${cuid()}.${photo.extname}`
      await photo.move(uploadDir, { name: fileName })
      photoUrl = `/uploads/vereadores/${fileName}`
    }

    await Councilor.create({
      name: data.name,
      slug: data.slug,
      party: data.party,
      email: data.email,
      phone: data.phone,
      bio: data.bio,
      role: data.role,
      isActive: data.is_active,
      legislatureId: data.legislature_id ? parseInt(data.legislature_id) : null,
      displayOrder: data.display_order,
      photoUrl,
    })

    session.flash('success', 'Vereador cadastrado com sucesso!')
    return response.redirect().toPath('/painel/vereadores')
  }

  async edit({ params, inertia }: HttpContext) {
    const councilor = await Councilor.findOrFail(params.id)
    const legislatures = await Legislature.query().orderBy('number', 'desc')
    return inertia.render('admin/councilors/form', {
      councilor: councilor.serialize(),
      legislatures: legislatures.map((l) => l.serialize()),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const councilor = await Councilor.findOrFail(params.id)
    const data = request.only([
      'name', 'slug', 'party', 'email', 'phone', 'bio', 'role',
      'is_active', 'legislature_id', 'display_order',
    ])

    const photo = request.file('photo', { size: '2mb', extnames: ['png', 'jpg', 'jpeg', 'webp'] })
    if (photo) {
      const uploadDir = join(app.publicPath(), 'uploads', 'vereadores')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const fileName = `vereador-${cuid()}.${photo.extname}`
      await photo.move(uploadDir, { name: fileName })
      councilor.photoUrl = `/uploads/vereadores/${fileName}`
    }

    // Generate slug if not provided
    if (!data.slug) {
      data.slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    councilor.name = data.name
    councilor.slug = data.slug
    councilor.party = data.party
    councilor.email = data.email
    councilor.phone = data.phone
    councilor.bio = data.bio
    councilor.role = data.role
    councilor.isActive = data.is_active === 'true' || data.is_active === true
    councilor.legislatureId = data.legislature_id ? parseInt(data.legislature_id) : null
    councilor.displayOrder = parseInt(data.display_order) || 0

    await councilor.save()

    session.flash('success', 'Vereador atualizado com sucesso!')
    return response.redirect().toPath('/painel/vereadores')
  }

  async destroy({ params, response, session }: HttpContext) {
    const councilor = await Councilor.findOrFail(params.id)
    await councilor.delete()
    session.flash('success', 'Vereador excluído com sucesso!')
    return response.redirect().toPath('/painel/vereadores')
  }
}
