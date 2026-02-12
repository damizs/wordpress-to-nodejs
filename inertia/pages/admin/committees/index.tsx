import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const typeBadge: Record<string, string> = {
  permanente: 'bg-blue-100 text-blue-700',
  temporaria: 'bg-amber-100 text-amber-700',
  especial: 'bg-purple-100 text-purple-700',
}

interface Props {
  committees: any[]
}

export default function CommitteesIndex({ committees }: Props) {
  return (
    <AdminLayout title="Comissões">
      <Head title="Comissões - Painel" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">Gerencie as comissões parlamentares</p>
        <Link href="/painel/comissoes/criar"
          className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Nova Comissão
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50 text-left">
              <th className="px-6 py-3 text-xs font-medium text-gray-500">Nome</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500">Tipo</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500">Legislatura</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500">Membros</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {committees.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-3 text-sm font-medium text-gray-800">{c.name}</td>
                <td className="px-6 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${typeBadge[c.type] || 'bg-gray-100 text-gray-600'}`}>{c.type}</span>
                </td>
                <td className="px-6 py-3 text-sm text-gray-500">{c.legislature_name || '—'}</td>
                <td className="px-6 py-3 text-sm text-gray-500">{c.members_count}</td>
                <td className="px-6 py-3">
                  {c.is_active
                    ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Ativa</span>
                    : <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Inativa</span>
                  }
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/painel/comissoes/${c.id}/editar`} className="p-1.5 text-gray-400 hover:text-navy">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button onClick={() => { if (confirm('Excluir?')) router.delete(`/painel/comissoes/${c.id}`) }}
                      className="p-1.5 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {committees.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">Nenhuma comissão cadastrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
