import { Head, router } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { FileText, Download, Search } from 'lucide-react'
import { useState } from 'react'

interface Props { publications: any; filters: { type: string; search: string } }

export default function PublicationsIndex({ publications, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '')

  function applyFilter(key: string, value: string) {
    router.get('/publicacoes', { ...filters, [key]: value }, { preserveState: true })
  }

  return (
    <PublicLayout>
      <Head title="Publicações Oficiais - Câmara de Sumé" />
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Publicações Oficiais</h1>
            <p className="text-gray-500 mt-2">Portarias, Decretos, Leis, Resoluções e demais atos oficiais</p>
          </div>

          <div className="flex gap-3 mb-6 flex-wrap">
            <select value={filters.type} onChange={(e) => applyFilter('tipo', e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="">Todos os tipos</option>
              <option value="portarias">Portarias</option>
              <option value="decretos">Decretos</option>
              <option value="resolucoes">Resoluções</option>
              <option value="leis">Leis</option>
              <option value="atos">Atos</option>
              <option value="contratos">Contratos</option>
              <option value="editais">Editais</option>
            </select>
            <form onSubmit={(e) => { e.preventDefault(); applyFilter('busca', search) }}
              className="flex items-center gap-2">
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título..."
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-64" />
              <button type="submit" className="p-2 text-gray-400 hover:text-navy"><Search className="w-4 h-4" /></button>
            </form>
          </div>

          <div className="space-y-3">
            {publications.data?.map((p: any) => (
              <div key={p.id} className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 text-sm">{p.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{p.publication_date}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{p.type}</span>
                      {p.number && <span className="text-xs text-gray-400">Nº {p.number}</span>}
                    </div>
                  </div>
                </div>
                {p.file_url && (
                  <a href={p.file_url} target="_blank" rel="noopener"
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-navy border border-navy/20 rounded-lg hover:bg-navy/5">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </a>
                )}
              </div>
            ))}
            {(!publications.data || publications.data.length === 0) && (
              <p className="text-center text-gray-400 py-12">Nenhuma publicação encontrada.</p>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
