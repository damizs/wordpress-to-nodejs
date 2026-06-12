import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { ArrowLeft, Save, ShieldCheck, User } from 'lucide-react'
import type { FormEvent } from 'react'
import { Button, Card, CardHeader, Field, Input } from '~/components/admin/ui'

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

      <Link
        href="/painel/usuarios"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-navy mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para usuários
      </Link>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card>
          <CardHeader title="Dados do usuário" icon={User} />
          <div className="space-y-4">
            <Field label="Nome completo" required error={errors.full_name}>
              <Input
                type="text"
                value={data.full_name}
                onChange={(e) => setData('full_name', e.target.value)}
                required
              />
            </Field>

            <Field label="E-mail" required error={errors.email}>
              <Input
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                required
              />
            </Field>

            <Field
              label={`Senha ${isEdit ? '(deixe em branco para manter a atual)' : ''}`.trim()}
              required={!isEdit}
              error={errors.password}
            >
              <Input
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                required={!isEdit}
                minLength={8}
              />
            </Field>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.is_active}
                onChange={(e) => setData('is_active', e.target.checked)}
                className="w-4 h-4 rounded border-border accent-[hsl(var(--navy))]"
              />
              <span className="text-sm text-foreground">Usuário ativo</span>
            </label>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Papéis"
            description="O usuário só acessa as áreas do painel cobertas pelos papéis marcados. Pode combinar mais de um."
            icon={ShieldCheck}
          />
          <div className="space-y-2">
            {roles.map((role) => (
              <label
                key={role.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  data.role_ids.includes(role.id)
                    ? 'border-navy/30 bg-navy/5'
                    : 'border-border hover:bg-muted/40'
                }`}
              >
                <input
                  type="checkbox"
                  checked={data.role_ids.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                  className="w-4 h-4 mt-0.5 rounded border-border accent-[hsl(var(--navy))]"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{role.name}</p>
                  {role.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </Card>

        <Button type="submit" loading={processing}>
          <Save className="w-4 h-4" /> {isEdit ? 'Salvar Alterações' : 'Criar Usuário'}
        </Button>
      </form>
    </AdminLayout>
  )
}
