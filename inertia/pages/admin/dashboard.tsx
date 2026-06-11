import { Head, Link, usePage } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  Newspaper, FileText, Users, ArrowRight, Clock, Gavel, ScrollText,
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

export default function Dashboard({ stats, recentNews, upcomingSessions, userName }: Props) {
  const { auth } = usePage().props as any
  const permissions: string[] = auth?.permissions || []
  const can = (p: string) => permissions.includes(p)

  // Cartões de estatística — só aparecem se o backend mandou o número
  const statCards = [
    { key: 'publishedNews', label: 'Notícias Publicadas', icon: Newspaper, color: 'bg-emerald-500', href: '/painel/noticias?status=published' },
    { key: 'draftNews', label: 'Rascunhos', icon: FileText, color: 'bg-amber-500', href: '/painel/noticias?status=draft' },
    { key: 'scheduledSessions', label: 'Sessões Agendadas', icon: Gavel, color: 'bg-blue-500', href: '/painel/sessoes' },
    { key: 'councilors', label: 'Vereadores Ativos', icon: Users, color: 'bg-violet-500', href: '/painel/vereadores' },
    { key: 'openLicitacoes', label: 'Licitações Abertas', icon: ShoppingCart, color: 'bg-orange-500', href: '/painel/licitacoes' },
    { key: 'pntpRecords', label: 'Registros PNTP', icon: FolderOpen, color: 'bg-cyan-600', href: '/painel/acesso-informacao' },
    { key: 'atriconPending', label: 'Pendências ATRICON', icon: Radar, color: 'bg-purple-600', href: '/painel/atricon' },
    { key: 'publications', label: 'Publicações Oficiais', icon: ScrollText, color: 'bg-rose-500', href: '/painel/publicacoes' },
    { key: 'surveyResponses', label: 'Respostas da Pesquisa', icon: MessageSquare, color: 'bg-teal-500', href: '/painel/pesquisa-satisfacao' },
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

  return (
    <AdminLayout title="Dashboard">
      <Head title="Dashboard - Painel" />

      {/* Saudação + ações rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{greeting}, {firstName}!</h2>
          <p className="text-sm text-gray-500 mt-0.5">Aqui está o resumo das suas áreas de trabalho.</p>
        </div>
        {quickActions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy-dark transition-colors no-underline"
              >
                <Plus className="w-4 h-4" /> {action.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Stats — só dos módulos que o usuário acessa */}
      {statCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <Link
              key={card.key}
              href={card.href}
              className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow group no-underline"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats[card.key]}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas notícias — só para quem mexe com notícia */}
        {recentNews.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Últimas Notícias</h2>
              <Link href="/painel/noticias" className="text-sm text-navy hover:underline">Ver todas</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentNews.map((news) => (
                <Link
                  key={news.id}
                  href={`/painel/noticias/${news.id}/editar`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors no-underline"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{news.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {new Date(news.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      {news.category && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {news.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ml-3 ${
                    news.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700'
                      : news.status === 'draft'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-gray-50 text-gray-500'
                  }`}>
                    {news.status === 'published' ? 'Publicada' : news.status === 'draft' ? 'Rascunho' : 'Arquivada'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Próximas sessões — só para gestor de sessões */}
        {upcomingSessions.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Próximas Sessões</h2>
              <Link href="/painel/sessoes" className="text-sm text-navy hover:underline">Ver todas</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {upcomingSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/painel/sessoes/${session.id}/editar`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors no-underline"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{session.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
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
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-gray-500">Você ainda não tem módulos atribuídos. Fale com o administrador do portal.</p>
        </div>
      )}
    </AdminLayout>
  )
}
