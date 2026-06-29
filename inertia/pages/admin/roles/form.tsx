import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { ArrowLeft, Info, Lock, Save, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, type FormEvent } from 'react'
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  Field,
  FormSection,
  Input,
  PageHeader,
} from '~/components/admin/ui'

interface PermissionItem {
  id: number
  name: string
  label: string
  module: string
}

interface GroupedPermission {
  id: number
  name: string
  action: string
  actionLabel: string
  label: string
}

interface PermissionGroup {
  resource: string
  label: string
  description: string | null
  module: string
  permissions: GroupedPermission[]
}

interface RoleData {
  id: number
  name: string
  description: string | null
  isSystem: boolean
  permissionIds: number[]
}

/**
 * Fallback: se por algum motivo a view receber só a lista plana de permissões
 * (sem `permissionGroups`), monta um agrupamento simples por recurso para não
 * quebrar a tela. Em uso normal o controller já envia `permissionGroups`.
 */
function deriveGroupsFromFlat(permissions: PermissionItem[]): PermissionGroup[] {
  const groups = new Map<string, PermissionGroup>()
  for (const p of permissions) {
    const [resource, action = 'gerenciar'] = p.name.split('.')
    if (!groups.has(resource)) {
      groups.set(resource, {
        resource,
        label: p.module || resource,
        description: null,
        module: p.module || 'Outros',
        permissions: [],
      })
    }
    groups.get(resource)!.permissions.push({
      id: p.id,
      name: p.name,
      action,
      actionLabel: action.charAt(0).toUpperCase() + action.slice(1),
      label: p.label,
    })
  }
  return [...groups.values()]
}

/** Checkbox "marcar todos do grupo" com suporte ao estado indeterminado. */
function GroupCheckbox({
  checked,
  indeterminate,
  disabled,
  onChange,
}: {
  checked: boolean
  indeterminate: boolean
  disabled?: boolean
  onChange: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      className="w-4 h-4 mt-0.5 rounded border-border accent-[hsl(var(--navy))]"
    />
  )
}

