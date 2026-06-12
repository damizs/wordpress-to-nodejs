import { Head } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Pencil, Trash2, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
  ButtonLink,
  ConfirmDelete,
  CreateButton,
  IconButton,
  IconLink,
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
  roles: { id: number; name: string }[]
}

export default function UsersIndex({ users }: { users: UserItem[] }) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  return (
    <AdminLayout title="Usuários">
      <Head title="Usuários - Painel" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">{users.length} usuário(s)</p>
        <div className="flex items-center gap-2">
          <ButtonLink href="/painel/papeis" variant="secondary">
            <ShieldCheck className="w-4 h-4" /> Papéis e Permissões
          </ButtonLink>
          <CreateButton href="/painel/usuarios/criar">Novo Usuário</CreateButton>
        </div>
      </div>

      <Table>
        <THead>
          <TH>Usuário</TH>
          <TH>Papéis</TH>
          <TH>Status</TH>
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
                <RowActions>
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
          {users.length === 0 && <TableEmpty colSpan={4}>Nenhum usuário cadastrado</TableEmpty>}
        </TBody>
      </Table>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/usuarios/${id}`}
        entity="usuário"
      />
    </AdminLayout>
  )
}
