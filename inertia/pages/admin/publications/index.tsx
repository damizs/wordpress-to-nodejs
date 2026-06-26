import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Pencil, Trash2, ExternalLink, BookOpen } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
  ConfirmDelete,
  CreateButton,
  EmptyState,
  IconButton,
  IconLink,
  PageHeader,
  Pagination,
  RowActions,
  Select,
  Table,
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
  const total = publications.meta?.total || publications.data.length

  return (
    <AdminLayout title="Publicações Oficiais">
      <Head title="Publicações - Painel" />

      <PageHeader
        title="Publicações Oficiais"
        description={`${total} publicação${total === 1 ? '' : 'ões'} cadastrada${total === 1 ? '' : 's'} no portal.`}
        icon={BookOpen}
        eyebrow="Diário Oficial"
        variant="hero"
        actions={<CreateButton href="/painel/publicacoes/criar">Nova Publicação</CreateButton>}
      />

      <Toolbar>
        <Select
          value={filters.type}
          onChange={(e) =>
            router.get('/painel/publicacoes', { type: e.target.value }, { preserveState: true })
          }
        >
          <option value="">Todos os tipos</option>
          {typeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </Toolbar>

      {publications.data.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhuma publicação cadastrada"
          description="Cadastre portarias, decretos, resoluções e demais publicações oficiais."
          action={<CreateButton href="/painel/publicacoes/criar">Nova Publicação</CreateButton>}
        />
      ) : (
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
            {publications.data.map((p) => (
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
            ))}
          </TBody>
        </Table>
      )}

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/publicacoes/${id}`}
        entity="publicação"
      />
    </AdminLayout>
  )
}
