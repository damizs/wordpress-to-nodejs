import { router } from '@inertiajs/react'
import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import { PageTitle } from '~/components/PageTitle'
import SeoHead from '~/components/SeoHead'
import { CheckCircle2, Search, Clock } from 'lucide-react'
import { useState } from 'react'

interface Activity {
  id: number
  type: string
  number: string
  year: number
  summary: string
  author: string
  status: string
  slug?: string
  created_at: string
}

interface Props {
  activities: { data: Activity[] }
  filters: { type: string; year: string }
  councilors?: { id: number; name: string }[]
}

const typeLabels: Record<string, string> = {
  projeto_lei: 'Projeto de Lei',
  projeto_resolucao: 'Projeto de Resolução',
  requerimento: 'Requerimento',
  mocao: 'Moção',
  indicacao: 'Indicação',
  resolucao: 'Resolução',
  emenda: 'Emenda',
}

const statusLabels: Record<string, { label: string; color: string }> = {
  aprovado: { label: 'Aprovada', color: 'bg-green-100 text-green-700' },
  aprovada: { label: 'Aprovada', color: 'bg-green-100 text-green-700' },
  rejeitado: { label: 'Rejeitada', color: 'bg-red-100 text-red-600' },
  rejeitada: { label: 'Rejeitada', color: 'bg-red-100 text-red-600' },
  arquivado: { label: 'Arquivada', color: 'bg-gray-200 text-gray-600' },
  arquivada: { label: 'Arquivada', color: 'bg-gray-200 text-gray-600' },
  em_tramitacao: { label: 'Em Tramitação', color: 'bg-amber-100 text-amber-700' },
  tramitacao: { label: 'Em Tramitação', color: 'bg-amber-100 text-amber-700' },
}

export default function ActivitiesIndex({ activities, filters, councilors }: Props) {
  const [busca, setBusca] = useState('')
  const [ordenar, setOrdenar] = useState('recente')

  const handleFilterChange = (key: string, value: string) => {
    router.get('/atividades-legislativas', { ...filters, [key]: value }, { preserveState: true })
  }

  const filteredActivities = activities.data?.filter((a) => {
    if (!busca) return true
    const searchLower = busca.toLowerCase()
    return (
      a.summary?.toLowerCase().includes(searchLower) ||
      a.author?.toLowerCase().includes(searchLower) ||
      `${a.number}/${a.year}`.includes(searchLower)
    )
  }).sort((a, b) => {
    if (ordenar === 'recente') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  }) || []

  return (
    <>
      <SeoHead
        title="Atividades Legislativas - Câmara Municipal de Sumé"
        description="Acompanhe projetos de lei, requerimentos, moções, indicações e demais atos legislativos da Câmara Municipal de Sumé."
        url="/atividades-legislativas"
      />
      <div className="min-h-screen bg-background" style={{ fontFamily: "Verdana, Geneva, Tahoma, sans-serif" }}>
        <TopBar />
        <Header />

        <main>
          <Breadcrumb items={[{ label: 'Atividades Legislativas' }]} />
          <PageTitle title="ATIVIDADES LEGISLATIVAS" />

          <section className="py-12">
            <div className="container mx-auto px-4">
              {/* Filtros */}
              <div className="bg-gradient-hero rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-primary-foreground text-sm font-semibold mb-1 block">
                    Filtrar por Tipo
                  </label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange('tipo', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground border border-primary-foreground/20 text-sm"
                  >
                    <option value="">Todas as atividades</option>
                    {Object.entries(typeLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-primary-foreground text-sm font-semibold mb-1 block">
                    Filtrar por Ano
                  </label>
                  <select
                    value={filters.year || ''}
                    onChange={(e) => handleFilterChange('ano', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground border border-primary-foreground/20 text-sm"
                  >
                    <option value="">Todos os anos</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-primary-foreground text-sm font-semibold mb-1 block">
                    Busca
                  </label>
                  <div className="relative">
                    <input
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Digite sua busca..."
                      className="w-full px-4 py-2.5 rounded-lg bg-background text-foreground border border-border text-sm"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              {/* Ordenação */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-muted-foreground">
                  {filteredActivities.length} atividades encontradas
                </p>
                <select
                  value={ordenar}
                  onChange={(e) => setOrdenar(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-border text-sm text-foreground bg-background"
                >
                  <option value="recente">Mais recente</option>
                  <option value="antigo">Mais antigo</option>
                </select>
              </div>

              {/* Lista */}
              <div className="space-y-4">
                {filteredActivities.map((a) => {
                  const statusInfo = statusLabels[a.status] || { label: a.status, color: 'bg-gray-100 text-gray-600' }
                  return (
                    <a
                      key={a.id}
                      href={`/atividades-legislativas/${a.slug || a.id}`}
                      className="block card-modern p-6 hover:shadow-lg transition-shadow"
                    >
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full mb-3 ${statusInfo.color}`}>
                        {a.status === 'aprovado' || a.status === 'aprovada' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {statusInfo.label}
                      </span>
                      <h3 className="font-bold text-foreground mb-1">
                        {typeLabels[a.type] || a.type} Nº {a.number}/{a.year}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {a.summary}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                          {typeLabels[a.type] || a.type}
                        </span>
                        {a.author && (
                          <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                            {a.author}
                          </span>
                        )}
                      </div>
                    </a>
                  )
                })}
                {filteredActivities.length === 0 && (
                  <div className="card-modern p-12 text-center">
                    <p className="text-muted-foreground">Nenhuma atividade encontrada.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}

