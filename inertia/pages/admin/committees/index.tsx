import { Head } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Landmark, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
  type BadgeTone,
  ConfirmDelete,
  CreateButton,
  EmptyState,
  IconButton,
  IconLink,
  PageHeader,
  RowActions,
  StatusBadge,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '~/components/admin/ui'

const typeTones: Record<string, BadgeTone> = {
  permanente: 'navy',
  temporaria: 'warning',
  especial: 'info',
}

interface Props {
  committees: any[]
}

export default function CommitteesIndex({ committees }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  return (
    <AdminLayout title="Comissões">
      <Head title="Comissões - Painel" />

      <PageHeader
        variant="hero"
        icon={Landmark}
        eyebrow="Legislativo"
        title="Comissões"
        description="Gerencie as comissões parlamentares"
        actions={<CreateButton href="/painel/comissoes/criar">Nova Comissão</CreateButton>}
      />

      {committees.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="Nenhuma comissão cadastrada"
          description="Adicione a primeira comissão para exibi-la no portal."
          action={<CreateButton href="/painel/comissoes/criar">Nova Comissão</CreateButton>}
        />
      ) : (
        <Table>
          <THead>
            <TH>Nome</TH>
            <TH>Tipo</TH>
            <TH>Legislatura</TH>
            <TH>Membros</TH>
            <TH>Status</TH>
            <TH className="text-right">Ações</TH>
          </THead>
          <TBody>
            {committees.map((c: any) => (
              <TR key={c.id}>
                <TD className="font-medium">{c.name}</TD>
                <TD>
                  <Badge tone={typeTones[c.type] ?? 'neutral'} className="capitalize">
                    {c.type}
                  </Badge>
                </TD>
                <TD className="text-muted-foreground">{c.legislature_name || '—'}</TD>
                <TD className="text-muted-foreground">{c.members_count}</TD>
                <TD>
                  <StatusBadge
                    status={c.is_active ? 'active' : 'inactive'}
                    label={c.is_active ? 'Ativa' : 'Inativa'}
                  />
                </TD>
                <TD>
                  <RowActions>
                    <IconLink tone="edit" href={`/painel/comissoes/${c.id}/editar`} title="Editar">
                      <Pencil className="w-4 h-4" />
                    </IconLink>
                    <IconButton
                      tone="delete"
                      onClick={() => setDeleteTarget({ id: c.id, label: c.name })}
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </RowActions>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/comissoes/${id}`}
        entity="comissão"
      />
    </AdminLayout>
  )
}
