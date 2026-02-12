import { Head, Link, router } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { ArrowLeft, FileText, Download } from 'lucide-react'

interface Props {
  records: any
  category: string
  categoryName: string
  categories: any[]
  filters: { year: string }
}

export default function InformationCategory({ records, category, categoryName, categories, filters }: Props) {
  return (
    <PublicLayout>
      <Head title={`${categoryName} - Acesso à Informação - Câmara de Sumé`} />
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <Link href="/acesso-informacao" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Voltar para Acesso à Informação
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{categoryName}</h1>

          {/* Sidebar categories + filter */}
          <div className="flex flex-col md:flex-row gap-6 mt-6">
            <aside className="md:w-56 flex-shrink-0">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Categorias</h2>
              <nav className="space-y-1">
                {categories.map((c: any) => (
                  <Link key={c.slug} href={`/acesso-informacao/${c.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${c.slug === category ? 'bg-navy text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                    {c.name}
                  </Link>
                ))}
              </nav>
            </aside>

            <div className="flex-1">
              <div className="flex gap-3 mb-4">
                <select value={filters.year}
                  onChange={(e) => router.get(`/acesso-informacao/${category}`, { ano: e.target.value }, { preserveState: true })}
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
                  <p className="text-center text-gray-400 py-12">Nenhum registro encontrado nesta categoria.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
