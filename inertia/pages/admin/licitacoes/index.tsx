import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const statusBadge: Record<string, string> = {
  aberta: 'bg-green-100 text-green-700',
  em_andamento: 'bg-blue-100 text-blue-700',
  encerrada: 'bg-gray-200 text-gray-600',
  deserta: 'bg-amber-100 text-amber-700',
  revogada: 'bg-red-100 text-red-600',
  suspensa: 'bg-yellow-100 text-yellow-700',
}

interface Props { licitacoes: any; filters: { status: string; modality: string } }

export default function LicitacoesIndex({ licitacoes, filters }: Props) {
  return (
    <AdminLayout title="Licitações">
      <Head title="Licitações - Painel" />
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3">
          <select value={filters.status} onChange={(e) => router.get('/painel/licitacoes', { ...filters, status: e.target.value }, { preserveState: true })}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">Todos os status</option>
            <option value="aberta">Aberta</option>
            <option value="em_andamento">Em andamento</option>
            <option value="encerrada">Encerrada</option>
            <option value="deserta">Deserta</option>
            <option value="revogada">Revogada</option>
            <option value="suspensa">Suspensa</option>
          </select>
        </div>
        <Link href="/painel/licitacoes/criar"
          className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Nova Licitação
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50 text-left">
              <th className="px-6 py-3 text-xs font-medium text-gray-500">Título</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500">Modalidade</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500">Abertura</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {licitacoes.data?.map((l: any) => (
              <tr key={l.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-3">
                  <div className="text-sm font-medium text-gray-800">{l.title}</div>
                  {l.number && <div className="text-xs text-gray-400">Nº {l.number}</div>}
                </td>
                <td className="px-6 py-3 text-sm text-gray-500 capitalize">{l.modality?.replace('_', ' ') || '—'}</td>
                <td className="px-6 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusBadge[l.status] || 'bg-gray-100 text-gray-600'}`}>
                    {l.status?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm text-gray-500">{l.opening_date || '—'}</td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/painel/licitacoes/${l.id}/editar`} className="p-1.5 text-gray-400 hover:text-navy"><Pencil className="w-4 h-4" /></Link>
                    <button onClick={() => { if (confirm('Excluir?')) router.delete(`/painel/licitacoes/${l.id}`) }}
                      className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {(!licitacoes.data || licitacoes.data.length === 0) && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">Nenhuma licitação cadastrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
