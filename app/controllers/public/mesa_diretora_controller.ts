import type { HttpContext } from '@adonisjs/core/http'
import Biennium from '#models/biennium'
import CouncilorPosition from '#models/councilor_position'
import SiteSetting from '#models/site_setting'

export default class MesaDiretoraController {
  async index({ inertia }: HttpContext) {
    const currentBiennium = await Biennium.query()
      .where('is_current', true)
      .preload('legislature')
      .first()

    let positions: any[] = []
    if (currentBiennium) {
      const posRecords = await CouncilorPosition.query()
        .where('biennium_id', currentBiennium.id)
        .preload('councilor')
        .orderByRaw("CASE position WHEN 'Presidente' THEN 1 WHEN 'Vice-Presidente' THEN 2 WHEN '1º Secretário' THEN 3 WHEN '2º Secretário' THEN 4 ELSE 5 END")
      positions = posRecords.map((p) => ({
        ...p.serialize(),
        councilor_name: p.councilor?.name || '',
        councilor_parliamentary_name: p.councilor?.parliamentaryName || p.councilor?.name || '',
        councilor_party: p.councilor?.party || '',
        councilor_photo: p.councilor?.photoUrl || null,
        councilor_slug: p.councilor?.slug || '',
      }))
    }

    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/mesa-diretora/index', {
      biennium: currentBiennium?.serialize() || null,
      legislature_name: currentBiennium?.legislature?.name || '',
      positions,
      siteSettings,
    })
  }
}
