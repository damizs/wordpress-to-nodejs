import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Instagram, ArrowLeft, CheckCircle, XCircle, Clock, Trash2, ExternalLink, Filter } from 'lucide-react'
import { useState } from 'react'

interface Log {
  id: number
  instagram_id: string
  instagram_shortcode: string | null
  instagram_url: string | null
  instagram_caption: string | null
  instagram_image_url: string | null
  instagram_post_date: string | null
  generated_title: string | null
  generated_content: string | null
  ai_provider: string | null
  ai_model: string | null
  ai_tokens_used: number
  news_id: number | null
  status: string
  error_message: string | null
  processing_time: number | null
  created_at: string
  news?: { id: number; title: string; slug: string } | null
  user?: { id: number; name: string } | null
}

interface Props {
  logs: {
    data: Log[]
    meta: {
      total: number
      per_page: number
      current_page: number
      last_page: number
    }
  }
}

export default function InstagramHistory({ logs }: Props) {
  const [filter, setFilter] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

  const getCsrfToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''
  }

  const handleFilter = (status: string) => {
    setFilter(status)
    router.get('/painel/instagram/historico', { status }, { preserveState: true })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return
    setDeleting(id)
    router.delete(`/painel/instagram/${id}`, {
      onFinish: () => setDeleting(null),
    })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" />Publicado</span>
      case 'draft':
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700"><Clock className="w-3 h-3" />Rascunho</span>
      case 'error':
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700"><XCircle className="w-3 h-3" />Erro</span>
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700"><Clock className="w-3 h-3" />Pendente</span>
    }
  }

  return (
    <AdminLayout>
      <Head title="Histórico de Importação" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/painel/instagram" className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Histórico de Importação</h1>
              <p className="text-sm text-slate-500">{logs.meta.total} registros encontrados</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Filtrar:</span>
            {[
              { value: '', label: 'Todos' },
              { value: 'published', label: 'Publicados' },
              { value: 'draft', label: 'Rascunhos' },
              { value: 'error', label: 'Erros' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => handleFilter(opt.value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filter === opt.value ? 'bg-purple-100 text-purple-700' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Post</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Título Gerado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">IA</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      Nenhum registro encontrado
                    </td>
                  </tr>
                ) : (
                  logs.data.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {log.instagram_image_url && (
                            <img src={log.instagram_image_url} alt="" className="w-12 h-12 rounded object-cover" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-slate-800">{log.instagram_shortcode || log.instagram_id}</p>
                            {log.instagram_url && (
                              <a href={log.instagram_url} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                Ver no Instagram <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <p className="text-sm text-slate-800 truncate">{log.generated_title || '-'}</p>
                          {log.news && (
                            <a href={`/noticias/${log.news.slug}`} target="_blank" className="text-xs text-blue-600 hover:underline">
                              Ver notícia →
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="text-slate-800 capitalize">{log.ai_provider || '-'}</p>
                          <p className="text-xs text-slate-500">{log.ai_model}</p>
                          {log.ai_tokens_used > 0 && (
                            <p className="text-xs text-slate-400">{log.ai_tokens_used} tokens</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(log.status)}
                        {log.error_message && (
                          <p className="mt-1 text-xs text-red-500 max-w-[200px] truncate" title={log.error_message}>
                            {log.error_message}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-slate-600">
                          {formatDate(log.created_at)}
                          {log.processing_time && (
                            <p className="text-xs text-slate-400">{(log.processing_time / 1000).toFixed(1)}s</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(log.id)}
                          disabled={deleting === log.id}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {logs.meta.last_page > 1 && (
            <div className="px-4 py-3 border-t bg-slate-50 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Página {logs.meta.current_page} de {logs.meta.last_page}
              </p>
              <div className="flex gap-2">
                {logs.meta.current_page > 1 && (
                  <Link
                    href={`/painel/instagram/historico?page=${logs.meta.current_page - 1}${filter ? `&status=${filter}` : ''}`}
                    className="px-3 py-1.5 text-sm border rounded-lg hover:bg-white"
                  >
                    Anterior
                  </Link>
                )}
                {logs.meta.current_page < logs.meta.last_page && (
                  <Link
                    href={`/painel/instagram/historico?page=${logs.meta.current_page + 1}${filter ? `&status=${filter}` : ''}`}
                    className="px-3 py-1.5 text-sm border rounded-lg hover:bg-white"
                  >
                    Próxima
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
