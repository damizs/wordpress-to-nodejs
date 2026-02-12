import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Pencil, Trash2, FileText, ExternalLink } from 'lucide-react'

interface PlenarySession {
  id: number
  title: string
  type: string
  session_date: string
  year: number
  status: string
  file_url: string | null
}

interface Props {
  sessions: { data: PlenarySession[]; meta: any }
  filters: { year: string; type: string }
}

const typeLabels: Record<string, string> = {
  ordinaria: 'Ordinária', extraordinaria: 'Extraordinária', solene: 'Solene', especial: 'Especial',
}
const statusLabels: Record<string, string> = {
  agendada: 'Agendada', realizada: 'Realizada', cancelada: 'Cancelada',
}

export default function PlenarySessionsIndex({ sessions, filters }: Props) {
  function handleDelete(id: number, title: string) {
    if (confirm(`Excluir a sessão "${title}"?`)) {
      router.delete(`/painel/sessoes/${id}`)
    }
  }

  return (
    <AdminLayout title="Sessões / Atas">
      <Head title="Sessões / Atas - Painel" />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">{sessions.meta?.total || sessions.data.length} sessão(ões)</p>
          <select value={filters.type}
            onChange={(e) => router.get('/painel/sessoes', { type: e.target.value, year: filters.year }, { preserveState: true })}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1">
            <option value="">Todos os tipos</option>
            <option value="ordinaria">Ordinária</option>
            <option value="extraordinaria">Extraordinária</option>
            <option value="solene">Solene</option>
          </select>
        </div>
        <Link href="/painel/sessoes/criar"
          className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Nova Sessão
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {sessions.data.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma sessão cadastrada</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Data</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Título</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Arquivo</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sessions.data.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(s.session_date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.title}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {typeLabels[s.type] || s.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      s.status === 'realizada' ? 'bg-green-100 text-green-700' :
                      s.status === 'cancelada' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{statusLabels[s.status] || s.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {s.file_url ? (
                      <a href={s.file_url} target="_blank" rel="noopener" className="text-blue-600 hover:text-blue-800">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/painel/sessoes/${s.id}/editar`} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(s.id, s.title)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
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
