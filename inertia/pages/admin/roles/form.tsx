import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { ArrowLeft, Save, Lock } from 'lucide-react'
import type { FormEvent } from 'react'

interface PermissionItem {
  id: number
  name: string
  label: string
  module: string
}

interface RoleData {
  id: number
  name: string
  description: string | null
  isSystem: boolean
  permissionIds: number[]
}

export default function RoleForm({
  role,
  permissions,
}: {
  role: RoleData | null
  permissions: PermissionItem[]
}) {
  const isEdit = !!role
  const readonly = role?.isSystem ?? false

  const { data, setData, post, put, processing, errors } = useForm({
    name: role?.name ?? '',
    description: role?.description ?? '',
    permission_ids: role?.permissionIds ?? ([] as number[]),
  })

  const grouped = permissions.reduce(
    (acc, p) => {
      if (!acc[p.module]) acc[p.module] = []
      acc[p.module].push(p)
      return acc
    },
    {} as Record<string, PermissionItem[]>
  )

  function togglePermission(id: number) {
    if (readonly) return
    setData(
      'permission_ids',
      data.permission_ids.includes(id)
        ? data.permission_ids.filter((p) => p !== id)
        : [...data.permission_ids, id]
    )
  }

  function toggleModule(items: PermissionItem[]) {
    if (readonly) return
    const ids = items.map((p) => p.id)
    const allChecked = ids.every((id) => data.permission_ids.includes(id))
    setData(
      'permission_ids',
      allChecked
        ? data.permission_ids.filter((id) => !ids.includes(id))
        : [...new Set([...data.permission_ids, ...ids])]
    )
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (readonly) return
    if (isEdit) {
      put(`/painel/papeis/${role!.id}`)
    } else {
      post('/painel/papeis')
    }
  }

  return (
    <AdminLayout title={isEdit ? 'Editar Papel' : 'Novo Papel'}>
      <Head title={`${isEdit ? 'Editar' : 'Novo'} Papel - Painel`} />

      <Link href="/painel/papeis" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-navy mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar para papéis
      </Link>

      {readonly && (
        <div className="max-w-2xl mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-gold/10 text-gold-dark text-sm">
          <Lock className="w-4 h-4 flex-shrink-0" />
          Este é um papel do sistema: tem acesso total e não pode ser alterado.
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do papel *</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="Ex.: Assessoria Jurídica"
              disabled={readonly}
              required
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input
              type="text"
              value={data.description ?? ''}
              onChange={(e) => setData('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 disabled:bg-gray-50 disabled:text-gray-400"
              placeholder="O que este papel pode fazer"
              disabled={readonly}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Permissões</h3>
          <p className="text-xs text-gray-400 mb-4">
            Marque o que este papel pode gerenciar no painel.
          </p>

          <div className="space-y-5">
            {Object.entries(grouped).map(([module, items]) => {
              const allChecked = items.every((p) => data.permission_ids.includes(p.id))
              return (
                <div key={module}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase">{module}</h4>
                    {!readonly && (
                      <button
                        type="button"
                        onClick={() => toggleModule(items)}
                        className="text-xs text-navy hover:underline"
                      >
                        {allChecked ? 'Desmarcar todos' : 'Marcar todos'}
                      </button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {items.map((p) => (
                      <label
                        key={p.id}
                        className={`flex items-start gap-2 p-2.5 rounded-lg border transition-colors ${
                          readonly ? 'cursor-default' : 'cursor-pointer'
                        } ${
                          data.permission_ids.includes(p.id) || readonly
                            ? 'border-navy/30 bg-navy/5'
                            : 'border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={readonly || data.permission_ids.includes(p.id)}
                          onChange={() => togglePermission(p.id)}
                          disabled={readonly}
                          className="w-4 h-4 mt-0.5 rounded border-gray-300 text-navy focus:ring-navy/20"
                        />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-800">{p.label}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{p.name}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {!readonly && (
          <button
            type="submit"
            disabled={processing}
            className="flex items-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isEdit ? 'Salvar Alterações' : 'Criar Papel'}
          </button>
        )}
      </form>
    </AdminLayout>
  )
}
