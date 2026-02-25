import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Instagram, ArrowLeft, Save, TestTube, CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'

interface Props {
  settings: Record<string, string | null>
  categories: { id: number; name: string }[]
  aiProviders: { value: string; label: string }[]
  aiModels: Record<string, { value: string; label: string }[]>
}

export default function InstagramSettings({ settings, categories, aiProviders, aiModels }: Props) {
  const [testingAI, setTestingAI] = useState(false)
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const { data, setData, post, processing } = useForm({
    instagram_profile_url: settings.instagram_profile_url || '',
    instagram_sessionid: settings.instagram_sessionid || '',
    instagram_useragent: settings.instagram_useragent || '',
    rapidapi_key: settings.rapidapi_key || '',
    ai_provider: settings.ai_provider || 'gemini',
    ai_api_key: settings.ai_api_key || '',
    ai_model: settings.ai_model || 'gemini-2.0-flash',
    ai_prompt: settings.ai_prompt || '',
    default_category: settings.default_category || '',
    default_status: settings.default_status || 'published',
    auto_import_enabled: settings.auto_import_enabled || '0',
    auto_import_limit: settings.auto_import_limit || '5',
    cron_mode: settings.cron_mode || 'daily',
    cron_hour: settings.cron_hour || '19',
    cron_minute: settings.cron_minute || '0',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/painel/instagram/configuracoes')
  }

  const testAIConnection = async () => {
    setTestingAI(true)
    setAiTestResult(null)

    try {
      const response = await fetch('/painel/instagram/test-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1] || '',
        },
      })

      const result = await response.json()
      setAiTestResult({
        success: result.success,
        message: result.message || (result.success ? 'Conexão bem sucedida!' : result.error),
      })
    } catch (error: any) {
      setAiTestResult({ success: false, message: error.message })
    } finally {
      setTestingAI(false)
    }
  }

  const currentModels = aiModels[data.ai_provider] || []

  return (
    <AdminLayout>
      <Head title="Configurações - Automação Instagram" />

      <div className="max-w-4xl mx-auto space-y-6">
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
              <h1 className="text-xl font-bold text-gray-900">Configurações</h1>
              <p className="text-sm text-gray-500">Automação Instagram</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Instagram */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🔗 Perfil do Instagram</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Perfil *
                </label>
                <input
                  type="url"
                  value={data.instagram_profile_url}
                  onChange={(e) => setData('instagram_profile_url', e.target.value)}
                  placeholder="https://instagram.com/camaradesume"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  URL completa do perfil público do Instagram
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RapidAPI Key (Recomendado)
                </label>
                <input
                  type="password"
                  value={data.rapidapi_key}
                  onChange={(e) => setData('rapidapi_key', e.target.value)}
                  placeholder="Sua chave RapidAPI"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Obtenha em: rapidapi.com/social-api1-instagram/api/instagram-public-bulk-scraper
                </p>
              </div>

              <details className="text-sm">
                <summary className="cursor-pointer text-gray-600 hover:text-gray-900">
                  Opções avançadas (Cookie de sessão)
                </summary>
                <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Session ID (Cookie)
                    </label>
                    <input
                      type="password"
                      value={data.instagram_sessionid}
                      onChange={(e) => setData('instagram_sessionid', e.target.value)}
                      placeholder="sessionid do Instagram"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Agent
                    </label>
                    <input
                      type="text"
                      value={data.instagram_useragent}
                      onChange={(e) => setData('instagram_useragent', e.target.value)}
                      placeholder="User-Agent do navegador"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* IA */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🤖 Inteligência Artificial</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provedor *
                  </label>
                  <select
                    value={data.ai_provider}
                    onChange={(e) => {
                      setData('ai_provider', e.target.value)
                      // Reset model when provider changes
                      const models = aiModels[e.target.value]
                      if (models && models.length > 0) {
                        setData('ai_model', models[0].value)
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {aiProviders.map((provider) => (
                      <option key={provider.value} value={provider.value}>
                        {provider.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo
                  </label>
                  <select
                    value={data.ai_model}
                    onChange={(e) => setData('ai_model', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {currentModels.map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key *
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={data.ai_api_key}
                    onChange={(e) => setData('ai_api_key', e.target.value)}
                    placeholder="Sua chave de API"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={testAIConnection}
                    disabled={testingAI || !data.ai_api_key}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    <TestTube className="w-4 h-4" />
                    {testingAI ? 'Testando...' : 'Testar'}
                  </button>
                </div>
                {aiTestResult && (
                  <div
                    className={`mt-2 flex items-center gap-2 text-sm ${
                      aiTestResult.success ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {aiTestResult.success ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {aiTestResult.message}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prompt Personalizado
                </label>
                <textarea
                  value={data.ai_prompt}
                  onChange={(e) => setData('ai_prompt', e.target.value)}
                  rows={6}
                  placeholder="Deixe vazio para usar o prompt padrão. Use {CAPTION} onde a legenda deve ser inserida."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Publicação */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📰 Publicação</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria Padrão
                </label>
                <select
                  value={data.default_category}
                  onChange={(e) => setData('default_category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Padrão
                </label>
                <select
                  value={data.default_status}
                  onChange={(e) => setData('default_status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="published">Publicado</option>
                  <option value="draft">Rascunho</option>
                </select>
              </div>
            </div>
          </div>

          {/* Automação */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">⏰ Importação Automática</h2>

            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={data.auto_import_enabled === '1' || data.auto_import_enabled === 'true'}
                  onChange={(e) => setData('auto_import_enabled', e.target.checked ? '1' : '0')}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-gray-700">Habilitar importação automática</span>
              </label>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modo
                  </label>
                  <select
                    value={data.cron_mode}
                    onChange={(e) => setData('cron_mode', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="daily">Diário</option>
                    <option value="test">Teste (2 min)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário (Hora)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={data.cron_hour}
                    onChange={(e) => setData('cron_hour', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário (Minuto)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={data.cron_minute}
                    onChange={(e) => setData('cron_minute', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Limite por execução
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={data.auto_import_limit}
                  onChange={(e) => setData('auto_import_limit', e.target.value)}
                  className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={processing}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {processing ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
