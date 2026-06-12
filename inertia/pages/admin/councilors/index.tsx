import { Head } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Pencil, Trash2, Users } from 'lucide-react'
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

interface Councilor {
  id: number
  name: string
  slug: string
  party: string | null
  photo_url: string | null
  role: string | null
  is_active: boolean
  display_order: number
  legislature?: { name: string }
}

export default function CouncilorsIndex({ councilors }: { councilors: Councilor[] }) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  return (
    <AdminLayout title="Vereadores">
      <Head title="Vereadores - Painel" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {councilors.length} vereador(es) cadastrado(s)
        </p>
        <CreateButton href="/painel/vereadores/criar">Novo Vereador</CreateButton>
      </div>

      <Table>
        <THead>
          <TH>#</TH>
          <TH>Vereador</TH>
          <TH>Partido</TH>
          <TH>Cargo</TH>
          <TH>Status</TH>
          <TH className="text-right">Ações</TH>
        </THead>
        <TBody>
          {councilors.map((c) => (
            <TR key={c.id}>
              <TD className="text-muted-foreground">{c.display_order}</TD>
              <TD>
                <div className="flex items-center gap-3">
                  {c.photo_url ? (
                    <img
                      src={c.photo_url}
                      alt={c.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-navy/40" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.slug}</p>
                  </div>
                </div>
              </TD>
              <TD className="text-muted-foreground">{c.party || '—'}</TD>
              <TD className="text-muted-foreground">{c.role || '—'}</TD>
              <TD>
                <StatusBadge status={c.is_active ? 'active' : 'inactive'} />
              </TD>
              <TD>
                <RowActions>
                  <IconLink tone="edit" href={`/painel/vereadores/${c.id}/editar`} title="Editar">
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
          {councilors.length === 0 && (
            <TableEmpty colSpan={6}>Nenhum vereador cadastrado</TableEmpty>
          )}
        </TBody>
      </Table>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/vereadores/${id}`}
        entity="vereador"
      />
    </AdminLayout>
  )
}
