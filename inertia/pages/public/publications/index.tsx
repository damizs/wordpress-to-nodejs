import { Head, router } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { PageHero } from '~/components/PageHero'
import { FileText, Download, Filter, Search } from 'lucide-react'
import { useState } from 'react'

interface Props { publications: any; filters: { type: string; year: string } }

const typeLabels: Record<string, string> = { portaria: 'Portaria', decreto: 'Decreto Legislativo', resolucao: 'Resolução', outros: 'Outros' }

export default function PublicationsIndex({ publications, filters }: Props) {
  const [search, setSearch] = useState('')
  const filtered = publications.data?.filter((p: any) => !search || p.title?.toLowerCase().includes(search.toLowerCase())) || []

  return (
    <PublicLayout>
      <Head title="Publicações Oficiais - Câmara de Sumé" />
      <PageHero title="Publicações Oficiais" subtitle="Portarias, decretos legislativos e resoluções da Câmara Municipal" icon={<FileText className="w-8 h-8" />}
        breadcrumbs={[{ label: 'Publicações Oficiais' }]} />
      <section className="py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-lg border p-4 mb-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar publicações..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-navy outline-none" />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-4 h-4 text-gray-400" />
              <select value={filters.type} onChange={(e) => router.get('/publicacoes-oficiais', { ...filters, tipo: e.target.value }, { preserveState: true })}
                className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-navy outline-none">
                <option value="">Todos os tipos</option>
                {Object.entries(typeLabels).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
              </select>
              <select value={filters.year} onChange={(e) => router.get('/publicacoes-oficiais', { ...filters, ano: e.target.value }, { preserveState: true })}
                className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:border-navy outline-none">
                <option value="">Todos os anos</option>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((y) => (<option key={y} value={y}>{y}</option>))}
              </select>
            </div>
          </div>
          <div className="space-y-3">
            {filtered.map((p: any) => (
              <div key={p.id} className="bg-white rounded-lg border hover:border-navy/30 transition-colors p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0"><FileText className="w-6 h-6 text-red-500" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm">{p.title}</h3>
                  <div className="flex gap-2 mt-1 text-xs text-gray-400">
                    <span>{typeLabels[p.type] || p.type}</span>
                    {p.publication_date && <span>• {new Date(p.publication_date).toLocaleDateString('pt-BR')}</span>}
                  </div>
                </div>
                {p.file_url && (
                  <a href={p.file_url} target="_blank" rel="noopener" className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex-shrink-0">
                    <Download className="w-4 h-4" /> PDF
                  </a>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="bg-white rounded-lg border p-12 text-center"><FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Nenhuma publicação encontrada.</p></div>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
