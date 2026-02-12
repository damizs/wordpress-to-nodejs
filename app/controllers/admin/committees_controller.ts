import type { HttpContext } from '@adonisjs/core/http'
import Committee from '#models/committee'
import CommitteeMember from '#models/committee_member'
import Legislature from '#models/legislature'
import Councilor from '#models/councilor'

export default class CommitteesController {
  async index({ inertia }: HttpContext) {
    const committees = await Committee.query()
      .preload('legislature')
      .withCount('members')
      .orderBy('name', 'asc')
    return inertia.render('admin/committees/index', {
      committees: committees.map((c) => ({
        ...c.serialize(),
        legislature_name: c.legislature?.name || '',
        members_count: c.$extras.members_count,
      })),
    })
  }

  async create({ inertia }: HttpContext) {
    const legislatures = await Legislature.query().orderBy('number', 'desc')
    const councilors = await Councilor.query().where('is_active', true).orderBy('name')
    return inertia.render('admin/committees/form', {
      committee: null,
      members: [],
      legislatures: legislatures.map((l) => l.serialize()),
      councilors: councilors.map((c) => c.serialize()),
    })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['name', 'slug', 'description', 'type', 'legislature_id', 'is_active'])
    if (!data.slug) {
      data.slug = data.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }
    const committee = await Committee.create({
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      type: data.type || 'permanente',
      legislatureId: data.legislature_id ? parseInt(data.legislature_id) : null,
      isActive: data.is_active === 'true' || data.is_active === true || data.is_active === 'on',
    })

    // Handle members
    const membersJson = request.input('members_json', '[]')
    try {
      const members = JSON.parse(membersJson)
      for (const m of members) {
        await CommitteeMember.create({
          committeeId: committee.id,
          councilorId: parseInt(m.councilor_id),
          role: m.role || 'membro',
        })
      }
    } catch {}

    session.flash('success', 'Comissão cadastrada com sucesso!')
    return response.redirect().toPath('/painel/comissoes')
  }

  async edit({ params, inertia }: HttpContext) {
    const committee = await Committee.query()
      .where('id', params.id)
      .preload('members', (q) => q.preload('councilor'))
      .firstOrFail()
    const legislatures = await Legislature.query().orderBy('number', 'desc')
    const councilors = await Councilor.query().where('is_active', true).orderBy('name')
    return inertia.render('admin/committees/form', {
      committee: committee.serialize(),
      members: committee.members.map((m) => ({
        ...m.serialize(),
        councilor_name: m.councilor?.name || '',
      })),
      legislatures: legislatures.map((l) => l.serialize()),
      councilors: councilors.map((c) => c.serialize()),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const committee = await Committee.findOrFail(params.id)
    const data = request.only(['name', 'slug', 'description', 'type', 'legislature_id', 'is_active'])
    committee.merge({
      name: data.name,
      slug: data.slug || committee.slug,
      description: data.description || null,
      type: data.type || 'permanente',
      legislatureId: data.legislature_id ? parseInt(data.legislature_id) : null,
      isActive: data.is_active === 'true' || data.is_active === true || data.is_active === 'on',
    })
    await committee.save()

    // Replace members
    await CommitteeMember.query().where('committee_id', committee.id).delete()
    const membersJson = request.input('members_json', '[]')
    try {
      const members = JSON.parse(membersJson)
      for (const m of members) {
        await CommitteeMember.create({
          committeeId: committee.id,
          councilorId: parseInt(m.councilor_id),
          role: m.role || 'membro',
        })
      }
    } catch {}

    session.flash('success', 'Comissão atualizada!')
    return response.redirect().toPath('/painel/comissoes')
  }

  async destroy({ params, response, session }: HttpContext) {
    const committee = await Committee.findOrFail(params.id)
    await CommitteeMember.query().where('committee_id', committee.id).delete()
    await committee.delete()
    session.flash('success', 'Comissão excluída!')
    return response.redirect().toPath('/painel/comissoes')
  }
}
