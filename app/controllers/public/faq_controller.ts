import type { HttpContext } from '@adonisjs/core/http'
import FaqItem from '#models/faq_item'
import SystemCategory from '#models/system_category'
import SiteSetting from '#models/site_setting'

export default class FaqController {
  async index({ inertia }: HttpContext) {
    const items = await FaqItem.query()
      .where('is_active', true)
      .orderBy('category')
      .orderBy('display_order')
    const categories = await SystemCategory.byType('faq')
    const siteSettings = await SiteSetting.allAsObject()

    return inertia.render('public/faq/index', {
      items: items.map((i) => i.serialize()),
      categories: categories.map((c) => c.serialize()),
      siteSettings,
    })
  }
}
