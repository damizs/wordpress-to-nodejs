import { Head, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Instagram, ArrowLeft, ExternalLink, Trash2, Eye, Filter } from 'lucide-react'
import { useState } from 'react'

interface Log {
  id: number
  instagramId: string
  instagramUrl: string | null
  instagramCaption: string | null
  instagramPostDate: string | null
  generatedTitle: string | null
  generatedContent: string | null
  aiProvider: string | null
  aiModel: string | null
  aiTokensUsed: number
  newsId: number | null
  status: string
  createdAt: string
  news?: { id: number; title: string; slug: string } | null
  user?: { id: number; name: string } | null
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
  const [statusFilter, setStatusFilter] = useState('')

  const filteredLogs = statusFilter
    ? logs.data.filter(log => log.status === statusFilter)
    : logs.data

  return (
    <AdminLayout>
      <Head title="Histórico - Instagram" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/painel/noticias/instagram" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <Instagram className="w-8 h-8 text-pink-500" />
            <h1 className="text-2xl font-bold">Histórico de Importação</h1>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Todos os status</option>
              <option value="published">Publicado</option>
              <option value="draft">Rascunho</option>
              <option value="error">Erro</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <p className="text-sm text-gray-600">
              Total: <strong>{logs.meta.total}</strong> registros
              {statusFilter && ` (mostrando ${filteredLogs.length} filtrados)`}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Título Gerado</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">IA</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Importado por</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      Nenhum registro encontrado
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {new Date(log.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleTimeString('pt-BR')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900 max-w-xs truncate">
                          {log.generatedTitle || 'Sem título'}
                        </p>
                        {log.instagramPostDate && (
                          <p className="text-xs text-gray-500">
                            Post de {new Date(log.instagramPostDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                          {log.aiProvider || '-'}
                        </span>
                        {log.aiTokensUsed > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {log.aiTokensUsed} tokens
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          log.status === 'published' ? 'bg-green-100 text-green-800' :
                          log.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          log.status === 'error' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.status === 'published' ? '✅ Publicado' :
                           log.status === 'draft' ? '📝 Rascunho' :
                           log.status === 'error' ? '❌ Erro' :
                           log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {log.user?.name || 'Sistema'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {log.instagramUrl && (
                            <a
                              href={log.instagramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-pink-600 hover:bg-pink-50 rounded"
                              title="Ver no Instagram"
                            >
                              <Instagram className="w-4 h-4" />
                            </a>
                          )}
                          {log.newsId && (
                            <a
                              href={`/painel/noticias/${log.newsId}/editar`}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Editar notícia"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          )}
                          <Link
                            href={`/painel/noticias/instagram/${log.id}`}
                            method="delete"
                            as="button"
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Excluir log"
                            onClick={(e) => {
                              if (!confirm('Remover este log? A notícia não será excluída.')) {
                                e.preventDefault()
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {logs.meta.lastPage > 1 && (
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Página {logs.meta.currentPage} de {logs.meta.lastPage}
              </p>
              <div className="flex gap-2">
                {logs.meta.currentPage > 1 && (
                  <a
                    href={`?page=${logs.meta.currentPage - 1}`}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                  >
                    Anterior
                  </a>
                )}
                {logs.meta.currentPage < logs.meta.lastPage && (
                  <a
                    href={`?page=${logs.meta.currentPage + 1}`}
                    className="px-3 py-1 border rounded hover:bg-gray-100"
                  >
                    Próxima
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
