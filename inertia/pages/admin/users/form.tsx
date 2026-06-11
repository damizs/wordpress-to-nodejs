import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { ArrowLeft, Save } from 'lucide-react'
import type { FormEvent } from 'react'

interface RoleOption {
  id: number
  name: string
  description: string | null
}

interface UserData {
  id: number
  fullName: string
  email: string
  isActive: boolean
  roleIds: number[]
}

export default function UserForm({ user, roles }: { user: UserData | null; roles: RoleOption[] }) {
  const isEdit = !!user

  const { data, setData, post, put, processing, errors } = useForm({
    full_name: user?.fullName ?? '',
    email: user?.email ?? '',
    password: '',
    is_active: user?.isActive ?? true,
    role_ids: user?.roleIds ?? ([] as number[]),
  })

  function toggleRole(roleId: number) {
    setData(
      'role_ids',
      data.role_ids.includes(roleId)
        ? data.role_ids.filter((id) => id !== roleId)
        : [...data.role_ids, roleId]
    )
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isEdit) {
      put(`/painel/usuarios/${user!.id}`)
    } else {
      post('/painel/usuarios')
    }
  }

  return (
    <AdminLayout title={isEdit ? 'Editar Usuário' : 'Novo Usuário'}>
      <Head title={`${isEdit ? 'Editar' : 'Novo'} Usuário - Painel`} />

      <Link href="/painel/usuarios" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-navy mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar para usuários
      </Link>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
            <input
              type="text"
              value={data.full_name}
              onChange={(e) => setData('full_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
              required
            />
            {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
              required
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha {isEdit ? '(deixe em branco para manter a atual)' : '*'}
            </label>
            <input
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
              required={!isEdit}
              minLength={8}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={data.is_active}
              onChange={(e) => setData('is_active', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-navy focus:ring-navy/20"
            />
            <span className="text-sm text-gray-700">Usuário ativo</span>
          </label>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Papéis</h3>
          <p className="text-xs text-gray-400 mb-4">
            O usuário só acessa as áreas do painel cobertas pelos papéis marcados. Pode combinar mais de um.
          </p>
          <div className="space-y-2">
            {roles.map((role) => (
              <label
                key={role.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  data.role_ids.includes(role.id)
                    ? 'border-navy/30 bg-navy/5'
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={data.role_ids.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-navy focus:ring-navy/20"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">{role.name}</p>
                  {role.description && <p className="text-xs text-gray-400 mt-0.5">{role.description}</p>}
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={processing}
          className="flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {isEdit ? 'Salvar Alterações' : 'Criar Usuário'}
        </button>
      </form>
    </AdminLayout>
  )
}
