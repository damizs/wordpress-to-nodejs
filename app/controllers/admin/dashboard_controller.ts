import type { HttpContext } from '@adonisjs/core/http'
import News from '#models/news'
import Councilor from '#models/councilor'

export default class DashboardController {
  async index({ inertia }: HttpContext) {
    const [totalNews, publishedNews, draftNews, totalCouncilors] = await Promise.all([
      News.query().count('* as total').first(),
      News.query().where('status', 'published').count('* as total').first(),
      News.query().where('status', 'draft').count('* as total').first(),
      Councilor.query().where('is_active', true).count('* as total').first(),
    ])

    const recentNews = await News.query()
      .orderBy('created_at', 'desc')
      .limit(5)
      .preload('category')

    return inertia.render('admin/dashboard', {
      stats: {
        totalNews: Number(totalNews?.$extras.total ?? 0),
        publishedNews: Number(publishedNews?.$extras.total ?? 0),
        draftNews: Number(draftNews?.$extras.total ?? 0),
        totalCouncilors: Number(totalCouncilors?.$extras.total ?? 0),
      },
      recentNews: recentNews.map((n) => n.serialize()),
    })
  }
}
