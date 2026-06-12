import { Head } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Pencil, Trash2 } from 'lucide-react'
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

interface Props {
  biennia: any[]
}

export default function BienniaIndex({ biennia }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  return (
    <AdminLayout title="Biênios">
      <Head title="Biênios - Painel" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">Gerencie os biênios da mesa diretora</p>
        <CreateButton href="/painel/bienios/criar">Novo Biênio</CreateButton>
      </div>

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
                {b.is_current ? (
                  <Badge tone="success">Atual</Badge>
                ) : (
                  <Badge tone="neutral">Anterior</Badge>
                )}
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
          {biennia.length === 0 && (
            <TableEmpty colSpan={6}>Nenhum biênio cadastrado.</TableEmpty>
          )}
        </TBody>
      </Table>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/bienios/${id}`}
        entity="biênio"
      />
    </AdminLayout>
  )
}
