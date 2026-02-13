import { Head, Link, router } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
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
    <PublicLayout>
      <Head title={`${category.name} - Câmara de Sumé`} />

      {/* Breadcrumb */}
      <div className="bg-gray-100 py-3 border-b">
        <div className="max-w-6xl mx-auto px-4 text-sm text-gray-500 flex items-center gap-2">
          <a href="/" className="hover:text-navy">Início</a>
          <ChevronRight className="w-3 h-3" />
          <a href="/transparencia" className="hover:text-navy">Acesso à Informação</a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700">{category.name}</span>
        </div>
      </div>

      {/* Hero banner */}
      <div className="bg-gradient-hero text-white py-14 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <FolderOpen className="w-8 h-8" />
          <h1 className="text-3xl md:text-4xl font-bold">{category.name}</h1>
        </div>
        <p className="text-white/80 max-w-2xl mx-auto">
          Informações disponibilizadas conforme Lei de Acesso à Informação (Lei nº 12.527/2011)
        </p>
      </div>

      <section className="py-10 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="flex-1">
              {/* Filters bar */}
              <div className="bg-white rounded-lg border p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar documentos..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-navy focus:ring-0 outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                      value={filters.year}
                      onChange={(e) => router.get(`/${category.slug}`, { ano: e.target.value }, { preserveState: true })}
                      className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-navy outline-none"
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
                <p className="text-sm text-gray-500">
                  {filteredRecords.length} {filteredRecords.length === 1 ? 'documento encontrado' : 'documentos encontrados'}
                  {filters.year && <span className="font-medium"> em {filters.year}</span>}
                </p>
              </div>

              {/* Document listing */}
              <div className="space-y-3">
                {filteredRecords.map((r: any) => (
                  <div key={r.id} className="bg-white rounded-lg border hover:border-navy/30 transition-colors">
                    <div className="flex items-center gap-4 p-4">
                      {/* Icon */}
                      <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-red-500" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm">{r.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
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
                          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2"
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
                          className="flex items-center gap-2 px-4 py-2.5 border-2 border-navy text-navy rounded-lg hover:bg-navy/5 transition-colors text-sm font-medium flex-shrink-0"
                        >
                          <ExternalLink className="w-4 h-4" /> Acessar
                        </a>
                      )}
                    </div>
                  </div>
                ))}

                {filteredRecords.length === 0 && (
                  <div className="bg-white rounded-lg border p-12 text-center">
                    <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Nenhum documento encontrado</p>
                    <p className="text-gray-400 text-sm mt-1">
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
                          ? 'bg-navy text-white'
                          : 'bg-white border text-gray-600 hover:bg-gray-50'
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
              <div className="bg-white rounded-lg border sticky top-4">
                {/* Sidebar header */}
                <div className="bg-navy text-white px-5 py-4 rounded-t-lg">
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
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5 ${
                        c.slug === category.slug
                          ? 'bg-navy/10 text-navy font-semibold border-l-4 border-navy pl-2'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-navy'
                      }`}
                    >
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{c.name}</span>
                    </Link>
                  ))}
                </nav>

                {/* Info box */}
                <div className="px-5 py-4 border-t">
                  <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                    <p className="font-semibold mb-1">📋 Lei de Acesso à Informação</p>
                    <p>
                      A LAI (Lei nº 12.527/2011) regulamenta o direito constitucional de
                      acesso às informações públicas.
                    </p>
                  </div>
                </div>

                {/* Quick links */}
                <div className="px-5 pb-4 space-y-2">
                  <a
                    href="/perguntas-frequentes"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" /> Perguntas Frequentes
                  </a>
                  <a
                    href="/pesquisa-de-satisfacao"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" /> Pesquisa de Satisfação
                  </a>
                  <a
                    href="/politica-de-privacidade"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy transition-colors"
                  >
                    <ChevronRight className="w-3 h-3" /> Política de Privacidade
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
