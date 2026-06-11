import type { HttpContext } from '@adonisjs/core/http'
import NominalVoting from '#models/nominal_voting'
import SiteSetting from '#models/site_setting'

export default class NominalVotingsController {
  async index({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const year = request.input('ano', '')
    const search = request.input('busca', '')
    const result = request.input('resultado', '')

    let query = NominalVoting.query()
      .where('is_published', true)
      .preload('entries', (q) => q.orderBy('councilor_name', 'asc'))
      .preload('plenarySession')
      .preload('legislativeActivity')
      .orderBy('voting_date', 'desc')

    if (year) query = query.where('year', year)
    if (result) query = query.where('result', result)
    if (search) query = query.whereILike('title', `%${search}%`)

    const votings = await query.paginate(page, 10)
    const siteSettings = await SiteSetting.allAsObject()

    const yearRows = await NominalVoting.query()
      .where('is_published', true)
      .distinct('year')
      .orderBy('year', 'desc')

    return inertia.render('public/votacoes/index', {
      votacoes: votings.all().map((v) => {
        const tally = { sim: 0, nao: 0, abstencao: 0, ausente: 0, nao_votou: 0 }
        for (const e of v.entries) tally[e.vote] = (tally[e.vote] ?? 0) + 1
        return {
          id: v.id,
          title: v.title,
          description: v.description,
          date: v.votingDate,
          result: v.result,
          is_unanimous: v.isUnanimous,
          session: v.plenarySession
            ? { title: v.plenarySession.title, slug: v.plenarySession.slug }
            : null,
          activity: v.legislativeActivity
            ? { title: v.legislativeActivity.title, slug: v.legislativeActivity.slug }
            : null,
          tally,
          votes: v.entries.map((e) => ({
            name: e.councilorName,
            party: e.party,
            vote: e.vote,
          })),
        }
      }),
      pagination: {
        currentPage: votings.currentPage,
        lastPage: votings.lastPage,
        total: votings.total,
      },
      years: yearRows.map((r) => r.year).filter(Boolean),
      filters: { year, search, result },
      siteSettings,
    })
  }
}
