import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import {
  Instagram,
  Settings,
  History,
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Image,
  Sparkles,
} from "lucide-react";

interface Props {
  settings: {
    instagramProfileUrl: string | null;
    aiProvider: string;
    aiApiKey: string | null;
    autoImportEnabled: boolean;
    lastImportAt: string | null;
    lastImportCount: number;
  };
  categories: Array<{ id: number; name: string }>;
  recentImports: Array<{
    id: number;
    instagramId: string;
    generatedTitle: string | null;
    newsId: number | null;
    importedAt: string;
    errorMessage: string | null;
  }>;
  stats: {
    totalImported: number;
    importedToday: number;
    errors: number;
  };
}

export default function InstagramDashboard({ settings, recentImports, stats }: Props) {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const isConfigured = settings.instagramProfileUrl && settings.aiApiKey;

  const fetchPosts = async () => {
    setLoading(true);
    setFetchError(null);
    setPosts([]);

    try {
      const response = await fetch("/painel/instagram/fetch-posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": document.cookie
            .split("; ")
            .find((row) => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1] || "",
        },
      });

      const data = await response.json();

      if (data.error) {
        setFetchError(data.error);
      } else {
        setPosts(data.posts || []);
      }
    } catch (error: any) {
      setFetchError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const runImport = async () => {
    setImporting(true);
    setImportResult(null);

    try {
      const response = await fetch("/painel/instagram/auto-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": document.cookie
            .split("; ")
            .find((row) => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1] || "",
        },
      });

      const data = await response.json();
      setImportResult(data);

      if (data.imported > 0) {
        router.reload();
      }
    } catch (error: any) {
      setImportResult({ success: false, errors: [error.message] });
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <Head title="Instagram - Painel" />

      <div className="p-6" style={{ fontFamily: "Verdana, sans-serif" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Instagram className="w-8 h-8 text-pink-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Instagram Auto Publisher</h1>
              <p className="text-gray-600 text-sm">Importe posts do Instagram como notícias</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/painel/instagram/configuracoes"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <Settings className="w-4 h-4" />
              Configurações
            </Link>
            <Link
              href="/painel/instagram/historico"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <History className="w-4 h-4" />
              Histórico
            </Link>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalImported}</p>
                <p className="text-sm text-gray-500">Total importado</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.importedToday}</p>
                <p className="text-sm text-gray-500">Importados hoje</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.errors}</p>
                <p className="text-sm text-gray-500">Erros</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${settings.autoImportEnabled ? "bg-green-100" : "bg-gray-100"}`}>
                <Sparkles className={`w-5 h-5 ${settings.autoImportEnabled ? "text-green-600" : "text-gray-400"}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {settings.autoImportEnabled ? "Automático ON" : "Automático OFF"}
                </p>
                <p className="text-xs text-gray-500">
                  {settings.lastImportAt
                    ? `Último: ${new Date(settings.lastImportAt).toLocaleDateString("pt-BR")}`
                    : "Nunca executado"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Warning */}
        {!isConfigured && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800">Configuração necessária</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Configure a URL do perfil do Instagram e a API Key da IA para começar a importar.
                </p>
                <Link
                  href="/painel/instagram/configuracoes"
                  className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900"
                >
                  Ir para configurações →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        {isConfigured && (
          <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Ações</h3>
                <p className="text-sm text-gray-500">
                  Perfil: {settings.instagramProfileUrl}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={fetchPosts}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Image className="w-4 h-4" />
                  )}
                  Buscar Posts
                </button>

                <button
                  onClick={runImport}
                  disabled={importing}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50"
                >
                  {importing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Importar Agora
                </button>
              </div>
            </div>

            {/* Import Result */}
            {importResult && (
              <div
                className={`mt-4 p-3 rounded-lg ${
                  importResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}
              >
                {importResult.success ? (
                  <p>✅ {importResult.imported} post(s) importado(s) com sucesso!</p>
                ) : (
                  <p>❌ Erro: {importResult.errors?.join(", ")}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Fetch Error */}
        {fetchError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800">❌ {fetchError}</p>
          </div>
        )}

        {/* Posts Preview */}
        {posts.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">
              Posts encontrados ({posts.length})
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {posts.map((post: any) => (
                <div key={post.id} className="relative group">
                  <img
                    src={post.thumbnailSrc}
                    alt={post.caption?.substring(0, 50)}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg flex items-center justify-center">
                    <p className="text-white text-xs p-2 text-center line-clamp-3">
                      {post.caption?.substring(0, 100)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Imports */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800">Últimas importações</h3>
          </div>

          {recentImports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhuma importação ainda
            </div>
          ) : (
            <div className="divide-y">
              {recentImports.map((imp) => (
                <div key={imp.id} className="p-4 flex items-center gap-4">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      imp.newsId ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {imp.generatedTitle || imp.instagramId}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(imp.importedAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  {imp.errorMessage && (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      {imp.errorMessage.substring(0, 50)}
                    </span>
                  )}
                  {imp.newsId && (
                    <Link
                      href={`/painel/noticias/${imp.newsId}/editar`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Ver notícia
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
