import type { HttpContext } from '@adonisjs/core/http'
import InformationRecord from '#models/information_record'
import SystemCategory from '#models/system_category'
import SiteSetting from '#models/site_setting'

export default class InformationController {
  async index({ inertia }: HttpContext) {
    const categories = await SystemCategory.byType('information_record')
    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/information/index', {
      categories: categories.map((c) => c.serialize()),
      siteSettings,
    })
  }

  async byCategory({ params, inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const year = request.input('ano', '')
    const category = params.category

    let query = InformationRecord.query()
      .where('category', category)
      .where('is_active', true)
      .orderBy('year', 'desc')
      .orderBy('created_at', 'desc')
    if (year) query = query.where('year', year)

    const records = await query.paginate(page, 20)
    const categories = await SystemCategory.byType('information_record')
    const categoryInfo = categories.find((c) => c.slug === category)
    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/information/category', {
      records: records.serialize(),
      category: category,
      categoryName: categoryInfo?.name || category,
      categories: categories.map((c) => c.serialize()),
      filters: { year },
      siteSettings,
    })
  }
}
