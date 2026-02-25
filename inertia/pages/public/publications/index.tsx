import { router } from '@inertiajs/react'
import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import { PageTitle } from '~/components/PageTitle'
import SeoHead from '~/components/SeoHead'
import { FileText, Download, Calendar, Search } from 'lucide-react'
import { useState } from 'react'

interface Props { publications: any; filters: { type: string; year: string } }

const typeLabels: Record<string, string> = { portaria: 'Portaria', decreto: 'Decreto Legislativo', resolucao: 'Resolução', outros: 'Outros' }

export default function PublicationsIndex({ publications, filters }: Props) {
  const [busca, setBusca] = useState('')
  const [ordenar, setOrdenar] = useState('recente')

  const handleFilterChange = (key: string, value: string) => {
    router.get('/publicacoes-oficiais', { ...filters, [key]: value }, { preserveState: true })
  }

  const filteredPublications = publications.data?.filter((p: any) => {
    if (!busca) return true
    return p.title?.toLowerCase().includes(busca.toLowerCase())
  }).sort((a: any, b: any) => {
    const da = new Date(a.publication_date || a.created_at).getTime()
    const db = new Date(b.publication_date || b.created_at).getTime()
    return ordenar === 'recente' ? db - da : da - db
  }) || []

  return (
    <>
      <SeoHead
        title="Publicações Oficiais - Câmara Municipal de Sumé"
        description="Portarias, decretos legislativos e resoluções da Câmara Municipal de Sumé."
        url="/publicacoes-oficiais"
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />

        <main>
          <Breadcrumb items={[{ label: 'Publicações Oficiais' }]} />
          <PageTitle title="PUBLICAÇÕES OFICIAIS" />

          <section className="py-12">
            <div className="container mx-auto px-4">
              {/* Filtros */}
              <div className="bg-gradient-hero rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <label className="text-primary-foreground text-sm font-semibold mb-1 block">Filtrar por Tipo</label>
                  <select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange('tipo', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground border border-primary-foreground/20 text-sm"
                  >
                    <option value="">Todos os tipos</option>
                    {Object.entries(typeLabels).map(([k, v]) => (
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

              {/* Ordenação */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-muted-foreground">{filteredPublications.length} publicação(ões) encontrada(s)</p>
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
                {filteredPublications.map((p: any) => (
                  <div key={p.id} className="card-modern p-6">
                    <div className="flex items-center gap-2 text-primary mb-3">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {p.publication_date ? new Date(p.publication_date).toLocaleDateString('pt-BR') : ''}
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground italic mb-4">{p.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                        {typeLabels[p.type] || p.type}
                      </span>
                      {p.file_url ? (
                        <a
                          href={p.file_url}
                          target="_blank"
                          rel="noopener"
                          className="flex items-center gap-2 px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                        >
                          <Download className="w-4 h-4" /> PDF
                        </a>
                      ) : (
                        <button className="px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                          Visualizar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredPublications.length === 0 && (
                  <div className="card-modern p-12 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhuma publicação encontrada.</p>
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
