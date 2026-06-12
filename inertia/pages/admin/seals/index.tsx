import { Head } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Pencil, Trash2, Award } from 'lucide-react'
import { useState } from 'react'
import {
  ConfirmDelete,
  CreateButton,
  EmptyState,
  ButtonLink,
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

interface Seal {
  id: number
  title: string
  description: string | null
  image_url: string | null
  link_url: string | null
  sort_order: number
  is_active: boolean
}

interface Props {
  seals: Seal[]
}

export default function SealsIndex({ seals }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  return (
    <AdminLayout title="Selos e Certificações">
      <Head title="Selos - Painel" />
      <PageHeader
        title="Selos e Certificações"
        description="Gerencie os selos exibidos na homepage"
        actions={<CreateButton href="/painel/selos/novo">Novo Selo</CreateButton>}
      />

      {seals.length === 0 ? (
        <EmptyState
          icon={Award}
          title="Nenhum selo cadastrado"
          action={
            <ButtonLink href="/painel/selos/novo">
              <Plus className="w-4 h-4" /> Adicionar Selo
            </ButtonLink>
          }
        />
      ) : (
        <Table>
          <THead>
            <TH>Imagem</TH>
            <TH>Título</TH>
            <TH>Status</TH>
            <TH className="text-right">Ações</TH>
          </THead>
          <TBody>
            {seals.map((seal) => (
              <TR key={seal.id}>
                <TD>
                  {seal.image_url ? (
                    <img
                      src={seal.image_url}
                      alt={seal.title}
                      className="w-16 h-16 object-contain rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                      <Award className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                  )}
                </TD>
                <TD>
                  <p className="font-medium text-foreground">{seal.title}</p>
                  {seal.description && (
                    <p className="text-sm text-muted-foreground">{seal.description}</p>
                  )}
                </TD>
                <TD>
                  <StatusBadge status={seal.is_active ? 'active' : 'inactive'} />
                </TD>
                <TD>
                  <RowActions>
                    <IconLink tone="edit" href={`/painel/selos/${seal.id}/editar`} title="Editar">
                      <Pencil className="w-4 h-4" />
                    </IconLink>
                    <IconButton
                      tone="delete"
                      onClick={() => setDeleteTarget({ id: seal.id, label: seal.title })}
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
        deleteUrl={(id) => `/painel/selos/${id}`}
        entity="selo"
      />
    </AdminLayout>
  )
}
