import type { HttpContext } from '@adonisjs/core/http'
import Committee from '#models/committee'
import SiteSetting from '#models/site_setting'

export default class CommitteesController {
  async index({ inertia }: HttpContext) {
    const committees = await Committee.query()
      .where('is_active', true)
      .preload('members', (q) => q.preload('councilor'))
      .preload('legislature')
      .orderBy('name')
    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/committees/index', {
      committees: committees.map((c) => ({
        ...c.serialize(),
        legislature_name: c.legislature?.name || '',
        members: c.members.map((m) => ({
          ...m.serialize(),
          councilor_name: m.councilor?.name || '',
          councilor_party: m.councilor?.party || '',
          councilor_photo: m.councilor?.photoUrl || null,
        })),
      })),
      siteSettings,
    })
  }
}
