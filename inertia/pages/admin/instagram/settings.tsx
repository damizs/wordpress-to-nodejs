import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Instagram, ArrowLeft, Save, TestTube, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'

interface Props {
  settings: Record<string, string | null>
  categories: Array<{ id: number; name: string }>
  defaultPrompt: string
}

export default function InstagramSettings({ settings, categories, defaultPrompt }: Props) {
  const [testingAi, setTestingAi] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const { data, setData, post, processing } = useForm({
    instagram_profile_url: settings.instagram_profile_url || '',
    instagram_sessionid: settings.instagram_sessionid || '',
    instagram_useragent: settings.instagram_useragent || '',
    rapidapi_key: settings.rapidapi_key || '',
    ai_provider: settings.ai_provider || 'gemini',
    ai_api_key: settings.ai_api_key || '',
    ai_model: settings.ai_model || 'gemini-2.0-flash',
    ai_prompt: settings.ai_prompt || defaultPrompt,
    default_category: settings.default_category || '',
    default_status: settings.default_status || 'draft',
    posts_fetch_count: settings.posts_fetch_count || '50',
    auto_import_enabled: settings.auto_import_enabled === 'true' || settings.auto_import_enabled === '1',
    auto_import_limit: settings.auto_import_limit || '5',
    cron_mode: settings.cron_mode || 'daily',
    cron_hour: settings.cron_hour || '19',
    cron_minute: settings.cron_minute || '0',
  })

  const getCsrfToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/painel/instagram/configuracoes', {
      data: {
        ...data,
        auto_import_enabled: data.auto_import_enabled ? 'true' : 'false',
      },
    })
  }

  const testAiConnection = async () => {
    setTestingAi(true)
    setTestResult(null)
    try {
      const response = await fetch('/painel/instagram/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': decodeURIComponent(getCsrfToken()) },
      })
      const result = await response.json()
      setTestResult({ success: result.success, message: result.message || result.error })
    } catch (error: any) {
      setTestResult({ success: false, message: error.message })
    } finally {
      setTestingAi(false)
    }
  }

  const aiModels: Record<string, Array<{ value: string; label: string }>> = {
    gemini: [
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Recomendado)' },
      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    ],
    openai: [
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Recomendado)' },
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    ],
    claude: [
      { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Recomendado)' },
      { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    ],
  }

  return (
    <AdminLayout>
      <Head title="Configurações Instagram" />
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
              <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
              <p className="text-sm text-slate-500">Configure a automação do Instagram</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Publicação */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">📝 Publicação</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria Padrão</label>
                <select value={data.default_category} onChange={e => setData('default_category', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                  <option value="">Selecione uma categoria</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status Padrão</label>
                <select value={data.default_status} onChange={e => setData('default_status', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantidade de Posts</label>
                <input type="number" value={data.posts_fetch_count} onChange={e => setData('posts_fetch_count', e.target.value)} min="12" max="100" className="w-full px-4 py-2 border rounded-lg" />
                <p className="text-xs text-slate-500 mt-1">Quantos posts buscar (12-100)</p>
              </div>
            </div>
          </div>

          {/* Importação Automática */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">🤖 Importação Automática</h2>
            <p className="text-sm text-slate-500 mb-4">Importa automaticamente os posts do Instagram feitos NO DIA, todos os dias no horário configurado (fuso de Brasília).</p>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={data.auto_import_enabled} onChange={e => setData('auto_import_enabled', e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
                <span className="font-medium text-slate-800">Habilitar importação automática</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Modo de Execução</label>
                  <select value={data.cron_mode} onChange={e => setData('cron_mode', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                    <option value="daily">📅 Diário (Produção) - 1x por dia</option>
                    <option value="test">🧪 Teste - A cada 2 minutos</option>
                  </select>
                  {data.cron_mode === 'test' && (
                    <p className="text-xs text-red-500 mt-1">⚠️ Modo teste consome muitas requisições! Use apenas para testar.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Horário (Brasília)</label>
                  <div className="flex gap-2">
                    <select value={data.cron_hour} onChange={e => setData('cron_hour', e.target.value)} className="flex-1 px-4 py-2 border rounded-lg">
                      {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}h</option>)}
                    </select>
                    <select value={data.cron_minute} onChange={e => setData('cron_minute', e.target.value)} className="flex-1 px-4 py-2 border rounded-lg">
                      {[0, 15, 30, 45].map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Limite por Verificação</label>
                  <input type="number" value={data.auto_import_limit} onChange={e => setData('auto_import_limit', e.target.value)} min="1" max="20" className="w-full px-4 py-2 border rounded-lg" />
                  <p className="text-xs text-slate-500 mt-1">Máx. 20 posts por execução</p>
                </div>
              </div>
            </div>
          </div>

          {/* Perfil Instagram */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">📸 Perfil do Instagram</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">URL do Perfil</label>
              <input type="url" value={data.instagram_profile_url} onChange={e => setData('instagram_profile_url', e.target.value)} placeholder="https://www.instagram.com/seu_perfil" className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          {/* RapidAPI */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">🚀 RapidAPI (Recomendado)</h2>
            <p className="text-sm text-slate-500 mb-4">Método mais confiável para buscar posts do Instagram.</p>
            <details className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <summary className="cursor-pointer font-medium text-blue-800">📖 Como obter a API Key do RapidAPI</summary>
              <ol className="mt-2 ml-4 text-sm text-blue-700 list-decimal space-y-1">
                <li>Acesse <a href="https://rapidapi.com/social-api1-instagram/api/instagram-public-bulk-scraper" target="_blank" className="underline">RapidAPI Instagram Public Bulk Scraper</a></li>
                <li>Crie uma conta gratuita ou faça login</li>
                <li>Clique em "Subscribe to Test" e escolha o plano Basic (gratuito)</li>
                <li>Copie sua API Key (X-RapidAPI-Key)</li>
                <li>Cole no campo abaixo</li>
              </ol>
            </details>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RapidAPI Key</label>
              <input type="password" value={data.rapidapi_key} onChange={e => setData('rapidapi_key', e.target.value)} placeholder="Cole sua API Key aqui" className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          {/* Cookie Session (Alternativo) */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-2">🍪 Autenticação Instagram (Alternativo)</h2>
            <p className="text-sm text-slate-500 mb-4">Para buscar posts via cookie de sessão do Instagram.</p>
            <details className="mb-4 bg-slate-50 p-4 rounded-lg border">
              <summary className="cursor-pointer font-medium text-slate-800">📖 Como obter o sessionid</summary>
              <ol className="mt-2 ml-4 text-sm text-slate-600 list-decimal space-y-1">
                <li>Abra o Instagram no navegador e faça login</li>
                <li>Pressione F12 para abrir as Ferramentas do Desenvolvedor</li>
                <li>Vá para a aba Application (Chrome) ou Storage (Firefox)</li>
                <li>Clique em Cookies → instagram.com</li>
                <li>Procure por <code className="bg-slate-200 px-1 rounded">sessionid</code> e copie o valor</li>
              </ol>
              <p className="mt-2 text-xs text-red-600">⚠️ O cookie expira a cada ~90 dias.</p>
            </details>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Session ID</label>
                <input type="password" value={data.instagram_sessionid} onChange={e => setData('instagram_sessionid', e.target.value)} placeholder="Cole seu sessionid aqui" className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">User-Agent</label>
                <input type="text" value={data.instagram_useragent} onChange={e => setData('instagram_useragent', e.target.value)} placeholder="Mozilla/5.0 ..." className="w-full px-4 py-2 border rounded-lg" />
                <p className="text-xs text-slate-500 mt-1">Deve ser o mesmo do navegador onde pegou o sessionid</p>
              </div>
            </div>
          </div>

          {/* Configurações de IA */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">🧠 Inteligência Artificial</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Provedor</label>
                <div className="space-y-2">
                  {[{ value: 'gemini', label: 'Google Gemini' }, { value: 'openai', label: 'OpenAI (GPT)' }, { value: 'claude', label: 'Anthropic Claude' }].map(provider => (
                    <label key={provider.value} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="ai_provider" value={provider.value} checked={data.ai_provider === provider.value} onChange={e => setData('ai_provider', e.target.value)} className="text-purple-600 focus:ring-purple-500" />
                      <span>{provider.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">API Key</label>
                <input type="password" value={data.ai_api_key} onChange={e => setData('ai_api_key', e.target.value)} placeholder="Sua chave de API" className="w-full px-4 py-2 border rounded-lg" />
                <button type="button" onClick={testAiConnection} disabled={testingAi || !data.ai_api_key} className="mt-2 flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-slate-50 disabled:opacity-50">
                  {testingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                  Testar Conexão
                </button>
                {testResult && (
                  <div className={`mt-2 flex items-center gap-2 text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {testResult.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {testResult.message}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Modelo</label>
                <select value={data.ai_model} onChange={e => setData('ai_model', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                  {(aiModels[data.ai_provider] || []).map(model => (
                    <option key={model.value} value={model.value}>{model.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prompt Personalizado</label>
              <textarea value={data.ai_prompt} onChange={e => setData('ai_prompt', e.target.value)} rows={12} className="w-full px-4 py-2 border rounded-lg font-mono text-sm" />
              <p className="text-xs text-slate-500 mt-1">Use <code className="bg-slate-200 px-1 rounded">{'{CAPTION}'}</code> onde a legenda do Instagram deve ser inserida.</p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
