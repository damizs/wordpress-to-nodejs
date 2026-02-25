import { router } from '@inertiajs/react'
import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import { PageTitle } from '~/components/PageTitle'
import SeoHead from '~/components/SeoHead'
import { ClipboardList, Calendar, Search } from 'lucide-react'
import { useState } from 'react'

interface Props { sessions: any; filters: { year: string } }

export default function PautasIndex({ sessions, filters }: Props) {
  const [busca, setBusca] = useState('')

  const handleFilterChange = (key: string, value: string) => {
    router.get('/pautas', { ...filters, [key]: value }, { preserveState: true })
  }

  const filteredSessions = sessions.data?.filter((s: any) => {
    if (!busca) return true
    return s.title?.toLowerCase().includes(busca.toLowerCase())
  }) || []

  return (
    <>
      <SeoHead
        title="Pautas das Sessões - Câmara Municipal de Sumé"
        description="Confira as pautas das sessões plenárias da Câmara Municipal de Sumé."
        url="/pautas"
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />

        <main>
          <Breadcrumb items={[{ label: 'Pautas' }]} />
          <PageTitle title="PAUTAS LEGISLATIVAS" />

          <section className="py-12">
            <div className="container mx-auto px-4">
              {/* Filtros */}
              <div className="bg-gradient-hero rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-primary-foreground text-sm font-semibold mb-1 block">Filtrar por ano</label>
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
              <div className="space-y-6">
                {filteredSessions.map((s: any) => (
                  <div key={s.id} className="card-modern p-6 border-t-4 border-t-primary">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {s.session_date ? new Date(s.session_date).toLocaleDateString('pt-BR') : ''}
                        </span>
                      </div>
                      <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                        {s.session_date ? new Date(s.session_date).getFullYear() : ''}
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground mb-4">{s.title}</h3>
                    <a
                      href={`/pautas/${s.slug || s.id}`}
                      className="inline-block px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      Visualizar
                    </a>
                  </div>
                ))}
                {filteredSessions.length === 0 && (
                  <div className="card-modern p-12 text-center">
                    <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhuma pauta encontrada.</p>
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
