import type { HttpContext } from '@adonisjs/core/http'
import Councilor from '#models/councilor'
import Legislature from '#models/legislature'
import CouncilorPosition from '#models/councilor_position'
import LegislativeActivity from '#models/legislative_activity'
import SiteSetting from '#models/site_setting'

export default class CouncilorsController {
  async index({ inertia }: HttpContext) {
    const currentLegislature = await Legislature.query().where('is_current', true).first()
    const councilors = await Councilor.query()
      .where('is_active', true)
      .if(currentLegislature, (q) => q.where('legislature_id', currentLegislature!.id))
      .orderBy('display_order', 'asc')

    // Load positions for mesa diretora
    const councilorIds = councilors.map((c) => c.id)
    const positions = councilorIds.length
      ? await CouncilorPosition.query().whereIn('councilor_id', councilorIds).preload('biennium')
      : []

    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/councilors/index', {
      vereadores: councilors.map((c) => ({
        id: c.id,
        name: c.parliamentaryName || c.name,
        slug: c.slug,
        party: c.party,
        photo: c.photoUrl,
        role: positions.find((p) => p.councilorId === c.id)?.position || c.role || null,
        email: c.email,
        phone: c.phone,
      })),
      legislature: currentLegislature
        ? {
            name: currentLegislature.name,
            year_start: currentLegislature.startDate?.substring(0, 4) || '',
            year_end: currentLegislature.endDate?.substring(0, 4) || '',
          }
        : null,
      siteSettings,
    })
  }

  async show({ params, inertia }: HttpContext) {
    const councilor = await Councilor.query().where('slug', params.slug).firstOrFail()

    const positions = await CouncilorPosition.query()
      .where('councilor_id', councilor.id)
      .preload('biennium')

    const activities = await LegislativeActivity.query()
      .if(councilor.name, (q) =>
        q.where((sub) => {
          sub.whereILike('author', `%${councilor.name}%`)
          if (councilor.parliamentaryName) {
            sub.orWhereILike('author', `%${councilor.parliamentaryName}%`)
          }
        })
      )
      .orderBy('year', 'desc')
      .orderBy('created_at', 'desc')
      .limit(10)

    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/councilors/show', {
      vereador: {
        id: councilor.id,
        name: councilor.parliamentaryName || councilor.name,
        slug: councilor.slug,
        party: councilor.party,
        photo: councilor.photoUrl,
        role: positions.find((p) => p.biennium?.isCurrent)?.position || councilor.role || null,
        email: councilor.email,
        phone: councilor.phone,
        biography: councilor.bio || councilor.history || null,
      },
      activities: activities.map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title || `${a.type} nº ${a.number}/${a.year}`,
        date: a.sessionDate || a.createdAt?.toISODate() || null,
        type: a.type,
      })),
      siteSettings,
    })
  }
}
