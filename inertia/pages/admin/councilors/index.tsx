import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'

interface Councilor {
  id: number
  name: string
  slug: string
  party: string | null
  photo_url: string | null
  role: string | null
  is_active: boolean
  display_order: number
  legislature?: { name: string }
}

export default function CouncilorsIndex({ councilors }: { councilors: Councilor[] }) {
  function handleDelete(id: number, name: string) {
    if (confirm(`Excluir o vereador "${name}"?`)) {
      router.delete(`/painel/vereadores/${id}`)
    }
  }

  return (
    <AdminLayout title="Vereadores">
      <Head title="Vereadores - Painel" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{councilors.length} vereador(es) cadastrado(s)</p>
        <Link
          href="/painel/vereadores/criar"
          className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Novo Vereador
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {councilors.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum vereador cadastrado</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Vereador</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Partido</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Cargo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {councilors.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-sm text-gray-400">{c.display_order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {c.photo_url ? (
                        <img src={c.photo_url} alt={c.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-navy/40" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-800">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.party || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.role || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {c.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/painel/vereadores/${c.id}/editar`}
                        className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      >
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
