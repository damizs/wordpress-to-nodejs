import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface Props {
  biennia: any[]
}

export default function BienniaIndex({ biennia }: Props) {
  return (
    <AdminLayout title="Biênios">
      <Head title="Biênios - Painel" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">Gerencie os biênios da mesa diretora</p>
        <Link href="/painel/bienios/criar"
          className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Novo Biênio
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-50 text-left">
              <th className="px-6 py-3 text-xs font-medium text-gray-500">Nome</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500">Legislatura</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500">Período</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500">Cargos</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500">Status</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {biennia.map((b: any) => (
              <tr key={b.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-3 text-sm font-medium text-gray-800">{b.name}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{b.legislature_name}</td>
                <td className="px-6 py-3 text-sm text-gray-500">{b.start_date} → {b.end_date}</td>
                <td className="px-6 py-3 text-sm text-gray-500">{b.positions_count}</td>
                <td className="px-6 py-3">
                  {b.is_current
                    ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Atual</span>
                    : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Anterior</span>
                  }
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/painel/bienios/${b.id}/editar`} className="p-1.5 text-gray-400 hover:text-navy">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button onClick={() => { if (confirm('Excluir?')) router.delete(`/painel/bienios/${b.id}`) }}
                      className="p-1.5 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {biennia.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-400">Nenhum biênio cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
