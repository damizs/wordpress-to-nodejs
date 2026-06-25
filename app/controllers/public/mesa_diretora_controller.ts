import type { HttpContext } from '@adonisjs/core/http'
import Biennium from '#models/biennium'
import CouncilorPosition from '#models/councilor_position'
import SiteSetting from '#models/site_setting'

// A coluna date do Postgres chega como Date no runtime; String(Date) vira
// "Wed Jan 01 2025..." e substring(0,4) virava "Wed ". Extrai o ano robustamente.
function yearOf(value: unknown): string {
  if (!value) return ''
  const d = new Date(value as string)
  return Number.isNaN(d.getTime()) ? String(value).substring(0, 4) : String(d.getFullYear())
}

export default class MesaDiretoraController {
  async index({ inertia }: HttpContext) {
    const currentBiennium = await Biennium.query()
      .where('is_current', true)
      .preload('legislature')
      .first()

    let members: any[] = []
    if (currentBiennium) {
      const posRecords = await CouncilorPosition.query()
        .where('biennium_id', currentBiennium.id)
        .preload('councilor')
        .orderByRaw(
          "CASE position WHEN 'Presidente' THEN 1 WHEN 'Vice-Presidente' THEN 2 WHEN '1º Secretário' THEN 3 WHEN '2º Secretário' THEN 4 ELSE 5 END"
        )
      members = posRecords.map((p) => ({
        id: p.id,
        name: p.councilor?.parliamentaryName || p.councilor?.name || '',
        slug: p.councilor?.slug || '',
        photo: p.councilor?.photoUrl || null,
        party: p.councilor?.party || '',
        role: p.position,
      }))
    }

    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/mesa-diretora/index', {
      members,
      biennium: currentBiennium
        ? {
            name: currentBiennium.name,
            year_start: yearOf(currentBiennium.startDate),
            year_end: yearOf(currentBiennium.endDate),
          }
        : null,
      legislature_name: currentBiennium?.legislature?.name || '',
      siteSettings,
    })
  }
}
