import type { HttpContext } from '@adonisjs/core/http'
import Councilor from '#models/councilor'
import Legislature from '#models/legislature'
import CouncilorPosition from '#models/councilor_position'
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
      ? await CouncilorPosition.query()
          .whereIn('councilor_id', councilorIds)
          .preload('biennium')
      : []

    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/councilors/index', {
      councilors: councilors.map((c) => ({
        ...c.serialize(),
        position: positions.find((p) => p.councilorId === c.id)?.position || null,
      })),
      legislature: currentLegislature?.serialize() || null,
      siteSettings,
    })
  }

  async show({ params, inertia }: HttpContext) {
    const councilor = await Councilor.query()
      .where('slug', params.slug)
      .firstOrFail()

    const positions = await CouncilorPosition.query()
      .where('councilor_id', councilor.id)
      .preload('biennium')

    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/councilors/show', {
      councilor: {
        ...councilor.serialize(),
        positions: positions.map((p) => ({
          ...p.serialize(),
          biennium_name: p.biennium?.name || '',
        })),
      },
      siteSettings,
    })
  }
}
