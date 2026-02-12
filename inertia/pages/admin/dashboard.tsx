import { Head, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Newspaper, FileText, Users, Eye, ArrowRight, Clock } from 'lucide-react'

interface Props {
  stats: {
    totalNews: number
    publishedNews: number
    draftNews: number
    totalCouncilors: number
  }
  recentNews: Array<{
    id: number
    title: string
    status: string
    created_at: string
    category?: { name: string } | null
  }>
}

export default function Dashboard({ stats, recentNews }: Props) {
  const cards = [
    { label: 'Notícias Publicadas', value: stats.publishedNews, icon: Newspaper, color: 'bg-emerald-500', href: '/painel/noticias?status=published' },
    { label: 'Rascunhos', value: stats.draftNews, icon: FileText, color: 'bg-amber-500', href: '/painel/noticias?status=draft' },
    { label: 'Total de Notícias', value: stats.totalNews, icon: Eye, color: 'bg-blue-500', href: '/painel/noticias' },
    { label: 'Vereadores Ativos', value: stats.totalCouncilors, icon: Users, color: 'bg-violet-500', href: '#' },
  ]

  return (
    <AdminLayout title="Dashboard">
      <Head title="Dashboard - Painel" />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent News */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Últimas Notícias</h2>
          <Link href="/painel/noticias" className="text-sm text-navy hover:underline">Ver todas</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentNews.length === 0 && (
            <p className="px-5 py-8 text-center text-gray-400 text-sm">Nenhuma notícia cadastrada</p>
          )}
          {recentNews.map((news) => (
            <Link
              key={news.id}
              href={`/painel/noticias/${news.id}/editar`}
              className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
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
    </AdminLayout>
  )
}
