import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Edit, Trash2, Eye } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
  ConfirmDelete,
  CreateButton,
  IconButton,
  IconLink,
  Pagination,
  RowActions,
  SearchInput,
  Select,
  StatusBadge,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
  TableEmpty,
  Toolbar,
} from '~/components/admin/ui'

interface NewsItem {
  id: number
  title: string
  slug: string
  status: string
  published_at: string | null
  created_at: string
  views_count: number
  cover_image_url: string | null
  category?: { id: number; name: string } | null
  author?: { full_name: string } | null
}

interface Props {
  news: {
    data: NewsItem[]
    meta: {
      total: number
      per_page: number
      current_page: number
      last_page: number
    }
  }
  categories: Array<{ id: number; name: string; slug: string }>
  filters: { status: string; category: string; search: string }
}

export default function NewsIndex({ news, categories, filters }: Props) {
  const [search, setSearch] = useState(filters.search)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  function applyFilters(overrides: Record<string, string> = {}) {
    const params: Record<string, string> = {
      status: filters.status,
      category: filters.category,
      search,
      ...overrides,
    }
    // Remove empty
    const clean: Record<string, string> = {}
    for (const [k, v] of Object.entries(params)) {
      if (v) clean[k] = v
    }
    router.get('/painel/noticias', clean, { preserveState: true })
  }

  return (
    <AdminLayout title="Notícias">
      <Head title="Notícias - Painel" />

      {/* Filtros + ação */}
      <Toolbar>
        <SearchInput
          value={search}
          onChange={setSearch}
          onSearch={() => applyFilters({ search })}
          placeholder="Buscar notícias..."
          className="sm:w-72"
        />

        <Select value={filters.status} onChange={(e) => applyFilters({ status: e.target.value })}>
          <option value="">Todos</option>
          <option value="published">Publicadas</option>
          <option value="draft">Rascunhos</option>
          <option value="archived">Arquivadas</option>
        </Select>

        <Select
          value={filters.category}
          onChange={(e) => applyFilters({ category: e.target.value })}
          className="hidden sm:block"
        >
          <option value="">Categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </Select>

        <div className="sm:ml-auto">
          <CreateButton href="/painel/noticias/criar">Nova Notícia</CreateButton>
        </div>
      </Toolbar>

      {/* Table */}
      <Table footer={<Pagination meta={news.meta} baseUrl="/painel/noticias" itemLabel="notícia" />}>
        <THead>
          <TH>Título</TH>
          <TH className="hidden md:table-cell">Categoria</TH>
          <TH>Status</TH>
          <TH className="hidden sm:table-cell">Data</TH>
          <TH className="text-right">Ações</TH>
        </THead>
        <TBody>
          {news.data.length === 0 && (
            <TableEmpty colSpan={5}>Nenhuma notícia encontrada</TableEmpty>
          )}
          {news.data.map((item) => (
            <TR key={item.id}>
              <TD>
                <div className="flex items-center gap-3">
                  {item.cover_image_url && (
                    <img src={item.cover_image_url} alt="" className="w-10 h-10 rounded-lg object-cover hidden sm:block" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate max-w-xs">{item.title}</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">{item.author?.full_name}</p>
                  </div>
                </div>
              </TD>
              <TD className="hidden md:table-cell">
                {item.category ? (
                  <Badge tone="neutral">{item.category.name}</Badge>
                ) : (
                  <span className="text-xs text-muted-foreground/50">—</span>
                )}
              </TD>
              <TD>
                <StatusBadge status={item.status} />
              </TD>
              <TD className="hidden sm:table-cell">
                <span className="text-xs text-muted-foreground">
                  {new Date(item.published_at || item.created_at).toLocaleDateString('pt-BR')}
                </span>
              </TD>
              <TD>
                <RowActions>
                  {item.status === 'published' && (
                    <IconLink tone="view" href={`/noticias/${item.slug}`} target="_blank" title="Ver no site">
                      <Eye className="w-4 h-4" />
                    </IconLink>
                  )}
                  <IconLink tone="edit" href={`/painel/noticias/${item.id}/editar`} title="Editar">
                    <Edit className="w-4 h-4" />
                  </IconLink>
                  <IconButton
                    tone="delete"
                    onClick={() => setDeleteTarget({ id: item.id, label: item.title })}
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

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/noticias/${id}`}
        entity="notícia"
      />
    </AdminLayout>
  )
}
