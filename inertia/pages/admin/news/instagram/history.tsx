import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Instagram, ArrowLeft, Trash2, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Log {
  id: number
  instagramId: string
  instagramShortcode: string | null
  instagramUrl: string | null
  instagramCaption: string | null
  instagramImageUrl: string | null
  instagramPostDate: string | null
  generatedTitle: string | null
  generatedContent: string | null
  aiProvider: string | null
  aiModel: string | null
  aiTokensUsed: number
  newsId: number | null
  status: string
  processingTime: number | null
  errorMessage: string | null
  createdAt: string
  news?: { id: number; title: string; slug: string }
  user?: { id: number; name: string }
}

interface Props {
  logs: {
    data: Log[]
    meta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
    }
  }
}

export default function InstagramHistory({ logs }: Props) {
  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      router.delete(`/painel/instagram/${id}`)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            <CheckCircle className="w-3 h-3" />
            Publicado
          </span>
        )
      case 'error':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
            <XCircle className="w-3 h-3" />
            Erro
          </span>
        )
      case 'draft':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
            <Clock className="w-3 h-3" />
            Rascunho
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
            <Clock className="w-3 h-3" />
            Pendente
          </span>
        )
    }
  }

  return (
    <AdminLayout>
      <Head title="Histórico - Automação Instagram" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/painel/instagram"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Histórico de Importações</h1>
              <p className="text-sm text-gray-500">{logs.meta.total} registros</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Post
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Título Gerado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    IA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Nenhum registro encontrado
                    </td>
                  </tr>
                ) : (
                  logs.data.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {log.instagramImageUrl ? (
                            <img
                              src={log.instagramImageUrl}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Instagram className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-gray-500">
                              {log.instagramShortcode || log.instagramId}
                            </p>
                            {log.instagramUrl && (
                              <a
                                href={log.instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-pink-600 hover:underline flex items-center gap-1"
                              >
                                Ver no Instagram
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-xs">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {log.generatedTitle || '-'}
                          </p>
                          {log.news && (
                            <Link
                              href={`/painel/noticias/${log.news.id}/editar`}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Ver notícia →
                            </Link>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="text-gray-900">{log.aiProvider || '-'}</p>
                          <p className="text-xs text-gray-500">{log.aiModel || '-'}</p>
                          {log.aiTokensUsed > 0 && (
                            <p className="text-xs text-gray-400">{log.aiTokensUsed} tokens</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(log.status)}
                        {log.errorMessage && (
                          <p className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={log.errorMessage}>
                            {log.errorMessage}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="text-gray-900">
                            {new Date(log.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.createdAt).toLocaleTimeString('pt-BR')}
                          </p>
                          {log.processingTime && (
                            <p className="text-xs text-gray-400">
                              {log.processingTime.toFixed(2)}s
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
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
          {logs.meta.lastPage > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Página {logs.meta.currentPage} de {logs.meta.lastPage}
              </p>
              <div className="flex gap-2">
                {logs.meta.currentPage > 1 && (
                  <Link
                    href={`/painel/instagram/historico?page=${logs.meta.currentPage - 1}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm"
                  >
                    Anterior
                  </Link>
                )}
                {logs.meta.currentPage < logs.meta.lastPage && (
                  <Link
                    href={`/painel/instagram/historico?page=${logs.meta.currentPage + 1}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm"
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
