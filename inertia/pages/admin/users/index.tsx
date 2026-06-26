import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Pencil, Plus, Trash2, ShieldCheck, ShieldOff, Users } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
  Button,
  ButtonLink,
  ConfirmDelete,
  IconButton,
  IconLink,
  Modal,
  PageHeader,
  RowActions,
  StatusBadge,
  Table,
  TableEmpty,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '~/components/admin/ui'

interface UserItem {
  id: number
  fullName: string
  email: string
  isActive: boolean
  twofaEnabled: boolean
  roles: { id: number; name: string }[]
}

export default function UsersIndex({
  users,
  canManageTwofa = false,
}: {
  users: UserItem[]
  canManageTwofa?: boolean
}) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)
  const [twofaTarget, setTwofaTarget] = useState<{ id: number; label: string } | null>(null)
  const [unlocking, setUnlocking] = useState(false)

  function confirmDisableTwofa() {
    if (!twofaTarget) return
    setUnlocking(true)
    router.post(
      `/painel/usuarios/${twofaTarget.id}/desativar-2fa`,
      {},
      {
        onFinish: () => {
          setUnlocking(false)
          setTwofaTarget(null)
        },
      }
    )
  }

  return (
    <AdminLayout title="Usuários">
      <Head title="Usuários - Painel" />

      <PageHeader
        title="Usuários"
        description={`${users.length} usuário(s) cadastrado(s) no sistema.`}
        icon={Users}
        eyebrow="Sistema"
        variant="hero"
        actions={
          <>
            <ButtonLink href="/painel/papeis" variant="secondary">
              <ShieldCheck className="w-4 h-4" /> Papéis e Permissões
            </ButtonLink>
            <ButtonLink href="/painel/usuarios/criar" variant="gold">
              <Plus className="w-4 h-4" /> Novo Usuário
            </ButtonLink>
          </>
        }
      />

      <Table>
        <THead>
          <TH>Usuário</TH>
          <TH>Papéis</TH>
          <TH>Status</TH>
          <TH>2FA</TH>
          <TH className="text-right">Ações</TH>
        </THead>
        <TBody>
          {users.map((user) => (
            <TR key={user.id}>
              <TD>
                <p className="text-sm font-medium text-foreground truncate">{user.fullName}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
              </TD>
              <TD>
                <div className="flex flex-wrap gap-1">
                  {user.roles.length === 0 ? (
                    <Badge tone="warning">Sem papel atribuído</Badge>
                  ) : (
                    user.roles.map((role) => (
                      <Badge key={role.id} tone="navy">
                        {role.name}
                      </Badge>
                    ))
                  )}
                </div>
              </TD>
              <TD>
                <StatusBadge status={user.isActive ? 'active' : 'inactive'} />
              </TD>
              <TD>
                {user.twofaEnabled ? (
                  <Badge tone="success">Ativo</Badge>
                ) : (
                  <Badge tone="neutral">Inativo</Badge>
                )}
              </TD>
              <TD>
                <RowActions>
                  {canManageTwofa && user.twofaEnabled && (
                    <IconButton
                      tone="neutral"
                      onClick={() => setTwofaTarget({ id: user.id, label: user.fullName })}
                      title="Destravar 2FA (desativar)"
                    >
                      <ShieldOff className="w-4 h-4" />
                    </IconButton>
                  )}
                  <IconLink tone="edit" href={`/painel/usuarios/${user.id}/editar`} title="Editar">
                    <Pencil className="w-4 h-4" />
                  </IconLink>
                  <IconButton
                    tone="delete"
                    onClick={() => setDeleteTarget({ id: user.id, label: user.fullName })}
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </RowActions>
              </TD>
            </TR>
          ))}
          {users.length === 0 && <TableEmpty colSpan={5}>Nenhum usuário cadastrado</TableEmpty>}
        </TBody>
      </Table>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/usuarios/${id}`}
        entity="usuário"
      />

      <Modal open={!!twofaTarget} onClose={() => (unlocking ? undefined : setTwofaTarget(null))}>
        <div className="p-5 lg:p-6">
          <h2 className="text-[15px] font-bold text-foreground mb-2">
            Destravar verificação em duas etapas
          </h2>
          <p className="text-sm text-muted-foreground">
            Isto vai <strong>desativar o 2FA</strong> de{' '}
            <strong className="text-foreground">{twofaTarget?.label}</strong>. Use apenas para
            destravar alguém que perdeu o app autenticador e os códigos de backup. A pessoa entrará
            só com a senha até reativar.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setTwofaTarget(null)}
              disabled={unlocking}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDisableTwofa}
              loading={unlocking}
            >
              Desativar 2FA
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
