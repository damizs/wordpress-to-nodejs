import { Link, router } from "@inertiajs/react";
import { useState } from "react";
import { 
  Instagram, Settings, History, RefreshCw, Play, Check, X, 
  AlertCircle, Image, Calendar, ExternalLink, Loader2, Wand2
} from "lucide-react";

interface InstagramPost {
  id: string;
  shortcode: string;
  thumbnailSrc: string;
  displayUrl: string;
  caption: string;
  takenAtTimestamp: number;
  isVideo: boolean;
  alreadyImported?: boolean;
}

interface ImportLog {
  id: number;
  instagramId: string;
  instagramUrl: string;
  generatedTitle: string;
  importStatus: string;
  createdAt: string;
  news?: { id: number; title: string };
}

interface Props {
  settings: any;
  imports: ImportLog[];
  categories: any[];
  stats: {
    total: number;
    published: number;
    failed: number;
    today: number;
  };
}

export default function InstagramIndex({ settings, imports, categories, stats }: Props) {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<Record<string, { title: string; content: string }>>({});

  // Buscar posts do Instagram
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/painel/instagram/fetch-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' }
      });
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
        if (data.error) setError(data.error);
      } else {
        setError(data.message);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Processar legenda com IA
  const processCaption = async (post: InstagramPost) => {
    setProcessing(post.id);
    try {
      const response = await fetch('/painel/instagram/process-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
        body: JSON.stringify({ caption: post.caption })
      });
      const data = await response.json();
      if (data.success) {
        setGeneratedContent(prev => ({
          ...prev,
          [post.id]: { title: data.title, content: data.content }
        }));
      } else {
        alert('Erro: ' + data.message);
      }
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
    setProcessing(null);
  };

  // Publicar post
  const publishPost = async (post: InstagramPost) => {
    const generated = generatedContent[post.id];
    if (!generated) {
      alert('Primeiro processe a legenda com a IA');
      return;
    }

    setProcessing(post.id);
    try {
      const response = await fetch('/painel/instagram/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
        body: JSON.stringify({
          instagram_id: post.id,
          instagram_url: `https://instagram.com/p/${post.shortcode}`,
          caption: post.caption,
          image_url: post.displayUrl,
          timestamp: post.takenAtTimestamp,
          title: generated.title,
          content: generated.content
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Notícia publicada com sucesso!');
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, alreadyImported: true } : p));
        router.reload();
      } else {
        alert('Erro: ' + data.message);
      }
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
    setProcessing(null);
  };

  // Executar importação automática
  const runAutoImport = async () => {
    if (!confirm('Isso importará automaticamente os posts de hoje. Continuar?')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/painel/instagram/auto-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' }
      });
      const data = await response.json();
      alert(data.message);
      if (data.success) router.reload();
    } catch (err: any) {
      alert('Erro: ' + err.message);
    }
    setLoading(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Instagram className="w-8 h-8 text-pink-500" />
          <div>
            <h1 className="text-2xl font-bold">Instagram Auto Import</h1>
            <p className="text-gray-500 text-sm">Importe notícias automaticamente do Instagram</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/painel/instagram/configuracoes" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações
          </Link>
          <Link href="/painel/instagram/historico" className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2">
            <History className="w-4 h-4" />
            Histórico
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-gray-500 text-sm">Total Importados</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-gray-500 text-sm">Publicados</p>
          <p className="text-2xl font-bold text-green-600">{stats.published}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-gray-500 text-sm">Falhas</p>
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <p className="text-gray-500 text-sm">Importados Hoje</p>
          <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-xl p-4 border mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Buscar Posts do Instagram</h2>
            <p className="text-sm text-gray-500">
              Perfil: {settings.instagramProfileUrl || 'Não configurado'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchPosts}
              disabled={loading || !settings.instagramProfileUrl}
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Buscar Posts
            </button>
            <button
              onClick={runAutoImport}
              disabled={loading || !settings.aiApiKey}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              Importar Automático
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            {error}
          </div>
        )}
      </div>

      {/* Posts Grid */}
      {posts.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden mb-6">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold">Posts Encontrados ({posts.length})</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {posts.map((post) => (
              <div key={post.id} className={`border rounded-xl overflow-hidden ${post.alreadyImported ? 'opacity-50' : ''}`}>
                <div className="relative aspect-square">
                  <img src={post.thumbnailSrc} alt="" className="w-full h-full object-cover" />
                  {post.alreadyImported && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">Já importado</span>
                    </div>
                  )}
                  {post.isVideo && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      Vídeo
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(post.takenAtTimestamp)}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                    {post.caption || 'Sem legenda'}
                  </p>
                  
                  {generatedContent[post.id] && (
                    <div className="mb-3 p-2 bg-green-50 rounded border border-green-200">
                      <p className="text-xs font-medium text-green-800">{generatedContent[post.id].title}</p>
                    </div>
                  )}

                  {!post.alreadyImported && (
                    <div className="flex gap-2">
                      {!generatedContent[post.id] ? (
                        <button
                          onClick={() => processCaption(post)}
                          disabled={processing === post.id}
                          className="flex-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {processing === post.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                          Gerar com IA
                        </button>
                      ) : (
                        <button
                          onClick={() => publishPost(post)}
                          disabled={processing === post.id}
                          className="flex-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {processing === post.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          Publicar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Imports */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-semibold">Últimas Importações</h2>
        </div>
        <div className="divide-y">
          {imports.length === 0 ? (
            <p className="p-4 text-gray-500 text-center">Nenhuma importação realizada ainda</p>
          ) : (
            imports.slice(0, 10).map((imp) => (
              <div key={imp.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{imp.generatedTitle}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(imp.createdAt).toLocaleDateString('pt-BR')} • 
                    <span className={`ml-2 ${imp.importStatus === 'published' ? 'text-green-600' : 'text-red-600'}`}>
                      {imp.importStatus === 'published' ? 'Publicado' : 'Falhou'}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <a href={imp.instagramUrl} target="_blank" rel="noopener" className="p-2 hover:bg-gray-100 rounded">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
