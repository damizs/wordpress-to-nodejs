import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Pencil, Trash2, ShieldCheck, Lock } from 'lucide-react'

interface RoleItem {
  id: number
  name: string
  description: string | null
  isSystem: boolean
  permissionCount: number
}

export default function RolesIndex({ roles }: { roles: RoleItem[] }) {
  function handleDelete(role: RoleItem) {
    if (confirm(`Excluir o papel "${role.name}"? Usuários com este papel perderão as permissões dele.`)) {
      router.delete(`/painel/papeis/${role.id}`)
    }
  }

  return (
    <AdminLayout title="Papéis e Permissões">
      <Head title="Papéis - Painel" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{roles.length} papel(éis)</p>
        <Link href="/painel/papeis/criar"
          className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Novo Papel
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
        {roles.map((role) => (
          <div key={role.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50">
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-navy flex-shrink-0" />
                <p className="text-sm font-medium text-gray-800 truncate">{role.name}</p>
                {role.isSystem && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gold/10 text-gold-dark">
                    <Lock className="w-3 h-3" /> Sistema
                  </span>
                )}
              </div>
              {role.description && <p className="text-xs text-gray-400 truncate mt-0.5">{role.description}</p>}
              <p className="text-xs text-gray-400 mt-0.5">{role.permissionCount} permissão(ões)</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href={`/painel/papeis/${role.id}/editar`} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                <Pencil className="w-4 h-4" />
              </Link>
              {!role.isSystem && (
                <button onClick={() => handleDelete(role)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
