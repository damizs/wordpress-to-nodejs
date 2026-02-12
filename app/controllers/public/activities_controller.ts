import type { HttpContext } from '@adonisjs/core/http'
import LegislativeActivity from '#models/legislative_activity'
import SiteSetting from '#models/site_setting'

export default class ActivitiesController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const type = request.input('tipo', '')
    const year = request.input('ano', '')

    let query = LegislativeActivity.query().orderBy('year', 'desc').orderBy('created_at', 'desc')
    if (type) query = query.where('type', type)
    if (year) query = query.where('year', year)

    const activities = await query.paginate(page, 20)
    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/activities/index', { activities: activities.serialize(), filters: { type, year }, siteSettings })
  }

  async show({ params, inertia }: HttpContext) {
    const activity = await LegislativeActivity.query()
      .where('slug', params.slug)
      .firstOrFail()
    const siteSettings = await SiteSetting.allAsObject()
    return inertia.render('public/activities/show', { activity: activity.serialize(), siteSettings })
  }
}