export default function RoleForm({
  role,
  permissions,
  permissionGroups,
}: {
  role: RoleData | null
  permissions?: PermissionItem[]
  permissionGroups?: PermissionGroup[]
}) {
  const isEdit = !!role
  const readonly = role?.isSystem ?? false

  const { data, setData, post, put, processing, errors } = useForm({
    name: role?.name ?? '',
    description: role?.description ?? '',
    permission_ids: role?.permissionIds ?? ([] as number[]),
  })

  // Fonte agrupada por recurso (vinda do controller); fallback defensivo.
  const groups: PermissionGroup[] =
    permissionGroups ?? deriveGroupsFromFlat(permissions ?? [])

  // Seções de alto nível: agrupa os recursos pelo seu módulo, preservando a
  // ordem em que vieram do controller.
  const sections: { module: string; groups: PermissionGroup[] }[] = []
  for (const group of groups) {
    let section = sections.find((s) => s.module === group.module)
    if (!section) {
      section = { module: group.module, groups: [] }
      sections.push(section)
    }
    section.groups.push(group)
  }

  const selected = data.permission_ids

  function togglePermission(id: number) {
    if (readonly) return
    setData(
      'permission_ids',
      selected.includes(id) ? selected.filter((p) => p !== id) : [...selected, id]
    )
  }

  function toggleGroup(ids: number[]) {
    if (readonly) return
    const allChecked = ids.every((id) => selected.includes(id))
    setData(
      'permission_ids',
      allChecked
        ? selected.filter((id) => !ids.includes(id))
        : [...new Set([...selected, ...ids])]
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

  const totalSelected = readonly
    ? groups.reduce((n, g) => n + g.permissions.length, 0)
    : selected.length

  return (
    <AdminLayout title={isEdit ? 'Editar Papel' : 'Novo Papel'}>
      <Head title={`${isEdit ? 'Editar' : 'Novo'} Papel - Painel`} />

      <PageHeader
        title={isEdit ? 'Editar Papel' : 'Novo Papel'}
        description={
          readonly
            ? 'Papel do sistema com acesso total — somente leitura.'
            : isEdit
              ? 'Edite o nome, descrição e permissões deste papel.'
              : 'Defina um novo papel e as permissões que ele concede.'
        }
        icon={ShieldCheck}
        eyebrow="Sistema"
        actions={
          <ButtonLink href="/painel/papeis" variant="secondary">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </ButtonLink>
        }
      />

      {readonly && (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-gold/15 text-amber-700 dark:text-amber-300 text-sm">
          <Lock className="w-4 h-4 flex-shrink-0" />
          Este é um papel do sistema: tem acesso total e não pode ser alterado.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Dados do papel" icon={ShieldCheck} columns={2}>
          <Field label="Nome do papel" required error={errors.name}>
            <Input
              type="text"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="Ex.: Assessoria Jurídica"
              disabled={readonly}
              required
            />
          </Field>

          <Field label="Descrição">
            <Input
              type="text"
              value={data.description ?? ''}
              onChange={(e) => setData('description', e.target.value)}
              placeholder="O que este papel pode fazer"
              disabled={readonly}
            />
          </Field>
        </FormSection>

        <Card>
          <CardHeader
            title="Permissões"
            description="Escolha de forma granular o que este papel pode gerenciar — recurso por recurso."
            icon={ShieldCheck}
            actions={
              <Badge tone="navy">
                {totalSelected}{' '}
                {totalSelected === 1 ? 'permissão' : 'permissões'}
              </Badge>
            }
          />

          {!readonly && (
            <div className="mb-6 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-sky/10 text-sm text-foreground">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-sky" />
              <p className="text-[13px] text-muted-foreground">
                Cada bloco é um recurso independente. Você pode, por exemplo, liberar{' '}
                <strong className="text-foreground">Notícias</strong> (criar/editar) sem
                liberar a <strong className="text-foreground">Automação de Notícias
                (Instagram)</strong> nem a{' '}
                <strong className="text-foreground">Aparência e Site</strong>. Use “Marcar
                todos” para incluir/excluir o recurso inteiro.
              </p>
            </div>
          )}

          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.module}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  {section.module}
                </h3>

                <div className="grid gap-4 lg:grid-cols-2">
                  {section.groups.map((group) => {
                    const ids = group.permissions.map((p) => p.id)
                    const selectedCount = ids.filter((id) => selected.includes(id)).length
                    const allChecked = readonly || selectedCount === ids.length
                    const isIndeterminate = !readonly && selectedCount > 0 && !allChecked

                    return (
                      <fieldset
                        key={group.resource}
                        className={`rounded-xl border p-4 transition-colors ${
                          allChecked || isIndeterminate
                            ? 'border-navy/30 bg-navy/5'
                            : 'border-border bg-muted/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <label
                            className={`flex items-start gap-2.5 min-w-0 ${
                              readonly ? 'cursor-default' : 'cursor-pointer'
                            }`}
                          >
                            <GroupCheckbox
                              checked={allChecked}
                              indeterminate={isIndeterminate}
                              disabled={readonly}
                              onChange={() => toggleGroup(ids)}
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-foreground leading-tight">
                                {group.label}
                              </span>
                              {group.description && (
                                <span className="block text-xs text-muted-foreground mt-0.5">
                                  {group.description}
                                </span>
                              )}
                            </span>
                          </label>
                          <span className="shrink-0 text-[11px] font-medium text-muted-foreground tabular-nums">
                            {selectedCount}/{ids.length}
                          </span>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          {group.permissions.map((p) => {
                            const checked = readonly || selected.includes(p.id)
                            return (
                              <label
                                key={p.id}
                                title={p.label}
                                className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-colors ${
                                  readonly ? 'cursor-default' : 'cursor-pointer'
                                } ${
                                  checked
                                    ? 'border-navy/30 bg-card'
                                    : 'border-border bg-card hover:bg-muted/40'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => togglePermission(p.id)}
                                  disabled={readonly}
                                  className="w-4 h-4 rounded border-border accent-[hsl(var(--navy))]"
                                />
                                <span className="min-w-0">
                                  <span className="block text-[13px] text-foreground leading-tight">
                                    {p.actionLabel}
                                  </span>
                                  <span className="block text-[10px] text-muted-foreground font-mono truncate">
                                    {p.name}
                                  </span>
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </fieldset>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {!readonly && (
          <div>
            <Button type="submit" loading={processing}>
              <Save className="w-4 h-4" /> {isEdit ? 'Salvar Alterações' : 'Criar Papel'}
            </Button>
          </div>
        )}
      </form>
    </AdminLayout>
  )
}
