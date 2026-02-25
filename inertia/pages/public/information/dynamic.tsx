import { Link, router } from '@inertiajs/react'
import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import SeoHead from '~/components/SeoHead'
import { FileText, Download, Search, ChevronRight, FolderOpen, Calendar, ExternalLink, Filter } from 'lucide-react'
import { useState } from 'react'

interface Props {
  records: any
  category: any
  allCategories: any[]
  filters: { year: string }
}

export default function DynamicInfoPage({ records, category, allCategories, filters }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const currentYear = new Date().getFullYear()

  const filteredRecords = records.data?.filter((r: any) =>
    !searchTerm || r.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  return (
    <>
      <SeoHead
        title={`${category.name} - Câmara Municipal de Sumé`}
        description={`Informações sobre ${category.name} da Câmara Municipal de Sumé`}
        url={`/${category.slug}`}
      />
      <div className="min-h-screen bg-background" style={{ fontFamily: "Verdana, Geneva, Tahoma, sans-serif" }}>
        <TopBar />
        <Header />
        <main>
          <Breadcrumb items={[
            { label: 'Transparência', href: '/transparencia' },
            { label: category.name }
          ]} />

          {/* Hero banner */}
          <div className="bg-gradient-hero text-primary-foreground py-14 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <FolderOpen className="w-8 h-8" />
              <h1 className="text-3xl md:text-4xl font-bold">{category.name}</h1>
            </div>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">
              Informações disponibilizadas conforme Lei de Acesso à Informação (Lei nº 12.527/2011)
            </p>
          </div>

          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
                {/* Main content */}
                <div className="flex-1">
                  {/* Filters bar */}
                  <div className="card-modern p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Buscar documentos..."
                          className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm focus:border-primary outline-none bg-background"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground" />
                        <select
                          value={filters.year}
                          onChange={(e) => router.get(`/${category.slug}`, { ano: e.target.value }, { preserveState: true })}
                          className="px-3 py-2.5 border border-border rounded-lg text-sm bg-background focus:border-primary outline-none"
                        >
                          <option value="">Todos os anos</option>
                          {Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Results count */}
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      {filteredRecords.length} {filteredRecords.length === 1 ? 'documento encontrado' : 'documentos encontrados'}
                      {filters.year && <span className="font-medium"> em {filters.year}</span>}
                    </p>
                  </div>

                  {/* Document listing */}
                  <div className="space-y-3">
                    {filteredRecords.map((r: any) => (
                      <div key={r.id} className="card-modern">
                        <div className="flex items-center gap-4 p-4">
                          {/* Icon */}
                          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6 text-red-500" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground text-sm">{r.title}</h3>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {r.year && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> {r.year}
                                </span>
                              )}
                              {r.reference_date && (
                                <span>Ref: {r.reference_date}</span>
                              )}
                              {r.created_at && (
                                <span>
                                  Publicado: {new Date(r.created_at).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                            {r.content && (
                              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: r.content.replace(/<[^>]*>/g, '').substring(0, 200) }}
                              />
                            )}
                          </div>

                          {/* Download button */}
                          {r.file_url && (
                            <a
                              href={r.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex-shrink-0"
                            >
                              <Download className="w-4 h-4" /> PDF
                            </a>
                          )}
                          {r.external_url && !r.file_url && (
                            <a
                              href={r.external_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2.5 border-2 border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium flex-shrink-0"
                            >
                              <ExternalLink className="w-4 h-4" /> Acessar
                            </a>
                          )}
                        </div>
                      </div>
                    ))}

                    {filteredRecords.length === 0 && (
                      <div className="card-modern p-12 text-center">
                        <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-foreground font-medium">Nenhum documento encontrado</p>
                        <p className="text-muted-foreground text-sm mt-1">
                          {searchTerm ? 'Tente alterar o termo de busca.' : 'Ainda não há documentos cadastrados nesta categoria.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  {records.meta && records.meta.last_page > 1 && (
                    <div className="flex justify-center gap-1 mt-8">
                      {Array.from({ length: records.meta.last_page }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => router.get(`/${category.slug}`, { page: p, ano: filters.year }, { preserveState: true })}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            p === records.meta.current_page
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-card border border-border text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <aside className="lg:w-72 flex-shrink-0">
                  <div className="card-modern sticky top-4 overflow-hidden">
                    {/* Sidebar header */}
                    <div className="bg-gradient-hero text-primary-foreground px-5 py-4">
                      <h3 className="font-bold flex items-center gap-2">
                        <FolderOpen className="w-5 h-5" /> Acesso à Informação
                      </h3>
                    </div>

                    {/* Category list */}
                    <nav className="p-3">
                      {allCategories.map((c: any) => (
                        <Link
                          key={c.slug}
                          href={`/${c.slug}`}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors mb-1 ${
                            c.slug === category.slug
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <FileText className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{c.name}</span>
                        </Link>
                      ))}
                    </nav>

                    {/* Info box */}
                    <div className="px-5 py-4 border-t border-border">
                      <div className="bg-sky/10 rounded-xl p-4 text-xs text-foreground">
                        <p className="font-semibold mb-1 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-primary" /> Lei de Acesso à Informação
                        </p>
                        <p className="text-muted-foreground">
                          A LAI (Lei nº 12.527/2011) regulamenta o direito constitucional de
                          acesso às informações públicas.
                        </p>
                      </div>
                    </div>

                    {/* Quick links */}
                    <div className="px-5 pb-4 space-y-2">
                      <a
                        href="/perguntas-frequentes"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ChevronRight className="w-3 h-3" /> Perguntas Frequentes
                      </a>
                      <a
                        href="/pesquisa-de-satisfacao"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ChevronRight className="w-3 h-3" /> Pesquisa de Satisfação
                      </a>
                      <a
                        href="/politica-de-privacidade"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ChevronRight className="w-3 h-3" /> Política de Privacidade
                      </a>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  )
}
