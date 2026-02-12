import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Pencil, Trash2, ScrollText, Search, Filter } from 'lucide-react'
import { useState } from 'react'

interface Props {
  activities: {
    data: any[]
    meta: { total: number; per_page: number; current_page: number; last_page: number }
  }
  filters: { type: string; year: string; search: string }
  types: string[]
  years: number[]
}

export default function ActivitiesIndex({ activities, filters, types, years }: Props) {
  const [search, setSearch] = useState(filters.search)

  function handleFilter(field: string, value: string) {
    router.get('/painel/atividades', { ...filters, [field]: value, page: 1 }, { preserveState: true })
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    handleFilter('search', search)
  }

  function handleDelete(id: number) {
    if (confirm('Excluir esta atividade?')) {
      router.delete(`/painel/atividades/${id}`)
    }
  }

  const { data, meta } = activities

  return (
    <AdminLayout title="Atividades Legislativas">
      <Head title="Atividades Legislativas - Painel" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <p className="text-sm text-gray-500">{meta.total} atividade(s)</p>
        <Link href="/painel/atividades/criar"
          className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Nova Atividade
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tipo</label>
          <select value={filters.type} onChange={(e) => handleFilter('type', e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">Todos</option>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Ano</label>
          <select value={filters.year} onChange={(e) => handleFilter('year', e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">Todos</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-48" />
          <button type="submit" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {data.length === 0 ? (
          <div className="p-12 text-center">
            <ScrollText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma atividade encontrada</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nº/Ano</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ementa</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Autor</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a: any) => (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-navy/10 text-navy rounded-full text-xs font-medium">{a.type}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{a.number}/{a.year}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate">{a.summary}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{a.status}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{a.author || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/painel/atividades/${a.id}/editar`}
                        className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(a.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {meta.last_page > 1 && (
          <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => handleFilter('page', String(page))}
                className={`w-8 h-8 rounded-lg text-sm font-medium ${
                  page === meta.current_page ? 'bg-navy text-white' : 'hover:bg-gray-100 text-gray-600'
                }`}>{page}</button>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
