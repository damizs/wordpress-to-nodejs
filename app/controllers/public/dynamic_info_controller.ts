import type { HttpContext } from '@adonisjs/core/http'
import InformationRecord from '#models/information_record'
import SystemCategory from '#models/system_category'
import SiteSetting from '#models/site_setting'
import News from '#models/news'

export default class DynamicInfoController {
  async show({ params, inertia, request, response }: HttpContext) {
    const slug = params.slug
    const category = await SystemCategory.query()
      .where('type', 'information_record')
      .where('slug', slug)
      .where('is_active', true)
      .first()

    if (!category) {
      // Permalink antigo do WordPress: notícias viviam na raiz (/slug-da-noticia/).
      // Preserva os links indexados/avaliados com redirect 301 (CLAUDE.md §11.4).
      const news = await News.query().where('slug', slug).where('status', 'published').first()
      if (news) {
        return response.redirect().status(301).toPath(`/noticias/${news.slug}`)
      }
      // No WP os posts viviam na raiz: slug desconhecido aqui é quase sempre
      // notícia antiga não migrada. 301 para a listagem preserva o link.
      return response.redirect().status(301).toPath('/noticias')
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
