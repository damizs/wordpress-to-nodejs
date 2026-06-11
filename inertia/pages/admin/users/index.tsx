import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Pencil, Trash2, Users, ShieldCheck } from 'lucide-react'

interface UserItem {
  id: number
  fullName: string
  email: string
  isActive: boolean
  roles: { id: number; name: string }[]
}

export default function UsersIndex({ users }: { users: UserItem[] }) {
  function handleDelete(user: UserItem) {
    if (confirm(`Excluir o usuário "${user.fullName}"?`)) {
      router.delete(`/painel/usuarios/${user.id}`)
    }
  }

  return (
    <AdminLayout title="Usuários">
      <Head title="Usuários - Painel" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{users.length} usuário(s)</p>
        <div className="flex items-center gap-2">
          <Link href="/painel/papeis"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
            <ShieldCheck className="w-4 h-4" /> Papéis e Permissões
          </Link>
          <Link href="/painel/usuarios/criar"
            className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium">
            <Plus className="w-4 h-4" /> Novo Usuário
          </Link>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum usuário cadastrado</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-800 truncate">{user.fullName}</p>
                  {!user.isActive && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">Inativo</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {user.roles.length === 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-600">Sem papel atribuído</span>
                  ) : (
                    user.roles.map((role) => (
                      <span key={role.id} className="px-2 py-0.5 rounded-full text-xs bg-navy/5 text-navy">
                        {role.name}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/painel/usuarios/${user.id}/editar`} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                  <Pencil className="w-4 h-4" />
                </Link>
                <button onClick={() => handleDelete(user)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
