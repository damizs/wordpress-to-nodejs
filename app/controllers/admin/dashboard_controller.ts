import type { HttpContext } from '@adonisjs/core/http'
import News from '#models/news'
import Councilor from '#models/councilor'
import PlenarySession from '#models/plenary_session'
import Licitacao from '#models/licitacao'
import InformationRecord from '#models/information_record'
import OfficialPublication from '#models/official_publication'
import SurveyResponse from '#models/survey_response'
import FreshnessAlertService, {
  computeFreshnessItem,
  type FreshnessItem,
  type FreshnessStatus,
} from '#services/freshness_alert_service'

async function count(query: any): Promise<number> {
  const row = await query.count('* as total').first()
  return Number(row?.$extras.total ?? 0)
}

export default class DashboardController {
  async index({ inertia, auth }: HttpContext) {
    const user = auth.user!
    const permissions = await user.getPermissionNames()
    const can = (p: string) => permissions.includes('*') || permissions.includes(p)

    // Cada bloco só é calculado (e enviado) se o usuário tem acesso ao módulo
    const stats: Record<string, number> = {}
    let recentNews: any[] = []
    let upcomingSessions: any[] = []
    const contentHealth: FreshnessItem[] = []

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
      contentHealth.push(
        await computeFreshnessItem({
          key: 'noticias',
          label: 'Notícias',
          href: '/painel/noticias',
          table: 'news',
          dateColumn: 'published_at',
          thresholdDays: 30,
          apply: (q) => q.where('status', 'published'),
        })
      )
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
      contentHealth.push(
        await computeFreshnessItem({
          key: 'atas',
          label: 'Atas',
          href: '/painel/atas',
          table: 'atas',
          dateColumn: 'document_date',
          thresholdDays: 15,
          apply: (q) => q.where('is_published', true),
        }),
        await computeFreshnessItem({
          key: 'pautas',
          label: 'Pautas',
          href: '/painel/pautas',
          table: 'pautas',
          dateColumn: 'document_date',
          thresholdDays: 15,
          apply: (q) => q.where('is_published', true),
        })
      )
    }

    if (can('licitacao.gerenciar')) {
      stats.openLicitacoes = await count(
        Licitacao.query().where('is_active', true).whereIn('status', ['aberta', 'em_andamento'])
      )
      contentHealth.push(
        await computeFreshnessItem({
          key: 'licitacoes',
          label: 'Licitações',
          href: '/painel/licitacoes',
          table: 'licitacoes',
          dateColumn: 'updated_at',
          thresholdDays: 90,
          apply: (q) => q.where('is_active', true),
        })
      )
    }

    if (can('pntp.gerenciar')) {
      stats.pntpRecords = await count(InformationRecord.query().where('is_active', true))
      // Pendências do Radar ATRICON: total de critérios menos os avaliados como ok
      const { ATRICON_CRITERIA } = await import('#helpers/atricon_matrix')
      const AtriconStatus = (await import('#models/atricon_status')).default
      const saved = await AtriconStatus.all()
      const okCodes = new Set(
        saved
          .filter((s) => ['atendido', 'externo', 'nao_se_aplica'].includes(s.status))
          .map((s) => s.criterionCode)
      )
      stats.atriconPending = ATRICON_CRITERIA.filter(
        (c) => !okCodes.has(c.code) && !c.external
      ).length
      contentHealth.push(
        await computeFreshnessItem({
          key: 'acesso-informacao',
          label: 'Acesso à Informação',
          href: '/painel/acesso-informacao',
          table: 'information_records',
          dateColumn: 'updated_at',
          thresholdDays: 90,
          apply: (q) => q.where('is_active', true),
        })
      )
    }

    if (can('publicacao.gerenciar')) {
      stats.publications = await count(OfficialPublication.query())
      contentHealth.push(
        await computeFreshnessItem({
          key: 'publicacoes',
          label: 'Publicações oficiais',
          href: '/painel/publicacoes',
          table: 'official_publications',
          dateColumn: 'publication_date',
          thresholdDays: 90,
        })
      )
    }

    if (can('votacao.gerenciar')) {
      contentHealth.push(
        await computeFreshnessItem({
          key: 'votacoes',
          label: 'Votações nominais',
          href: '/painel/votacoes',
          table: 'nominal_votings',
          dateColumn: 'voting_date',
          thresholdDays: 15,
          apply: (q) => q.where('is_published', true),
        })
      )
    }

    if (can('pesquisa.gerenciar')) {
      stats.surveyResponses = await count(SurveyResponse.query())
    }

    contentHealth.sort((a, b) => {
      const weight: Record<FreshnessStatus, number> = { vazio: 0, desatualizado: 1, em_dia: 2 }
      if (weight[a.status] !== weight[b.status]) return weight[a.status] - weight[b.status]
      return (b.daysSince ?? -1) - (a.daysSince ?? -1)
    })

    // Status do alerta diário de frescor (proativo). Só flags — sem expor números.
    const freshnessAlertSettings = await FreshnessAlertService.publicSettings()
    const freshnessAlert = {
      enabled: freshnessAlertSettings.enabled,
      configured: freshnessAlertSettings.hasRecipients,
      usingEvolutionFallback: freshnessAlertSettings.usingEvolutionFallback,
      lastRun: freshnessAlertSettings.lastRun,
    }

    return inertia.render('admin/dashboard', {
      stats,
      recentNews,
      upcomingSessions,
      contentHealth,
      freshnessAlert,
      userName: user.fullName,
    })
  }
}
