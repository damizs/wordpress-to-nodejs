import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Pencil, Trash2, FileText, ExternalLink } from 'lucide-react'

interface Publication {
  id: number
  title: string
  type: string
  number: string | null
  publication_date: string
  file_url: string | null
}

interface Props {
  publications: { data: Publication[]; meta: any }
  filters: { type: string }
}

const typeOptions = ['Portarias', 'Decretos', 'Resoluções', 'Leis', 'Atos', 'Contratos', 'Editais', 'Outros']

export default function PublicationsIndex({ publications, filters }: Props) {
  function handleDelete(id: number, title: string) {
    if (confirm(`Excluir "${title}"?`)) {
      router.delete(`/painel/publicacoes/${id}`)
    }
  }

  return (
    <AdminLayout title="Publicações Oficiais">
      <Head title="Publicações - Painel" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">{publications.meta?.total || publications.data.length} publicação(ões)</p>
          <select value={filters.type}
            onChange={(e) => router.get('/painel/publicacoes', { type: e.target.value }, { preserveState: true })}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1">
            <option value="">Todos os tipos</option>
            {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <Link href="/painel/publicacoes/criar"
          className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Nova Publicação
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {publications.data.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma publicação cadastrada</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Data</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Título</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nº</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Arquivo</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {publications.data.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(p.publication_date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.title}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">{p.type}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.number || '—'}</td>
                  <td className="px-4 py-3">
                    {p.file_url ? (
                      <a href={p.file_url} target="_blank" rel="noopener" className="text-blue-600 hover:text-blue-800">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/painel/publicacoes/${p.id}/editar`} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.title)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}
