import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Eye, FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  ButtonLink,
  ConfirmDelete,
  CreateButton,
  EmptyState,
  IconButton,
  IconLink,
  PageHeader,
  Pagination,
  RowActions,
  SearchInput,
  StatusBadge,
  Table,
  TableEmpty,
  TBody,
  TD,
  TH,
  THead,
  Toolbar,
  TR,
} from '~/components/admin/ui'

interface PageRow {
  id: number
  title: string
  slug: string
  is_published: boolean
  updated_at: string | null
}

interface Props {
  pages: {
    data: PageRow[]
    meta: { total: number; current_page: number; last_page: number; per_page: number }
  }
  filters: { search: string }
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PagesIndex({ pages, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '')
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  const applySearch = () => {
    router.get('/painel/paginas', search ? { search } : {}, { preserveState: true })
  }

  return (
    <AdminLayout title="Páginas">
      <Head title="Páginas - Painel" />
      <PageHeader
        title="Páginas"
        description="Páginas de conteúdo livre do portal, montadas com blocos"
        actions={<CreateButton href="/painel/paginas/nova">Nova Página</CreateButton>}
      />

      {pages.meta.total === 0 && !filters.search ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma página criada"
          description="Crie páginas de conteúdo livre (institucionais, informativos, serviços) com o editor de blocos."
          action={
            <ButtonLink href="/painel/paginas/nova">
              <Plus className="w-4 h-4" /> Criar Página
            </ButtonLink>
          }
        />
      ) : (
        <>
          <Toolbar>
            <SearchInput
              value={search}
              onChange={setSearch}
              onSearch={applySearch}
              placeholder="Buscar por título ou slug..."
              className="sm:max-w-sm"
            />
          </Toolbar>

          <Table
            footer={
              <Pagination
                meta={pages.meta}
                baseUrl={`/painel/paginas${search ? `?search=${encodeURIComponent(search)}` : ''}`}
                itemLabel="página"
              />
            }
          >
            <THead>
              <TH>Título</TH>
              <TH>Slug</TH>
              <TH>Status</TH>
              <TH>Atualizada em</TH>
              <TH className="text-right">Ações</TH>
            </THead>
            <TBody>
              {pages.data.length === 0 ? (
                <TableEmpty colSpan={5}>Nenhuma página encontrada para a busca.</TableEmpty>
              ) : (
                pages.data.map((page) => (
                  <TR key={page.id}>
                    <TD>
                      <p className="font-medium text-foreground">{page.title}</p>
                    </TD>
                    <TD>
                      <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        /{page.slug}
                      </code>
                    </TD>
                    <TD>
                      <StatusBadge status={page.is_published ? 'published' : 'draft'} />
                    </TD>
                    <TD className="text-muted-foreground whitespace-nowrap">
                      {formatDate(page.updated_at)}
                    </TD>
                    <TD>
                      <RowActions>
                        <IconLink
                          tone="view"
                          href={`/${page.slug}`}
                          target="_blank"
                          title="Ver no site"
                        >
                          <Eye className="w-4 h-4" />
                        </IconLink>
                        <IconLink
                          tone="edit"
                          href={`/painel/paginas/${page.id}/editar`}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </IconLink>
                        <IconButton
                          tone="delete"
                          onClick={() => setDeleteTarget({ id: page.id, label: page.title })}
                          title="Excluir"
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
        </>
      )}

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/paginas/${id}`}
        entity="página"
      />
    </AdminLayout>
  )
}
