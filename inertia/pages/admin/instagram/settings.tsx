import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import {
  Instagram,
  ArrowLeft,
  Save,
  Key,
  Globe,
  Bot,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface Props {
  settings: {
    id: number;
    instagramProfileUrl: string | null;
    instagramSessionid: string | null;
    instagramUseragent: string | null;
    rapidapiKey: string | null;
    aiProvider: "openai" | "claude" | "gemini";
    aiApiKey: string | null;
    aiModel: string;
    aiPrompt: string | null;
    defaultCategoryId: number | null;
    defaultStatus: "draft" | "published";
    downloadImages: boolean;
    preventDuplicates: boolean;
    autoImportEnabled: boolean;
    autoImportInterval: string;
    autoImportLimit: number;
    cronTime: string;
    importOnlyToday: boolean;
  };
  categories: Array<{ id: number; name: string }>;
  defaultPrompt: string;
}

export default function InstagramSettings({ settings, categories, defaultPrompt }: Props) {
  const [testingAi, setTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  const { data, setData, post, processing } = useForm({
    instagram_profile_url: settings.instagramProfileUrl || "",
    instagram_sessionid: settings.instagramSessionid || "",
    instagram_useragent: settings.instagramUseragent || "",
    rapidapi_key: settings.rapidapiKey || "",
    ai_provider: settings.aiProvider,
    ai_api_key: settings.aiApiKey || "",
    ai_model: settings.aiModel,
    ai_prompt: settings.aiPrompt || "",
    default_category_id: settings.defaultCategoryId || "",
    default_status: settings.defaultStatus,
    download_images: settings.downloadImages ? "on" : "",
    prevent_duplicates: settings.preventDuplicates ? "on" : "",
    auto_import_enabled: settings.autoImportEnabled ? "on" : "",
    auto_import_interval: settings.autoImportInterval,
    auto_import_limit: settings.autoImportLimit,
    cron_time: settings.cronTime,
    import_only_today: settings.importOnlyToday ? "on" : "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/painel/instagram/configuracoes");
  };

  const testAiConnection = async () => {
    setTestingAi(true);
    setAiTestResult(null);

    try {
      const response = await fetch("/painel/instagram/test-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": document.cookie
            .split("; ")
            .find((row) => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1] || "",
        },
      });

      const result = await response.json();
      setAiTestResult(result);
    } catch (error: any) {
      setAiTestResult({ success: false, error: error.message });
    } finally {
      setTestingAi(false);
    }
  };

  const aiModels = {
    openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    claude: ["claude-sonnet-4-20250514", "claude-3-5-sonnet-20241022", "claude-3-haiku-20240307"],
    gemini: ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"],
  };

  return (
    <>
      <Head title="Configurações Instagram - Painel" />

      <div className="p-6" style={{ fontFamily: "Verdana, sans-serif" }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/painel/instagram"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <Instagram className="w-8 h-8 text-pink-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
              <p className="text-gray-600 text-sm">Configure a integração com Instagram e IA</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Instagram Config */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-pink-500" />
              <h2 className="text-lg font-semibold text-gray-800">Instagram</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Perfil *
                </label>
                <input
                  type="url"
                  value={data.instagram_profile_url}
                  onChange={(e) => setData("instagram_profile_url", e.target.value)}
                  placeholder="https://instagram.com/camaradesume"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RapidAPI Key (recomendado)
                </label>
                <input
                  type="password"
                  value={data.rapidapi_key}
                  onChange={(e) => setData("rapidapi_key", e.target.value)}
                  placeholder="Sua chave RapidAPI"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  API: instagram-public-bulk-scraper
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session ID (fallback)
                </label>
                <input
                  type="password"
                  value={data.instagram_sessionid}
                  onChange={(e) => setData("instagram_sessionid", e.target.value)}
                  placeholder="Cookie sessionid do Instagram"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Agent
                </label>
                <input
                  type="text"
                  value={data.instagram_useragent}
                  onChange={(e) => setData("instagram_useragent", e.target.value)}
                  placeholder="User-Agent do navegador"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* AI Config */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-800">Inteligência Artificial</h2>
              </div>

              <button
                type="button"
                onClick={testAiConnection}
                disabled={testingAi || !data.ai_api_key}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition disabled:opacity-50"
              >
                {testingAi ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : aiTestResult?.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : aiTestResult?.error ? (
                  <XCircle className="w-4 h-4 text-red-600" />
                ) : (
                  <Key className="w-4 h-4" />
                )}
                Testar Conexão
              </button>
            </div>

            {aiTestResult && (
              <div
                className={`mb-4 p-3 rounded-lg ${
                  aiTestResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}
              >
                {aiTestResult.success ? "✅ Conexão OK!" : `❌ ${aiTestResult.error}`}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provedor *
                </label>
                <select
                  value={data.ai_provider}
                  onChange={(e) => {
                    setData("ai_provider", e.target.value as any);
                    setData("ai_model", aiModels[e.target.value as keyof typeof aiModels][0]);
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="claude">Anthropic Claude</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key *
                </label>
                <input
                  type="password"
                  value={data.ai_api_key}
                  onChange={(e) => setData("ai_api_key", e.target.value)}
                  placeholder="Sua API Key"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo
                </label>
                <select
                  value={data.ai_model}
                  onChange={(e) => setData("ai_model", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  {aiModels[data.ai_provider]?.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prompt Personalizado
              </label>
              <textarea
                value={data.ai_prompt}
                onChange={(e) => setData("ai_prompt", e.target.value)}
                placeholder={defaultPrompt}
                rows={6}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {"{CAPTION}"} onde deseja inserir a legenda do Instagram
              </p>
            </div>
          </div>

          {/* Publishing Config */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Publicação</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria Padrão
                </label>
                <select
                  value={data.default_category_id}
                  onChange={(e) => setData("default_category_id", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sem categoria</option>
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
                  onChange={(e) => setData("default_status", e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.download_images === "on"}
                  onChange={(e) => setData("download_images", e.target.checked ? "on" : "")}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Baixar imagens</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.prevent_duplicates === "on"}
                  onChange={(e) => setData("prevent_duplicates", e.target.checked ? "on" : "")}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Evitar duplicados</span>
              </label>
            </div>
          </div>

          {/* Auto Import Config */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold text-gray-800">Importação Automática</h2>
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.auto_import_enabled === "on"}
                  onChange={(e) => setData("auto_import_enabled", e.target.checked ? "on" : "")}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Ativar importação automática
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Intervalo
                </label>
                <select
                  value={data.auto_import_interval}
                  onChange={(e) => setData("auto_import_interval", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="30min">A cada 30 minutos</option>
                  <option value="1hour">A cada hora</option>
                  <option value="6hours">A cada 6 horas</option>
                  <option value="12hours">A cada 12 horas</option>
                  <option value="daily">Uma vez ao dia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário (diário)
                </label>
                <input
                  type="time"
                  value={data.cron_time}
                  onChange={(e) => setData("cron_time", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
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
                  onChange={(e) => setData("auto_import_limit", Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={data.import_only_today === "on"}
                    onChange={(e) => setData("import_only_today", e.target.checked ? "on" : "")}
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Apenas posts de hoje</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={processing}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
            >
              {processing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
