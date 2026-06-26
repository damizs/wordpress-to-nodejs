import { Head } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Landmark, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
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

interface Props {
  biennia: any[]
}

export default function BienniaIndex({ biennia }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  return (
    <AdminLayout title="Biênios">
      <Head title="Biênios - Painel" />

      <PageHeader
        variant="hero"
        icon={Landmark}
        eyebrow="Legislativo"
        title="Biênios"
        description="Gerencie os biênios da mesa diretora"
        actions={<CreateButton href="/painel/bienios/criar">Novo Biênio</CreateButton>}
      />

      {biennia.length === 0 ? (
        <EmptyState
          icon={Landmark}
          title="Nenhum biênio cadastrado"
          description="Adicione o primeiro biênio para organizar a mesa diretora."
          action={<CreateButton href="/painel/bienios/criar">Novo Biênio</CreateButton>}
        />
      ) : (
        <Table>
          <THead>
            <TH>Nome</TH>
            <TH>Legislatura</TH>
            <TH>Período</TH>
            <TH>Cargos</TH>
            <TH>Status</TH>
            <TH className="text-right">Ações</TH>
          </THead>
          <TBody>
            {biennia.map((b: any) => (
              <TR key={b.id}>
                <TD className="font-medium">{b.name}</TD>
                <TD className="text-muted-foreground">{b.legislature_name}</TD>
                <TD className="text-muted-foreground">{b.start_date} → {b.end_date}</TD>
                <TD className="text-muted-foreground">{b.positions_count}</TD>
                <TD>
                  <StatusBadge
                    status={b.is_current ? 'active' : 'inactive'}
                    label={b.is_current ? 'Atual' : 'Anterior'}
                  />
                </TD>
                <TD>
                  <RowActions>
                    <IconLink tone="edit" href={`/painel/bienios/${b.id}/editar`} title="Editar">
                      <Pencil className="w-4 h-4" />
                    </IconLink>
                    <IconButton
                      tone="delete"
                      onClick={() => setDeleteTarget({ id: b.id, label: b.name })}
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
        deleteUrl={(id) => `/painel/bienios/${id}`}
        entity="biênio"
      />
    </AdminLayout>
  )
}
