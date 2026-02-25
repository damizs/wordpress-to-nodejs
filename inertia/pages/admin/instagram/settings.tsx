import { Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import { 
  Instagram, ArrowLeft, Save, TestTube, CheckCircle, XCircle, Loader2,
  Key, Globe, Bot, Clock, Settings2
} from "lucide-react";

interface Props {
  settings: any;
  categories: any[];
  defaultPrompt: string;
}

export default function InstagramSettings({ settings, categories, defaultPrompt }: Props) {
  const [testingAi, setTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const { data, setData, post, processing } = useForm({
    // Instagram
    instagram_profile_url: settings.instagramProfileUrl || '',
    rapidapi_key: settings.rapidapiKey || '',
    instagram_sessionid: settings.instagramSessionid || '',
    instagram_useragent: settings.instagramUseragent || '',
    // IA
    ai_provider: settings.aiProvider || 'gemini',
    ai_api_key: settings.aiApiKey || '',
    ai_model: settings.aiModel || 'gemini-2.0-flash',
    ai_prompt: settings.aiPrompt || '',
    // Importação
    auto_import_enabled: settings.autoImportEnabled || false,
    cron_mode: settings.cronMode || 'daily',
    cron_hour: settings.cronHour || 19,
    cron_minute: settings.cronMinute || 0,
    auto_import_limit: settings.autoImportLimit || 5,
    default_status: settings.defaultStatus || 'published',
    default_category_id: settings.defaultCategoryId || '',
    download_images: settings.downloadImages ?? true,
    prevent_duplicates: settings.preventDuplicates ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/painel/instagram/configuracoes');
  };

  const testAiConnection = async () => {
    setTestingAi(true);
    setAiTestResult(null);
    try {
      const response = await fetch('/painel/instagram/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' }
      });
      const result = await response.json();
      setAiTestResult(result);
    } catch (err: any) {
      setAiTestResult({ success: false, message: err.message });
    }
    setTestingAi(false);
  };

  const aiModels: Record<string, string[]> = {
    gemini: ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    claude: ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229']
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/painel/instagram" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <Instagram className="w-8 h-8 text-pink-500" />
          <div>
            <h1 className="text-2xl font-bold">Configurações do Instagram</h1>
            <p className="text-gray-500 text-sm">Configure a importação automática</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Configurações do Instagram */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-pink-500" />
            Configurações do Instagram
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">URL do Perfil</label>
              <input
                type="url"
                value={data.instagram_profile_url}
                onChange={e => setData('instagram_profile_url', e.target.value)}
                placeholder="https://instagram.com/camaradesume"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <p className="text-xs text-gray-500 mt-1">URL do perfil público do Instagram</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">RapidAPI Key (Recomendado)</label>
              <input
                type="password"
                value={data.rapidapi_key}
                onChange={e => setData('rapidapi_key', e.target.value)}
                placeholder="Sua chave da RapidAPI"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Obtenha em <a href="https://rapidapi.com/social-api1-instagram/api/instagram-public-bulk-scraper" target="_blank" className="text-pink-500 hover:underline">RapidAPI</a>
              </p>
            </div>
          </div>
        </div>

        {/* Configurações de IA */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-500" />
            Configurações de IA
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Provedor</label>
                <select
                  value={data.ai_provider}
                  onChange={e => setData('ai_provider', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI GPT</option>
                  <option value="claude">Anthropic Claude</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Modelo</label>
                <select
                  value={data.ai_model}
                  onChange={e => setData('ai_model', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {aiModels[data.ai_provider]?.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">API Key</label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={data.ai_api_key}
                  onChange={e => setData('ai_api_key', e.target.value)}
                  placeholder="Sua chave de API"
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={testAiConnection}
                  disabled={testingAi || !data.ai_api_key}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  {testingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <TestTube className="w-4 h-4" />}
                  Testar
                </button>
              </div>
              {aiTestResult && (
                <div className={`mt-2 p-2 rounded text-sm flex items-center gap-2 ${aiTestResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {aiTestResult.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {aiTestResult.message}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Prompt Personalizado (Opcional)</label>
              <textarea
                value={data.ai_prompt}
                onChange={e => setData('ai_prompt', e.target.value)}
                rows={6}
                placeholder={defaultPrompt}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Use {'{CAPTION}'} para inserir a legenda. Deixe vazio para usar o prompt padrão.</p>
            </div>
          </div>
        </div>

        {/* Configurações de Importação */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-green-500" />
            Configurações de Importação
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Importação Automática</p>
                <p className="text-sm text-gray-500">Importar posts automaticamente no horário configurado</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.auto_import_enabled}
                  onChange={e => setData('auto_import_enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Modo</label>
                <select
                  value={data.cron_mode}
                  onChange={e => setData('cron_mode', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="daily">Diário</option>
                  <option value="test">Teste (2 min)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hora</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={data.cron_hour}
                  onChange={e => setData('cron_hour', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Minuto</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={data.cron_minute}
                  onChange={e => setData('cron_minute', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Limite por execução</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={data.auto_import_limit}
                  onChange={e => setData('auto_import_limit', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status padrão</label>
                <select
                  value={data.default_status}
                  onChange={e => setData('default_status', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="published">Publicado</option>
                  <option value="draft">Rascunho</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categoria padrão</label>
                <select
                  value={data.default_category_id}
                  onChange={e => setData('default_category_id', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Nenhuma</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.download_images}
                  onChange={e => setData('download_images', e.target.checked)}
                  className="w-4 h-4 text-green-500 rounded"
                />
                <span className="text-sm">Baixar imagens para o servidor</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.prevent_duplicates}
                  onChange={e => setData('prevent_duplicates', e.target.checked)}
                  className="w-4 h-4 text-green-500 rounded"
                />
                <span className="text-sm">Prevenir duplicatas</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={processing}
            className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
}
