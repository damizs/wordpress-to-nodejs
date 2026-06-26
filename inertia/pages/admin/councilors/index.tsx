import { Head } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Pencil, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import {
  Avatar,
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

      <PageHeader
        variant="hero"
        icon={Users}
        eyebrow="Legislativo"
        title="Vereadores"
        description={`${councilors.length} vereador(es) cadastrado(s)`}
        actions={<CreateButton href="/painel/vereadores/criar">Novo Vereador</CreateButton>}
      />

      {councilors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum vereador cadastrado"
          description="Adicione o primeiro vereador para exibi-lo no portal."
          action={<CreateButton href="/painel/vereadores/criar">Novo Vereador</CreateButton>}
        />
      ) : (
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
                    <Avatar src={c.photo_url} name={c.name} size="md" />
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
          </TBody>
        </Table>
      )}

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/vereadores/${id}`}
        entity="vereador"
      />
    </AdminLayout>
  )
}
