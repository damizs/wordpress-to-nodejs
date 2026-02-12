import type { HttpContext } from '@adonisjs/core/http'
import Councilor from '#models/councilor'
import Legislature from '#models/legislature'
import Biennium from '#models/biennium'
import CouncilorPosition from '#models/councilor_position'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

export default class CouncilorsController {
  async index({ inertia }: HttpContext) {
    const councilors = await Councilor.query()
      .preload('legislature')
      .preload('positions', (q) => q.preload('biennium'))
      .orderBy('display_order', 'asc')
    return inertia.render('admin/councilors/index', {
      councilors: councilors.map((c) => ({
        ...c.serialize(),
        positions: c.positions.map((p) => ({
          ...p.serialize(),
          biennium: p.biennium?.serialize(),
        })),
      })),
    })
  }

  async create({ inertia }: HttpContext) {
    const legislatures = await Legislature.query().orderBy('number', 'desc')
    const biennia = await Biennium.query().preload('legislature').orderBy('start_date', 'desc')
    return inertia.render('admin/councilors/form', {
      councilor: null,
      legislatures: legislatures.map((l) => l.serialize()),
      biennia: biennia.map((b) => ({ ...b.serialize(), legislature: b.legislature?.serialize() })),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only([
      'name', 'full_name', 'parliamentary_name', 'slug', 'party',
      'gender', 'marital_status', 'education_level',
      'email', 'phone', 'bio', 'history', 'role',
      'is_active', 'legislature_id', 'display_order',
    ])

    data.is_active = data.is_active === 'true' || data.is_active === true
    data.display_order = parseInt(data.display_order) || 0

    if (!data.slug) {
      data.slug = data.name
        .toLowerCase().normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    let photoUrl: string | null = null
    const photo = request.file('photo', { size: '2mb', extnames: ['png', 'jpg', 'jpeg', 'webp'] })
    if (photo) {
      const uploadDir = join(app.publicPath(), 'uploads', 'vereadores')
      if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })
      const fileName = `vereador-${cuid()}.${photo.extname}`
      await photo.move(uploadDir, { name: fileName })
      photoUrl = `/uploads/vereadores/${fileName}`
    }

    const councilor = await Councilor.create({
      name: data.name,
      fullName: data.full_name || null,
      parliamentaryName: data.parliamentary_name || null,
      slug: data.slug,
      party: data.party,
      gender: data.gender || null,
      maritalStatus: data.marital_status || null,
      educationLevel: data.education_level || null,
      email: data.email,
      phone: data.phone,
      bio: data.bio,
      history: data.history || null,
      role: data.role,
      isActive: data.is_active,
      legislatureId: data.legislature_id ? parseInt(data.legislature_id) : null,
      displayOrder: data.display_order,
      photoUrl,
    })

    // Handle mesa diretora position
    const bienniumId = request.input('biennium_id')
    const position = request.input('position')
    if (bienniumId && position) {
      await CouncilorPosition.create({
        councilorId: councilor.id,
        bienniumId: parseInt(bienniumId),
        position,
      })
    }

    session.flash('success', 'Vereador cadastrado com sucesso!')
    return response.redirect().toPath('/painel/vereadores')
  }

  async edit({ params, inertia }: HttpContext) {
    const councilor = await Councilor.query()
      .where('id', params.id)
      .preload('positions', (q) => q.preload('biennium'))
      .firstOrFail()
    const legislatures = await Legislature.query().orderBy('number', 'desc')
    const biennia = await Biennium.query().preload('legislature').orderBy('start_date', 'desc')
    return inertia.render('admin/councilors/form', {
      councilor: {
        ...councilor.serialize(),
        positions: councilor.positions.map((p) => ({
          ...p.serialize(),
          biennium: p.biennium?.serialize(),
        })),
      },
      legislatures: legislatures.map((l) => l.serialize()),
      biennia: biennia.map((b) => ({ ...b.serialize(), legislature: b.legislature?.serialize() })),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const councilor = await Councilor.findOrFail(params.id)
    const data = request.only([
      'name', 'full_name', 'parliamentary_name', 'slug', 'party',
      'gender', 'marital_status', 'education_level',
      'email', 'phone', 'bio', 'history', 'role',
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

    if (!data.slug) {
      data.slug = data.name
        .toLowerCase().normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }

    councilor.merge({
      name: data.name,
      fullName: data.full_name || null,
      parliamentaryName: data.parliamentary_name || null,
      slug: data.slug,
      party: data.party,
      gender: data.gender || null,
      maritalStatus: data.marital_status || null,
      educationLevel: data.education_level || null,
      email: data.email,
      phone: data.phone,
      bio: data.bio,
      history: data.history || null,
      role: data.role,
      isActive: data.is_active === 'true' || data.is_active === true,
      legislatureId: data.legislature_id ? parseInt(data.legislature_id) : null,
      displayOrder: parseInt(data.display_order) || 0,
    })
    await councilor.save()

    // Handle mesa diretora position
    const bienniumId = request.input('biennium_id')
    const position = request.input('position')
    if (bienniumId && position) {
      // Remove old position for same biennium
      await CouncilorPosition.query()
        .where('councilor_id', councilor.id)
        .where('biennium_id', parseInt(bienniumId))
        .delete()
      await CouncilorPosition.create({
        councilorId: councilor.id,
        bienniumId: parseInt(bienniumId),
        position,
      })
    }

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
