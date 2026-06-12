import { Head } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Pencil, Trash2, ShieldCheck, Lock } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
  ConfirmDelete,
  CreateButton,
  IconButton,
  IconLink,
  RowActions,
  Table,
  TableEmpty,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '~/components/admin/ui'

interface RoleItem {
  id: number
  name: string
  description: string | null
  isSystem: boolean
  permissionCount: number
}

export default function RolesIndex({ roles }: { roles: RoleItem[] }) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  return (
    <AdminLayout title="Papéis e Permissões">
      <Head title="Papéis - Painel" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">{roles.length} papel(éis)</p>
        <CreateButton href="/painel/papeis/criar">Novo Papel</CreateButton>
      </div>

      <Table>
        <THead>
          <TH>Papel</TH>
          <TH>Permissões</TH>
          <TH className="text-right">Ações</TH>
        </THead>
        <TBody>
          {roles.map((role) => (
            <TR key={role.id}>
              <TD>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-navy flex-shrink-0" />
                  <p className="text-sm font-medium text-foreground truncate">{role.name}</p>
                  {role.isSystem && (
                    <Badge tone="gold">
                      <Lock className="w-3 h-3" /> Sistema
                    </Badge>
                  )}
                </div>
                {role.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {role.description}
                  </p>
                )}
              </TD>
              <TD className="text-muted-foreground">{role.permissionCount} permissão(ões)</TD>
              <TD>
                <RowActions>
                  <IconLink tone="edit" href={`/painel/papeis/${role.id}/editar`} title="Editar">
                    <Pencil className="w-4 h-4" />
                  </IconLink>
                  {!role.isSystem && (
                    <IconButton
                      tone="delete"
                      onClick={() => setDeleteTarget({ id: role.id, label: role.name })}
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  )}
                </RowActions>
              </TD>
            </TR>
          ))}
          {roles.length === 0 && <TableEmpty colSpan={3}>Nenhum papel cadastrado</TableEmpty>}
        </TBody>
      </Table>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/papeis/${id}`}
        entity="papel"
      />
    </AdminLayout>
  )
}
