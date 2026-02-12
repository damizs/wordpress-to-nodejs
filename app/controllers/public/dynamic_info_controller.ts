import type { HttpContext } from '@adonisjs/core/http'
import InformationRecord from '#models/information_record'
import SystemCategory from '#models/system_category'
import SiteSetting from '#models/site_setting'

export default class DynamicInfoController {
  async show({ params, inertia, request, response }: HttpContext) {
    const slug = params.slug
    const category = await SystemCategory.query()
      .where('type', 'information_record')
      .where('slug', slug)
      .where('is_active', true)
      .first()

    if (!category) {
      return response.status(404).send('Página não encontrada')
    }

    const page = request.input('page', 1)
    const year = request.input('ano', '')

    let query = InformationRecord.query()
      .where('category', slug)
      .where('is_active', true)
      .orderBy('year', 'desc')
      .orderBy('created_at', 'desc')
    if (year) query = query.where('year', year)

    const records = await query.paginate(page, 20)
    const allCategories = await SystemCategory.byType('information_record')
    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/information/dynamic', {
      records: records.serialize(),
      category: category.serialize(),
      allCategories: allCategories.map((c) => c.serialize()),
      filters: { year },
      siteSettings,
    })
  }
}
