import { Head, Link, router } from "@inertiajs/react";
import {
  Instagram,
  ArrowLeft,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";

interface Props {
  imports: {
    data: Array<{
      id: number;
      instagramId: string;
      instagramUrl: string;
      instagramCaption: string | null;
      instagramImageUrl: string | null;
      generatedTitle: string | null;
      generatedContent: string | null;
      aiProvider: string | null;
      aiModel: string | null;
      aiTokensUsed: number;
      newsId: number | null;
      newsStatus: string | null;
      importedAt: string;
      isAutoImport: boolean;
      errorMessage: string | null;
    }>;
    meta: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
    };
  };
  onlyErrors: boolean;
}

export default function InstagramHistory({ imports, onlyErrors }: Props) {
  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este registro?")) {
      router.delete(`/painel/instagram/${id}`);
    }
  };

  const toggleFilter = () => {
    router.get("/painel/instagram/historico", {
      only_errors: !onlyErrors ? "true" : undefined,
    });
  };

  return (
    <>
      <Head title="Histórico Instagram - Painel" />

      <div className="p-6" style={{ fontFamily: "Verdana, sans-serif" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/painel/instagram"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <Instagram className="w-8 h-8 text-pink-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Histórico de Importações</h1>
                <p className="text-gray-600 text-sm">
                  {imports.meta.total} registros encontrados
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={toggleFilter}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              onlyErrors
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Filter className="w-4 h-4" />
            {onlyErrors ? "Mostrando apenas erros" : "Filtrar por erros"}
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {imports.data.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum registro encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Título Gerado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      IA
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Importado em
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {imports.data.map((imp) => (
                    <tr key={imp.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {imp.newsId ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs">OK</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-4 h-4" />
                            <span className="text-xs">Erro</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-800 line-clamp-1">
                            {imp.generatedTitle || "—"}
                          </p>
                          {imp.errorMessage && (
                            <p className="text-xs text-red-600 mt-1 line-clamp-1">
                              {imp.errorMessage}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600">
                          <p>{imp.aiProvider || "—"}</p>
                          <p className="text-xs text-gray-400">{imp.aiModel}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600">
                          {new Date(imp.importedAt).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(imp.importedAt).toLocaleTimeString("pt-BR")}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            imp.isAutoImport
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {imp.isAutoImport ? "Auto" : "Manual"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {imp.instagramUrl && (
                            <a
                              href={imp.instagramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 hover:bg-gray-100 rounded transition"
                              title="Ver no Instagram"
                            >
                              <ExternalLink className="w-4 h-4 text-gray-500" />
                            </a>
                          )}
                          {imp.newsId && (
                            <Link
                              href={`/painel/noticias/${imp.newsId}/editar`}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Editar notícia
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(imp.id)}
                            className="p-1.5 hover:bg-red-50 rounded transition"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {imports.meta.lastPage > 1 && (
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Página {imports.meta.currentPage} de {imports.meta.lastPage}
              </p>
              <div className="flex gap-2">
                {imports.meta.currentPage > 1 && (
                  <Link
                    href={`/painel/instagram/historico?page=${imports.meta.currentPage - 1}${onlyErrors ? "&only_errors=true" : ""}`}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm transition"
                  >
                    Anterior
                  </Link>
                )}
                {imports.meta.currentPage < imports.meta.lastPage && (
                  <Link
                    href={`/painel/instagram/historico?page=${imports.meta.currentPage + 1}${onlyErrors ? "&only_errors=true" : ""}`}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm transition"
                  >
                    Próxima
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
