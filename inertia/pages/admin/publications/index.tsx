import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
  ConfirmDelete,
  CreateButton,
  IconButton,
  IconLink,
  Pagination,
  RowActions,
  Select,
  Table,
  TableEmpty,
  TBody,
  TD,
  TH,
  THead,
  Toolbar,
  TR,
} from '~/components/admin/ui'

interface Publication {
  id: number
  title: string
  type: string
  number: string | null
  publication_date: string
  file_url: string | null
}

interface Props {
  publications: { data: Publication[]; meta: any }
  filters: { type: string }
}

const typeOptions = ['Portarias', 'Decretos', 'Resoluções', 'Leis', 'Atos', 'Contratos', 'Editais', 'Outros']

export default function PublicationsIndex({ publications, filters }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  return (
    <AdminLayout title="Publicações Oficiais">
      <Head title="Publicações - Painel" />

      <Toolbar className="sm:justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            {publications.meta?.total || publications.data.length} publicação(ões)
          </p>
          <div className="w-44">
            <Select
              value={filters.type}
              onChange={(e) => router.get('/painel/publicacoes', { type: e.target.value }, { preserveState: true })}
            >
              <option value="">Todos os tipos</option>
              {typeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
        </div>
        <CreateButton href="/painel/publicacoes/criar">Nova Publicação</CreateButton>
      </Toolbar>

      <Table
        footer={
          publications.meta ? (
            <Pagination
              meta={publications.meta}
              baseUrl={`/painel/publicacoes${filters.type ? `?type=${filters.type}` : ''}`}
              itemLabel="publicação"
              itemLabelPlural="publicações"
            />
          ) : undefined
        }
      >
        <THead>
          <TH>Data</TH>
          <TH>Título</TH>
          <TH>Tipo</TH>
          <TH>Nº</TH>
          <TH>Arquivo</TH>
          <TH className="text-right">Ações</TH>
        </THead>
        <TBody>
          {publications.data.length === 0 ? (
            <TableEmpty colSpan={6}>Nenhuma publicação cadastrada</TableEmpty>
          ) : (
            publications.data.map((p) => (
              <TR key={p.id}>
                <TD className="text-muted-foreground">
                  {new Date(p.publication_date).toLocaleDateString('pt-BR')}
                </TD>
                <TD className="font-medium">{p.title}</TD>
                <TD>
                  <Badge tone="navy">{p.type}</Badge>
                </TD>
                <TD className="text-muted-foreground">{p.number || '—'}</TD>
                <TD>
                  {p.file_url ? (
                    <a
                      href={p.file_url}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex text-sky hover:text-sky/80 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </TD>
                <TD>
                  <RowActions>
                    <IconLink tone="edit" href={`/painel/publicacoes/${p.id}/editar`} title="Editar">
                      <Pencil className="w-4 h-4" />
                    </IconLink>
                    <IconButton
                      tone="delete"
                      title="Excluir"
                      onClick={() => setDeleteTarget({ id: p.id, label: p.title })}
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
        deleteUrl={(id) => `/painel/publicacoes/${id}`}
        entity="publicação"
      />
    </AdminLayout>
  )
}
