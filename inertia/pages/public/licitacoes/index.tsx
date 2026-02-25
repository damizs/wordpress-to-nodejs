import { router } from '@inertiajs/react'
import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import { PageTitle } from '~/components/PageTitle'
import SeoHead from '~/components/SeoHead'
import { Gavel, Download, Calendar, Search } from 'lucide-react'
import { useState } from 'react'

interface Props { licitacoes: any; filters: { status: string; modality: string } }

const statusLabels: Record<string, string> = { aberta: 'Aberta', encerrada: 'Encerrada', em_andamento: 'Em andamento', suspensa: 'Suspensa', cancelada: 'Cancelada', deserta: 'Deserta' }
const modalityLabels: Record<string, string> = { pregao: 'Pregão', tomada_precos: 'Tomada de Preços', concorrencia: 'Concorrência', convite: 'Convite', dispensa: 'Dispensa', inexigibilidade: 'Inexigibilidade' }

export default function LicitacoesIndex({ licitacoes, filters }: Props) {
  const [busca, setBusca] = useState('')

  const handleFilterChange = (key: string, value: string) => {
    router.get('/licitacoes', { ...filters, [key]: value }, { preserveState: true })
  }

  const filteredLicitacoes = licitacoes.data?.filter((l: any) => {
    if (!busca) return true
    return l.title?.toLowerCase().includes(busca.toLowerCase())
  }) || []

  return (
    <>
      <SeoHead
        title="Licitações e Contratos - Câmara Municipal de Sumé"
        description="Processos licitatórios e contratos da Câmara Municipal de Sumé. Transparência nas contratações públicas."
        url="/licitacoes"
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />

        <main>
          <Breadcrumb items={[{ label: 'Licitações' }]} />
          <PageTitle title="LICITAÇÕES E CONTRATOS" />

          <section className="py-12">
            <div className="container mx-auto px-4">
              {/* Filtros */}
              <div className="bg-gradient-hero rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-primary-foreground text-sm font-semibold mb-1 block">Filtrar por status</label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground border border-primary-foreground/20 text-sm"
                  >
                    <option value="">Todos os status</option>
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-primary-foreground text-sm font-semibold mb-1 block">Filtrar por modalidade</label>
                  <select
                    value={filters.modality || ''}
                    onChange={(e) => handleFilterChange('modalidade', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground border border-primary-foreground/20 text-sm"
                  >
                    <option value="">Todas as modalidades</option>
                    {Object.entries(modalityLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-primary-foreground text-sm font-semibold mb-1 block">Busca</label>
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

              {/* Lista */}
              <div className="space-y-4">
                {filteredLicitacoes.map((l: any) => (
                  <div key={l.id} className="card-modern p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
                        <Gavel className="w-6 h-6 text-gold" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground mb-2">{l.title}</h3>
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <span className="text-sm text-muted-foreground">
                            {modalityLabels[l.modality] || l.modality}
                          </span>
                          {l.opening_date && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(l.opening_date).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            l.status === 'aberta' ? 'bg-green-100 text-green-700' :
                            l.status === 'encerrada' ? 'bg-gray-200 text-gray-600' :
                            l.status === 'cancelada' ? 'bg-red-100 text-red-600' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {statusLabels[l.status] || l.status}
                          </span>
                        </div>
                        {l.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">{l.description}</p>
                        )}
                      </div>
                      {l.file_url && (
                        <a
                          href={l.file_url}
                          target="_blank"
                          rel="noopener"
                          className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold flex-shrink-0 transition-colors"
                        >
                          <Download className="w-4 h-4" /> PDF
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {filteredLicitacoes.length === 0 && (
                  <div className="card-modern p-12 text-center">
                    <Gavel className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhuma licitação encontrada.</p>
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
