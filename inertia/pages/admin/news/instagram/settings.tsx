import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Instagram, Save, TestTube, ArrowLeft, Key, Bot, Clock, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface Props {
  settings: Record<string, string | null>
  categories: { id: number; name: string }[]
  aiProviders: { value: string; label: string }[]
  aiModels: Record<string, { value: string; label: string }[]>
  defaultPrompt: string
}

export default function InstagramSettings({ settings, categories, aiProviders, aiModels, defaultPrompt }: Props) {
  const [testingAi, setTestingAi] = useState(false)
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const { data, setData, post, processing } = useForm({
    instagram_profile_url: settings.instagram_profile_url || '',
    instagram_sessionid: settings.instagram_sessionid || '',
    instagram_useragent: settings.instagram_useragent || '',
    rapidapi_key: settings.rapidapi_key || '',
    ai_provider: settings.ai_provider || 'gemini',
    ai_api_key: settings.ai_api_key || '',
    ai_model: settings.ai_model || 'gemini-2.0-flash',
    ai_prompt: settings.ai_prompt || defaultPrompt || '',
    default_category: settings.default_category || '',
    default_status: settings.default_status || 'draft',
    posts_fetch_count: settings.posts_fetch_count || '50',
    auto_import_enabled: settings.auto_import_enabled === '1' || settings.auto_import_enabled === 'true',
    auto_import_limit: settings.auto_import_limit || '5',
    cron_mode: settings.cron_mode || 'daily',
    cron_hour: settings.cron_hour || '19',
    cron_minute: settings.cron_minute || '0',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/painel/noticias/instagram/configuracoes')
  }

  const testAiConnection = async () => {
    setTestingAi(true)
    setAiTestResult(null)
    try {
      const response = await fetch('/painel/noticias/instagram/test-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || '',
        },
      })
      const result = await response.json()
      setAiTestResult({ success: result.success, message: result.message || result.error })
    } catch (error: any) {
      setAiTestResult({ success: false, message: error.message })
    } finally {
      setTestingAi(false)
    }
  }

  const currentModels = aiModels[data.ai_provider] || []

  return (
    <AdminLayout>
      <Head title="Configurações - Instagram" />
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <a href="/painel/noticias/instagram" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></a>
          <Instagram className="w-8 h-8 text-pink-500" />
          <h1 className="text-2xl font-bold">Configurações do Instagram</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Perfil */}
          <div className="p-6 bg-white rounded-lg border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Instagram className="w-5 h-5 text-pink-500" />Perfil do Instagram</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL do Perfil</label>
                <input type="url" value={data.instagram_profile_url} onChange={e => setData('instagram_profile_url', e.target.value)} placeholder="https://www.instagram.com/seu_perfil" className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
          </div>

          {/* RapidAPI */}
          <div className="p-6 bg-white rounded-lg border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-blue-500" />🚀 RapidAPI (Recomendado)</h2>
            <p className="text-sm text-gray-600 mb-4">Método mais confiável para buscar posts. Funciona mesmo com IP bloqueado.</p>
            <details className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <summary className="cursor-pointer font-medium text-blue-700">📖 Como obter a API Key</summary>
              <ol className="mt-2 ml-4 text-sm space-y-1 list-decimal">
                <li>Acesse <a href="https://rapidapi.com/social-api1-instagram/api/instagram-public-bulk-scraper" target="_blank" className="text-blue-600 underline">RapidAPI Instagram Scraper</a></li>
                <li>Crie conta gratuita ou faça login</li>
                <li>Clique em "Subscribe to Test" → plano Basic (gratuito)</li>
                <li>Copie a X-RapidAPI-Key</li>
              </ol>
            </details>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RapidAPI Key</label>
              <input type="password" value={data.rapidapi_key} onChange={e => setData('rapidapi_key', e.target.value)} placeholder="Cole sua API Key" className="w-full px-4 py-2 border rounded-lg" />
            </div>
          </div>

          {/* Cookie (Alternativo) */}
          <div className="p-6 bg-white rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Autenticação Instagram (Alternativo)</h2>
            <details className="mb-4 p-4 bg-gray-50 rounded-lg">
              <summary className="cursor-pointer font-medium">📖 Como obter o sessionid</summary>
              <ol className="mt-2 ml-4 text-sm space-y-1 list-decimal">
                <li>Abra Instagram no navegador e faça login</li>
                <li>Pressione F12 → Application → Cookies → instagram.com</li>
                <li>Copie o valor de "sessionid"</li>
              </ol>
              <p className="mt-2 text-sm text-amber-600">⚠️ O cookie expira a cada ~90 dias</p>
            </details>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session ID</label>
                <input type="password" value={data.instagram_sessionid} onChange={e => setData('instagram_sessionid', e.target.value)} placeholder="Cole seu sessionid" className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User-Agent</label>
                <input type="text" value={data.instagram_useragent} onChange={e => setData('instagram_useragent', e.target.value)} placeholder="Mozilla/5.0..." className="w-full px-4 py-2 border rounded-lg text-sm" />
                <p className="text-xs text-gray-500 mt-1">Mesmo do navegador onde pegou o sessionid. Console → navigator.userAgent</p>
              </div>
            </div>
          </div>

          {/* IA */}
          <div className="p-6 bg-white rounded-lg border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Bot className="w-5 h-5 text-purple-500" />Configuração de IA</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provedor de IA</label>
                <select value={data.ai_provider} onChange={e => { setData('ai_provider', e.target.value); setData('ai_model', aiModels[e.target.value]?.[0]?.value || '') }} className="w-full px-4 py-2 border rounded-lg">
                  {aiProviders.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                <select value={data.ai_model} onChange={e => setData('ai_model', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                  {currentModels.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <div className="flex gap-2">
                <input type="password" value={data.ai_api_key} onChange={e => setData('ai_api_key', e.target.value)} placeholder="Cole sua API Key" className="flex-1 px-4 py-2 border rounded-lg" />
                <button type="button" onClick={testAiConnection} disabled={testingAi} className="flex items-center gap-2 px-4 py-2 text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 disabled:opacity-50">
                  {testingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}Testar
                </button>
              </div>
              {aiTestResult && <p className={`text-sm mt-2 ${aiTestResult.success ? 'text-green-600' : 'text-red-600'}`}>{aiTestResult.success ? '✅' : '❌'} {aiTestResult.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Personalizado (opcional)</label>
              <textarea value={data.ai_prompt} onChange={e => setData('ai_prompt', e.target.value)} rows={8} placeholder="Use {CAPTION} para inserir a legenda do Instagram." className="w-full px-4 py-2 border rounded-lg text-sm font-mono" />
            </div>
          </div>

          {/* Publicação */}
          <div className="p-6 bg-white rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Publicação</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria Padrão</label>
                <select value={data.default_category} onChange={e => setData('default_category', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                  <option value="">Nenhuma</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Padrão</label>
                <select value={data.default_status} onChange={e => setData('default_status', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posts por Busca</label>
                <input type="number" min="12" max="100" value={data.posts_fetch_count} onChange={e => setData('posts_fetch_count', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
          </div>

          {/* Importação Automática */}
          <div className="p-6 bg-white rounded-lg border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-green-500" />🤖 Importação Automática</h2>
            <p className="text-sm text-gray-600 mb-4">Importa automaticamente os posts do dia no horário configurado (fuso de Brasília).</p>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.auto_import_enabled} onChange={e => setData('auto_import_enabled', e.target.checked)} className="w-4 h-4 rounded text-green-600" />
                <span className="font-medium">Habilitar importação automática</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modo</label>
                  <select value={data.cron_mode} onChange={e => setData('cron_mode', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                    <option value="daily">📅 Diário (Produção)</option>
                    <option value="test">🧪 Teste (a cada 2 min)</option>
                  </select>
                  {data.cron_mode === 'test' && <p className="text-xs text-red-600 mt-1">⚠️ Use apenas para testes!</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                  <div className="flex gap-1">
                    <select value={data.cron_hour} onChange={e => setData('cron_hour', e.target.value)} className="flex-1 px-2 py-2 border rounded-lg">
                      {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}h</option>)}
                    </select>
                    <select value={data.cron_minute} onChange={e => setData('cron_minute', e.target.value)} className="flex-1 px-2 py-2 border rounded-lg">
                      {[0, 15, 30, 45].map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Limite por Execução</label>
                  <input type="number" min="1" max="20" value={data.auto_import_limit} onChange={e => setData('auto_import_limit', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={processing} className="flex items-center gap-2 px-6 py-3 text-white bg-pink-600 rounded-lg hover:bg-pink-700 disabled:opacity-50">
            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}Salvar Configurações
          </button>
        </form>
      </div>
    </AdminLayout>
  )
}
