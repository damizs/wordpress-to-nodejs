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

export default function QuickLinksIndex({ links }: { links: any[] }) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  return (
    <AdminLayout title="Links Rápidos">
      <Head title="Links Rápidos - Painel" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {links.length} link(s) — exibidos na homepage como cards de acesso rápido
        </p>
        <CreateButton href="/painel/links-rapidos/criar">Novo Link</CreateButton>
      </div>

      <Table>
        <THead>
          <TH className="w-12">#</TH>
          <TH>Título</TH>
          <TH>URL</TH>
          <TH>Ícone</TH>
          <TH>Status</TH>
          <TH className="text-right">Ações</TH>
        </THead>
        <TBody>
          {links.length === 0 ? (
            <TableEmpty colSpan={6}>Nenhum link cadastrado</TableEmpty>
          ) : (
            links.map((l: any) => (
              <TR key={l.id}>
                <TD className="text-muted-foreground">{l.display_order}</TD>
                <TD className="font-medium">{l.title}</TD>
                <TD className="text-sky truncate max-w-xs">{l.url}</TD>
                <TD className="text-muted-foreground font-mono">{l.icon || '—'}</TD>
                <TD>
                  <StatusBadge status={l.is_active ? 'active' : 'inactive'} />
                </TD>
                <TD>
                  <RowActions>
                    <IconLink tone="edit" href={`/painel/links-rapidos/${l.id}/editar`} title="Editar">
                      <Pencil className="w-4 h-4" />
                    </IconLink>
                    <IconButton
                      tone="delete"
                      title="Excluir"
                      onClick={() => setDeleteTarget({ id: l.id, label: l.title })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </IconButton>
                  </RowActions>
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/links-rapidos/${id}`}
        entity="link"
      />
    </AdminLayout>
  )
}
