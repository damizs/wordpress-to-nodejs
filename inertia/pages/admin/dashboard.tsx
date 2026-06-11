import { Head, Link, usePage } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  Newspaper, FileText, Users, ArrowUpRight, Clock, Gavel, ScrollText,
  ShoppingCart, FolderOpen, MessageSquare, Plus, CalendarDays, Radar,
} from 'lucide-react'

interface Props {
  stats: Record<string, number>
  recentNews: Array<{
    id: number
    title: string
    status: string
    created_at: string
    category?: { name: string } | null
  }>
  upcomingSessions: Array<{ id: number; title: string; date: string }>
  userName: string
}

const statusBadge: Record<string, { label: string; className: string }> = {
  published: { label: 'Publicada', className: 'bg-emerald-50 text-emerald-700' },
  draft: { label: 'Rascunho', className: 'bg-amber-50 text-amber-700' },
}

export default function Dashboard({ stats, recentNews, upcomingSessions, userName }: Props) {
  const { auth } = usePage().props as any
  const permissions: string[] = auth?.permissions || []
  const can = (p: string) => permissions.includes(p) || permissions.includes('*')

  // Cartões de estatística — só aparecem se o backend mandou o número
  const statCards = [
    { key: 'publishedNews', label: 'Notícias publicadas', icon: Newspaper, accent: 'text-emerald-600 bg-emerald-50', href: '/painel/noticias?status=published' },
    { key: 'draftNews', label: 'Rascunhos', icon: FileText, accent: 'text-amber-600 bg-amber-50', href: '/painel/noticias?status=draft' },
    { key: 'scheduledSessions', label: 'Sessões agendadas', icon: Gavel, accent: 'text-blue-600 bg-blue-50', href: '/painel/sessoes' },
    { key: 'councilors', label: 'Vereadores ativos', icon: Users, accent: 'text-violet-600 bg-violet-50', href: '/painel/vereadores' },
    { key: 'openLicitacoes', label: 'Licitações abertas', icon: ShoppingCart, accent: 'text-orange-600 bg-orange-50', href: '/painel/licitacoes' },
    { key: 'pntpRecords', label: 'Registros PNTP', icon: FolderOpen, accent: 'text-cyan-700 bg-cyan-50', href: '/painel/acesso-informacao' },
    { key: 'atriconPending', label: 'Pendências ATRICON', icon: Radar, accent: 'text-purple-700 bg-purple-50', href: '/painel/atricon' },
    { key: 'publications', label: 'Publicações oficiais', icon: ScrollText, accent: 'text-rose-600 bg-rose-50', href: '/painel/publicacoes' },
    { key: 'surveyResponses', label: 'Respostas da pesquisa', icon: MessageSquare, accent: 'text-teal-600 bg-teal-50', href: '/painel/pesquisa-satisfacao' },
  ].filter((c) => stats[c.key] !== undefined)

  // Ações rápidas conforme o que a pessoa pode fazer
  const quickActions = [
    { label: 'Nova Notícia', href: '/painel/noticias/criar', show: can('noticia.criar') },
    { label: 'Nova Sessão', href: '/painel/sessoes/criar', show: can('sessao.gerenciar') },
    { label: 'Nova Licitação', href: '/painel/licitacoes/criar', show: can('licitacao.gerenciar') },
    { label: 'Nova Publicação', href: '/painel/publicacoes/criar', show: can('publicacao.gerenciar') },
    { label: 'Novo Registro PNTP', href: '/painel/acesso-informacao/criar', show: can('pntp.gerenciar') },
  ].filter((a) => a.show)

  const firstName = (userName || '').split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <AdminLayout title="Dashboard">
      <Head title="Dashboard - Painel" />

      {/* Hero de boas-vindas */}
      <div className="bg-gradient-hero rounded-2xl px-6 py-7 lg:px-8 mb-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <p className="text-white/60 text-xs capitalize mb-1">{today}</p>
            <h2 className="text-2xl font-bold mb-1">
              {greeting}, {firstName}!
            </h2>
            <p className="text-sm text-white/70">Aqui está o resumo das suas áreas de trabalho.</p>
          </div>
          {quickActions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {quickActions.slice(0, 3).map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-gold hover:text-navy-dark border border-white/15 rounded-xl text-[13px] font-semibold transition-colors no-underline"
                >
                  <Plus className="w-4 h-4" /> {action.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats — só dos módulos que o usuário acessa */}
      {statCards.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <Link
              key={card.key}
              href={card.href}
              className="group bg-white rounded-2xl p-5 border border-gray-200/70 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all no-underline"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.accent}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-navy transition-colors" />
              </div>
              <p className="text-3xl font-bold text-gray-900 leading-none mb-1.5">{stats[card.key]}</p>
              <p className="text-[12.5px] text-gray-500 font-medium">{card.label}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas notícias — só para quem mexe com notícia */}
        {recentNews.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-sm">Últimas notícias</h2>
              <Link
                href="/painel/noticias"
                className="text-xs font-semibold text-navy hover:underline no-underline"
              >
                Ver todas
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentNews.map((news) => {
                const badge = statusBadge[news.status] || { label: 'Arquivada', className: 'bg-gray-50 text-gray-500' }
                return (
                  <Link
                    key={news.id}
                    href={`/painel/noticias/${news.id}/editar`}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50/80 transition-colors no-underline"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-gray-800 truncate">{news.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-300" />
                        <span className="text-[11px] text-gray-400">
                          {new Date(news.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        {news.category && (
                          <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            {news.category.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`text-[11px] px-2 py-1 rounded-full font-semibold shrink-0 ${badge.className}`}>
                      {badge.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Próximas sessões — só para gestor de sessões */}
        {upcomingSessions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden self-start">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-sm">Próximas sessões</h2>
              <Link
                href="/painel/sessoes"
                className="text-xs font-semibold text-navy hover:underline no-underline"
              >
                Ver todas
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {upcomingSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/painel/sessoes/${session.id}/editar`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/80 transition-colors no-underline"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-gray-800 truncate">{session.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {new Date(session.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Estado vazio: usuário sem nenhum módulo */}
      {statCards.length === 0 && recentNews.length === 0 && upcomingSessions.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200/70 p-12 text-center">
          <p className="text-gray-500">
            Você ainda não tem módulos atribuídos. Fale com o administrador do portal.
          </p>
        </div>
      )}
    </AdminLayout>
  )
}
