import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Eye, FileText, Info, LayoutList, Pencil, Plus, Settings, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  ButtonLink,
  Card,
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

const MANAGED_PAGES = [
  { title: 'Homepage', description: 'Seções da página inicial, destaques e ordem do conteúdo.', href: '/painel/homepage' },
  { title: 'História, Sobre e Institucional', description: 'Textos institucionais usados nas páginas fixas do portal.', href: '/painel/institucional' },
  { title: 'Aparência e identidade', description: 'Logo, favicon, tela de login, cores, modelos e rodapé.', href: '/painel/aparencia' },
  { title: 'Menus do site', description: 'Itens do cabeçalho, rodapé e atalhos do portal.', href: '/painel/menus' },
  { title: 'Acesso à Informação', description: 'Páginas PNTP/LAI, documentos, PDFs e links oficiais.', href: '/painel/acesso-informacao' },
  { title: 'Transparência', description: 'Categorias, links externos, modal e organização da transparência.', href: '/painel/transparencia' },
]

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
        icon={FileText}
        eyebrow="Site"
        actions={<CreateButton href="/painel/paginas/nova">Nova Página</CreateButton>}
      />

      <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.45fr)]">
        <Card className="border-navy bg-navy text-white">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gold">
              <Info className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold">Por que só aparece uma página aqui?</h2>
              <p className="mt-1 max-w-5xl text-sm leading-relaxed text-white/75">
                Esta tela lista apenas páginas livres, criadas com blocos. Páginas como vereadores,
                licitações, transparência, história e perguntas frequentes são módulos próprios,
                porque têm dados, regras e telas específicas.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/15 text-gold">
              <LayoutList className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Páginas gerenciadas por módulo</h2>
              <p className="text-xs text-muted-foreground">Atalhos para alterar o restante do site.</p>
            </div>
          </div>
          <div className="grid gap-2">
            {MANAGED_PAGES.map((item) => (
              <ButtonLink key={item.href} href={item.href} variant="secondary" className="justify-start !whitespace-normal text-left">
                <Settings className="h-4 w-4 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold">{item.title}</span>
                  <span className="block text-xs font-normal text-muted-foreground">{item.description}</span>
                </span>
              </ButtonLink>
            ))}
          </div>
        </Card>
      </div>

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
                      <code className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                        /{page.slug}
                      </code>
                    </TD>
                    <TD>
                      <StatusBadge status={page.is_published ? 'published' : 'draft'} />
                    </TD>
                    <TD className="whitespace-nowrap text-muted-foreground">
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
