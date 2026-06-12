import { Head } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
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

interface Legislature {
  id: number
  name: string
  number: number
  start_date: string
  end_date: string
  is_current: boolean
  councilors_count: number
  biennia_count: number
}

export default function LegislaturesIndex({ legislatures }: { legislatures: Legislature[] }) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  return (
    <AdminLayout title="Legislaturas">
      <Head title="Legislaturas - Painel" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">{legislatures.length} legislatura(s)</p>
        <CreateButton href="/painel/legislaturas/criar">Nova Legislatura</CreateButton>
      </div>

      <Table>
        <THead>
          <TH>Nº</TH>
          <TH>Nome</TH>
          <TH>Período</TH>
          <TH>Vereadores</TH>
          <TH>Status</TH>
          <TH className="text-right">Ações</TH>
        </THead>
        <TBody>
          {legislatures.map((l) => (
            <TR key={l.id}>
              <TD className="font-medium">{l.number}ª</TD>
              <TD>{l.name}</TD>
              <TD className="text-muted-foreground">
                {new Date(l.start_date).toLocaleDateString('pt-BR')} —{' '}
                {new Date(l.end_date).toLocaleDateString('pt-BR')}
              </TD>
              <TD className="text-muted-foreground">{l.councilors_count}</TD>
              <TD>
                <StatusBadge
                  status={l.is_current ? 'active' : 'inactive'}
                  label={l.is_current ? 'Atual' : 'Encerrada'}
                />
              </TD>
              <TD>
                <RowActions>
                  <IconLink tone="edit" href={`/painel/legislaturas/${l.id}/editar`} title="Editar">
                    <Pencil className="w-4 h-4" />
                  </IconLink>
                  <IconButton
                    tone="delete"
                    onClick={() => setDeleteTarget({ id: l.id, label: l.name })}
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </RowActions>
              </TD>
            </TR>
          ))}
          {legislatures.length === 0 && (
            <TableEmpty colSpan={6}>Nenhuma legislatura cadastrada</TableEmpty>
          )}
        </TBody>
      </Table>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/legislaturas/${id}`}
        entity="legislatura"
      />
    </AdminLayout>
  )
}
