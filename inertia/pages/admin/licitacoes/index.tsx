import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  CalendarDays,
  FolderKanban,
  Gavel,
  Pencil,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  ConfirmDelete,
  CreateButton,
  IconButton,
  IconLink,
  Input,
  PageHeader,
  Pagination,
  RowActions,
  Select,
  StatCard,
  StatusBadge,
  Table,
  TableEmpty,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '~/components/admin/ui'

interface Licitacao {
  id: number
  title: string
  number?: string | null
  modality?: string | null
  status: string
  opening_date?: string | null
  year?: number | null
  object?: string | null
}

interface Props {
  licitacoes: {
    data: Licitacao[]
    meta: {
      total: number
      per_page?: number
      current_page: number
      last_page: number
    }
  }
  filters: { status: string; modality: string; search: string }
}

const modalityLabels: Record<string, string> = {
  dispensa: 'Dispensa',
  inexigibilidade: 'Inexigibilidade',
  pregao: 'Pregao',
  tomada_precos: 'Tomada de precos',
  concorrencia: 'Concorrencia',
  convite: 'Convite',
  leilao: 'Leilao',
  concurso: 'Concurso',
}

function labelModality(value?: string | null) {
  if (!value) return '-'
  return modalityLabels[value] || value.replaceAll('_', ' ')
}

function buildBaseUrl(filters: Props['filters']) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.modality) params.set('modality', filters.modality)
  if (filters.search) params.set('search', filters.search)
  const query = params.toString()
  return `/painel/licitacoes${query ? `?${query}` : ''}`
}


function LicitacaoCard({
  item,
  onDelete,
}: {
  item: Licitacao
  onDelete: (target: { id: number; label: string }) => void
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={item.status} />
            {item.number && <Badge tone="neutral">No {item.number}</Badge>}
          </div>
          <h3 className="mt-2 text-sm font-bold leading-snug text-foreground">{item.title}</h3>
          {item.object && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.object}</p>}
        </div>
        <RowActions>
          <IconLink tone="edit" href={`/painel/licitacoes/${item.id}/editar`} title="Editar">
            <Pencil className="h-4 w-4" />
          </IconLink>
          <IconButton
            tone="delete"
            title="Excluir"
            onClick={() => onDelete({ id: item.id, label: item.title })}
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </RowActions>
      </div>
      <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <span>Modalidade: {labelModality(item.modality)}</span>
        <span>Abertura: {item.opening_date || '-'}</span>
        <span>Ano: {item.year || '-'}</span>
      </div>
    </article>
  )
}

export default function LicitacoesIndex({ licitacoes, filters }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)
  const [search, setSearch] = useState(filters.search || '')

  const rows = licitacoes.data || []
  const openCount = useMemo(
    () => rows.filter((item) => ['aberta', 'em_andamento'].includes(item.status)).length,
    [rows]
  )
  const withDate = rows.filter((item) => Boolean(item.opening_date)).length

  function applyFilters(patch: Partial<Props['filters']>) {
    const next = { ...filters, ...patch }
    const params: Record<string, string> = {}
    if (next.status) params.status = next.status
    if (next.modality) params.modality = next.modality
    if (next.search) params.search = next.search
    router.get('/painel/licitacoes', params, { preserveState: true })
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    applyFilters({ search })
  }

  function clearFilters() {
    setSearch('')
    router.get('/painel/licitacoes', {}, { preserveState: true })
  }

  return (
    <AdminLayout title="Licitacoes">
      <Head title="Licitacoes - Painel" />

      <PageHeader
        title="Licitações"
        description="Acompanhe processos licitatórios, modalidades, status de abertura e documentos anexados para publicação no portal."
        icon={Gavel}
        eyebrow="Transparência — Contratações Públicas"
        variant="hero"
        actions={<CreateButton href="/painel/licitacoes/criar">Nova licitação</CreateButton>}
      />

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <StatCard
          label="Registros"
          value={licitacoes.meta.total}
          hint="Processos encontrados nos filtros atuais"
          icon={Gavel}
        />
        <StatCard
          label="Abertas"
          value={openCount}
          hint="Itens visiveis abertos ou em andamento"
          icon={FolderKanban}
        />
        <StatCard
          label="Com data"
          value={withDate}
          hint="Processos da pagina com abertura definida"
          icon={CalendarDays}
        />
      </div>

      <section className="mb-5 rounded-xl border border-border bg-card p-4 shadow-sm">
        <form
          className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_210px_210px_auto_auto]"
          onSubmit={submitSearch}
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por titulo, numero ou objeto"
              className="h-11 pl-9"
            />
          </div>
          <Select
            value={filters.status}
            onChange={(e) => applyFilters({ status: e.target.value })}
            className="h-11"
          >
            <option value="">Todos os status</option>
            <option value="aberta">Aberta</option>
            <option value="em_andamento">Em andamento</option>
            <option value="encerrada">Encerrada</option>
            <option value="deserta">Deserta</option>
            <option value="revogada">Revogada</option>
            <option value="suspensa">Suspensa</option>
          </Select>
          <Select
            value={filters.modality}
            onChange={(e) => applyFilters({ modality: e.target.value })}
            className="h-11"
          >
            <option value="">Todas modalidades</option>
            {Object.entries(modalityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary" className="h-11">
            Filtrar
          </Button>
          {(filters.status || filters.modality || filters.search) && (
            <Button type="button" variant="ghost" className="h-11" onClick={clearFilters}>
              <X className="h-4 w-4" />
              Limpar
            </Button>
          )}
        </form>
      </section>

      <div className="space-y-3 lg:hidden">
        {rows.map((item) => (
          <LicitacaoCard key={item.id} item={item} onDelete={setDeleteTarget} />
        ))}
        {rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Nenhuma licitacao encontrada.
          </div>
        )}
        <Pagination meta={licitacoes.meta} baseUrl={buildBaseUrl(filters)} itemLabel="licitacao" />
      </div>

      <Table
        className="hidden lg:block"
        footer={<Pagination meta={licitacoes.meta} baseUrl={buildBaseUrl(filters)} itemLabel="licitacao" />}
      >
        <THead>
          <TH>Titulo</TH>
          <TH>Modalidade</TH>
          <TH>Status</TH>
          <TH>Abertura</TH>
          <TH className="text-right">Acoes</TH>
        </THead>
        <TBody>
          {rows.map((l) => (
            <TR key={l.id}>
              <TD>
                <div className="font-medium text-foreground">{l.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {l.number && <Badge tone="neutral">No {l.number}</Badge>}
                  {l.year && <span className="text-xs text-muted-foreground">{l.year}</span>}
                </div>
              </TD>
              <TD className="text-muted-foreground capitalize">{labelModality(l.modality)}</TD>
              <TD>
                <StatusBadge status={l.status} />
              </TD>
              <TD className="text-muted-foreground">{l.opening_date || '-'}</TD>
              <TD>
                <RowActions>
                  <IconLink tone="edit" href={`/painel/licitacoes/${l.id}/editar`} title="Editar">
                    <Pencil className="h-4 w-4" />
                  </IconLink>
                  <IconButton
                    tone="delete"
                    title="Excluir"
                    onClick={() => setDeleteTarget({ id: l.id, label: l.title })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </RowActions>
              </TD>
            </TR>
          ))}
          {rows.length === 0 && <TableEmpty colSpan={5}>Nenhuma licitacao cadastrada.</TableEmpty>}
        </TBody>
      </Table>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/licitacoes/${id}`}
        entity="licitacao"
      />
    </AdminLayout>
  )
}
