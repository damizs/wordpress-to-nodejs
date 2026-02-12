import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Pencil, Trash2, Settings } from 'lucide-react'

interface Legislature {
  id: number
  name: string
  number: number
  start_date: string
  end_date: string
  is_current: boolean
  councilors_count: number
  biennia_count: number
}

export default function LegislaturesIndex({ legislatures }: { legislatures: Legislature[] }) {
  function handleDelete(id: number, name: string) {
    if (confirm(`Excluir a legislatura "${name}"?`)) {
      router.delete(`/painel/legislaturas/${id}`)
    }
  }

  return (
    <AdminLayout title="Legislaturas">
      <Head title="Legislaturas - Painel" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{legislatures.length} legislatura(s)</p>
        <Link
          href="/painel/legislaturas/criar"
          className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nova Legislatura
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {legislatures.length === 0 ? (
          <div className="p-12 text-center">
            <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma legislatura cadastrada</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nº</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Período</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Vereadores</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {legislatures.map((l) => (
                <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{l.number}ª</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{l.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(l.start_date).toLocaleDateString('pt-BR')} — {new Date(l.end_date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{l.councilors_count}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      l.is_current ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {l.is_current ? 'Atual' : 'Encerrada'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/painel/legislaturas/${l.id}/editar`} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(l.id, l.name)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
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
