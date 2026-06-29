import type { HttpContext } from '@adonisjs/core/http'
import InformationRecord from '#models/information_record'
import SystemCategory from '#models/system_category'
import SiteSetting from '#models/site_setting'
import News from '#models/news'
import { findPublishedPage, renderPublicPage } from '#controllers/public/pages_controller'

export default class DynamicInfoController {
  async show({ params, inertia, request, response }: HttpContext) {
    const slug = params.slug

    // Páginas criadas no painel (módulo "Páginas") têm precedência sobre as
    // categorias dinâmicas de registros de informação.
    const customPage = await findPublishedPage(slug)
    if (customPage) {
      return renderPublicPage(inertia, customPage)
    }

    const category = await SystemCategory.query()
      .where('type', 'information_record')
      .where('slug', slug)
      .where('is_active', true)
      .first()

    if (!category) {
      // Permalink antigo do WordPress: notícias viviam na raiz (/slug-da-noticia/).
      // Preserva os links indexados/avaliados com redirect 301 (CLAUDE.md §11.4).
      const news = await News.query()
        .where('slug', slug)
        .where('status', 'published')
        .whereNull('deleted_at')
        .first()
      if (news) {
        return response.redirect().status(301).toPath(`/noticias/${news.slug}`)
      }
      // Slug realmente inexistente: mostra a página 404 em vez de redirecionar
      // para /noticias (que escondia links quebrados e impedia uma tela de erro).
      // Links de notícias antigas continuam preservados pelo 301 acima.
      response.status(404)
      return inertia.render('errors/not_found')
    }

    const page = request.input('page', 1)
    const year = request.input('ano', '')
    const search = request.input('busca', '')

    let query = InformationRecord.query()
      .where('category', slug)
      .where('is_active', true)
      .whereNull('deleted_at')
      .orderBy('year', 'desc')
      .orderBy('created_at', 'desc')
    if (year) query = query.where('year', year)
    if (search) {
      query = query.where((builder) => {
        const term = `%${search}%`
        builder.whereILike('title', term).orWhereILike('content', term)
      })
    }

    const records = await query.paginate(page, 50)
    const allCategories = await SystemCategory.byType('information_record')
    const siteSettings = await SiteSetting.allAsObject()

    const latestRecord = await InformationRecord.query()
      .where('category', slug)
      .where('is_active', true)
      .whereNull('deleted_at')
      .where((builder) => {
        builder.whereNotNull('reference_date').orWhereNotNull('updated_at').orWhereNotNull('created_at')
      })
      .orderByRaw('COALESCE(reference_date, updated_at, created_at) DESC')
      .first()

    const yearRows = await InformationRecord.query()
      .where('category', slug)
      .where('is_active', true)
      .whereNull('deleted_at')
      .distinct('year')
      .orderBy('year', 'desc')

    return inertia.render('public/information/dynamic', {
      records: records.serialize(),
      category: category.serialize(),
      allCategories: allCategories.map((c) => c.serialize()),
      years: yearRows.map((r) => r.year).filter(Boolean),
      filters: { year, search },
      latestUpdate:
        latestRecord?.referenceDate ||
        latestRecord?.updatedAt?.toISO() ||
        latestRecord?.createdAt?.toISO() ||
        null,
      siteSettings,
    })
  }
}
