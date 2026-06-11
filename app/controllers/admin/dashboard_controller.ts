import type { HttpContext } from '@adonisjs/core/http'
import News from '#models/news'
import Councilor from '#models/councilor'
import PlenarySession from '#models/plenary_session'
import Licitacao from '#models/licitacao'
import InformationRecord from '#models/information_record'
import OfficialPublication from '#models/official_publication'
import SurveyResponse from '#models/survey_response'

async function count(query: any): Promise<number> {
  const row = await query.count('* as total').first()
  return Number(row?.$extras.total ?? 0)
}

export default class DashboardController {
  async index({ inertia, auth }: HttpContext) {
    const user = auth.user!
    const permissions = await user.getPermissionNames()
    const can = (p: string) => permissions.includes(p)

    // Cada bloco só é calculado (e enviado) se o usuário tem acesso ao módulo
    const stats: Record<string, number> = {}
    let recentNews: any[] = []
    let upcomingSessions: any[] = []

    if (can('noticia.criar') || can('noticia.editar') || can('noticia.publicar')) {
      const [published, drafts] = await Promise.all([
        count(News.query().where('status', 'published')),
        count(News.query().where('status', 'draft')),
      ])
      stats.publishedNews = published
      stats.draftNews = drafts
      recentNews = (
        await News.query().orderBy('created_at', 'desc').limit(5).preload('category')
      ).map((n) => n.serialize())
    }

    if (can('legislativo.gerenciar')) {
      stats.councilors = await count(Councilor.query().where('is_active', true))
    }

    if (can('sessao.gerenciar')) {
      stats.scheduledSessions = await count(PlenarySession.query().where('status', 'agendada'))
      upcomingSessions = (
        await PlenarySession.query()
          .where('status', 'agendada')
          .orderBy('session_date', 'asc')
          .limit(5)
      ).map((s) => ({ id: s.id, title: s.title, date: s.sessionDate }))
    }

    if (can('licitacao.gerenciar')) {
      stats.openLicitacoes = await count(
        Licitacao.query().where('is_active', true).whereIn('status', ['aberta', 'em_andamento'])
      )
    }

    if (can('pntp.gerenciar')) {
      stats.pntpRecords = await count(InformationRecord.query().where('is_active', true))
    }

    if (can('publicacao.gerenciar')) {
      stats.publications = await count(OfficialPublication.query())
    }

    if (can('pesquisa.gerenciar')) {
      stats.surveyResponses = await count(SurveyResponse.query())
    }

    return inertia.render('admin/dashboard', {
      stats,
      recentNews,
      upcomingSessions,
      userName: user.fullName,
    })
  }
}
