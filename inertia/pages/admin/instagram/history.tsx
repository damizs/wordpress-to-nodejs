import { Link, router } from "@inertiajs/react";
import { Instagram, ArrowLeft, Trash2, ExternalLink, CheckCircle, XCircle, Clock } from "lucide-react";

interface ImportLog {
  id: number;
  instagramId: string;
  instagramUrl: string;
  instagramCaption: string;
  generatedTitle: string;
  generatedContent: string;
  aiProvider: string;
  aiModel: string;
  aiTokensUsed: number;
  importStatus: string;
  errorMessage: string | null;
  createdAt: string;
  news?: { id: number; title: string; slug: string };
}

interface Props {
  imports: {
    data: ImportLog[];
    meta: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
    };
  };
}

export default function InstagramHistory({ imports }: Props) {
  const deleteImport = (id: number) => {
    if (confirm('Tem certeza que deseja remover este registro?')) {
      router.delete(`/painel/instagram/${id}`);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'failed':
        return 'Falhou';
      case 'processing':
        return 'Processando';
      default:
        return 'Pendente';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/painel/instagram" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <Instagram className="w-8 h-8 text-pink-500" />
          <div>
            <h1 className="text-2xl font-bold">Histórico de Importações</h1>
            <p className="text-gray-500 text-sm">Total: {imports.meta.total} registros</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Título Gerado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">IA</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Data</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {imports.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Nenhuma importação encontrada
                </td>
              </tr>
            ) : (
              imports.data.map((imp) => (
                <tr key={imp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {statusIcon(imp.importStatus)}
                      <span className="text-sm">{statusLabel(imp.importStatus)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm">{imp.generatedTitle || 'Sem título'}</p>
                    {imp.errorMessage && (
                      <p className="text-xs text-red-500 mt-1">{imp.errorMessage}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600">{imp.aiProvider}</p>
                    <p className="text-xs text-gray-400">{imp.aiModel}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600">
                      {new Date(imp.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {imp.instagramUrl && (
                        <a
                          href={imp.instagramUrl}
                          target="_blank"
                          rel="noopener"
                          className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-pink-500"
                          title="Ver no Instagram"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {imp.news && (
                        <Link
                          href={`/painel/noticias/${imp.news.id}/editar`}
                          className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-500"
                          title="Editar notícia"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                      )}
                      <button
                        onClick={() => deleteImport(imp.id)}
                        className="p-2 hover:bg-gray-100 rounded text-gray-500 hover:text-red-500"
                        title="Remover registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {imports.meta.lastPage > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: imports.meta.lastPage }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={`/painel/instagram/historico?page=${page}`}
              className={`px-4 py-2 rounded-lg ${
                page === imports.meta.currentPage
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {page}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
