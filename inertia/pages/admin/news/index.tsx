import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface NewsItem {
  id: number
  title: string
  slug: string
  status: string
  published_at: string | null
  created_at: string
  views_count: number
  cover_image_url: string | null
  category?: { id: number; name: string } | null
  author?: { full_name: string } | null
}

interface Props {
  news: {
    data: NewsItem[]
    meta: {
      total: number
      per_page: number
      current_page: number
      last_page: number
    }
  }
  categories: Array<{ id: number; name: string; slug: string }>
  filters: { status: string; category: string; search: string }
}

export default function NewsIndex({ news, categories, filters }: Props) {
  const [search, setSearch] = useState(filters.search)

  function applyFilters(overrides: Record<string, string> = {}) {
    const params: Record<string, string> = {
      status: filters.status,
      category: filters.category,
      search,
      ...overrides,
    }
    // Remove empty
    const clean: Record<string, string> = {}
    for (const [k, v] of Object.entries(params)) {
      if (v) clean[k] = v
    }
    router.get('/painel/noticias', clean, { preserveState: true })
  }

  function handleDelete(id: number, title: string) {
    if (confirm(`Excluir "${title}"?`)) {
      router.delete(`/painel/noticias/${id}`)
    }
  }

  return (
    <AdminLayout title="Notícias">
      <Head title="Notícias - Painel" />

      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters({ search })}
              placeholder="Buscar notícias..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none"
            />
          </div>

          {/* Status filter */}
          <select
            value={filters.status}
            onChange={(e) => applyFilters({ status: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-navy/20 outline-none"
          >
            <option value="">Todos</option>
            <option value="published">Publicadas</option>
            <option value="draft">Rascunhos</option>
            <option value="archived">Arquivadas</option>
          </select>

          {/* Category filter */}
          <select
            value={filters.category}
            onChange={(e) => applyFilters({ category: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-navy/20 outline-none hidden sm:block"
          >
            <option value="">Categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <Link
          href="/painel/noticias/criar"
          className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white rounded-lg hover:bg-navy-dark transition-colors text-sm font-medium whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Nova Notícia
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Categoria</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Data</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {news.data.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">
                    Nenhuma notícia encontrada
                  </td>
                </tr>
              )}
              {news.data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {item.cover_image_url && (
                        <img src={item.cover_image_url} alt="" className="w-10 h-10 rounded-lg object-cover hidden sm:block" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{item.title}</p>
                        <p className="text-xs text-gray-400 hidden sm:block">{item.author?.full_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    {item.category ? (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{item.category.name}</span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700'
                        : item.status === 'draft'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.status === 'published' ? 'Publicada' : item.status === 'draft' ? 'Rascunho' : 'Arquivada'}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className="text-xs text-gray-500">
                      {new Date(item.published_at || item.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {item.status === 'published' && (
                        <Link
                          href={`/noticias/${item.slug}`}
                          target="_blank"
                          className="p-2 text-gray-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Ver no site"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      )}
                      <Link
                        href={`/painel/noticias/${item.id}/editar`}
                        className="p-2 text-gray-400 hover:text-navy rounded-lg hover:bg-navy/5 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {news.meta.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              {news.meta.total} notícia{news.meta.total !== 1 ? 's' : ''} • Página {news.meta.current_page} de {news.meta.last_page}
            </span>
            <div className="flex items-center gap-1">
              {news.meta.current_page > 1 && (
                <Link
                  href={`/painel/noticias?page=${news.meta.current_page - 1}`}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                  preserveState
                >
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              )}
              {news.meta.current_page < news.meta.last_page && (
                <Link
                  href={`/painel/noticias?page=${news.meta.current_page + 1}`}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                  preserveState
                >
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
