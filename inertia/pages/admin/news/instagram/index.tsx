import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Instagram, Settings, History, Play, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useState } from 'react'

interface Props {
  settings: Record<string, string | null>
  logs: any[]
  stats: {
    total: number
    success: number
    errors: number
    today: number
  }
}

export default function InstagramDashboard({ settings, logs, stats }: Props) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const runAutoImport = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/painel/instagram/auto-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1] || '',
        },
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        router.reload()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const isConfigured = settings.instagram_profile_url && settings.ai_api_key

  return (
    <AdminLayout>
      <Head title="Automação Instagram" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Automação Instagram</h1>
              <p className="text-gray-500">Importe posts do Instagram automaticamente como notícias</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/painel/instagram/configuracoes"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <Settings className="w-4 h-4" />
              Configurações
            </Link>
            <Link
              href="/painel/instagram/historico"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <History className="w-4 h-4" />
              Histórico
            </Link>
          </div>
        </div>

        {/* Mensagem */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Status de Configuração */}
        {!isConfigured && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800">⚠️ Configuração necessária</h3>
            <p className="text-yellow-700 mt-1">
              Configure a URL do perfil do Instagram e a chave da API de IA para começar a usar.
            </p>
            <Link
              href="/painel/instagram/configuracoes"
              className="inline-flex items-center gap-2 mt-3 text-yellow-800 font-medium hover:underline"
            >
              <Settings className="w-4 h-4" />
              Ir para configurações
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Instagram className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total importados</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.success}</p>
                <p className="text-sm text-gray-500">Com sucesso</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.errors}</p>
                <p className="text-sm text-gray-500">Erros</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
                <p className="text-sm text-gray-500">Hoje</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ação Rápida */}
        {isConfigured && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Importação Rápida</h2>
            <p className="text-gray-600 mb-4">
              Clique no botão abaixo para buscar e importar automaticamente os posts de hoje do Instagram.
            </p>
            <button
              onClick={runAutoImport}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Executar Importação Agora
                </>
              )}
            </button>
          </div>
        )}

        {/* Últimas Importações */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Últimas Importações</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {logs.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Nenhuma importação realizada ainda
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-4 flex items-center gap-4">
                  {log.instagramImageUrl ? (
                    <img
                      src={log.instagramImageUrl}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Instagram className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {log.generatedTitle || 'Sem título'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    {log.status === 'published' ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Publicado
                      </span>
                    ) : log.status === 'error' ? (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        Erro
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        Pendente
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {logs.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <Link
                href="/painel/instagram/historico"
                className="text-sm text-blue-600 hover:underline"
              >
                Ver todo o histórico →
              </Link>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
