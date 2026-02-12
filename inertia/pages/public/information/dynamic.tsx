import { Head, Link, router } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { FileText, Download, FolderOpen } from 'lucide-react'

interface Props {
  records: any
  category: any
  allCategories: any[]
  filters: { year: string }
}

export default function DynamicInfoPage({ records, category, allCategories, filters }: Props) {
  return (
    <PublicLayout>
      <Head title={`${category.name} - Câmara de Sumé`} />
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <FolderOpen className="w-12 h-12 mx-auto text-navy mb-3" />
            <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
            <p className="text-gray-500 mt-2">Informações disponibilizadas conforme Lei de Acesso à Informação</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar - outras categorias */}
            <aside className="md:w-56 flex-shrink-0">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Categorias</h2>
              <nav className="space-y-1">
                {allCategories.map((c: any) => (
                  <Link key={c.slug} href={`/${c.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${c.slug === category.slug ? 'bg-navy text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                    {c.name}
                  </Link>
                ))}
              </nav>
            </aside>

            {/* Conteúdo */}
            <div className="flex-1">
              <div className="flex gap-3 mb-4">
                <select value={filters.year}
                  onChange={(e) => router.get(`/${category.slug}`, { ano: e.target.value }, { preserveState: true })}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                  <option value="">Todos os anos</option>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                {records.data?.map((r: any) => (
                  <div key={r.id} className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-navy/5 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-navy" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800 text-sm">{r.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{r.year}</span>
                          {r.reference_date && <span className="text-xs text-gray-400">• Ref: {r.reference_date}</span>}
                        </div>
                        {r.content && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.content}</p>}
                      </div>
                    </div>
                    {r.file_url && (
                      <a href={r.file_url} target="_blank" rel="noopener"
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-navy border border-navy/20 rounded-lg hover:bg-navy/5 flex-shrink-0">
                        <Download className="w-3.5 h-3.5" /> PDF
                      </a>
                    )}
                  </div>
                ))}
                {(!records.data || records.data.length === 0) && (
                  <p className="text-center text-gray-400 py-12">Nenhum registro encontrado.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
