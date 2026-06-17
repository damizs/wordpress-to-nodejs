import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  Archive,
  Calendar,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  FolderTree,
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
  EmptyState,
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
  TR,
} from '~/components/admin/ui'

interface InfoRecord {
  id: number
  title: string
  category: string
  year: number
  file_url: string | null
  is_active: boolean
}

interface Props {
  records: { data: InfoRecord[]; meta: any }
  filters: { category: string; year: string; q?: string }
}

const categoryLabels: Record<string, string> = {
  verbas: 'Verbas Indenizatórias',
  estagiarios: 'Estagiários',
  terceirizados: 'Terceirizados',
  rgf: 'RGF - Relatório Gestão Fiscal',
  'relatorio-gestao': 'Relatório de Gestão',
  'prestacao-contas': 'Prestação de Contas',
  'transferencias-recebidas': 'Transferências Recebidas',
  'transferencias-realizadas': 'Transferências Realizadas',
  'parecer-contas': 'Parecer das Contas',
  obras: 'Obras',
  acordos: 'Acordos e Convênios',
  apreciacao: 'Apreciação de Contas',
  'plano-estrategico': 'Plano Estratégico',
  concursos: 'Concursos',
  pca: 'Plano de Contratações',
  'estrutura-organizacional': 'Estrutura Organizacional',
  'carta-servicos': 'Carta de Serviços',
}

function categoryLabel(slug: string) {
  return categoryLabels[slug] || slug
}

function buildQuery(filters: Props['filters'], patch: Partial<Props['filters']>) {
  const merged = { ...filters, ...patch }
  const query: Record<string, string> = {}
  if (merged.category) query.category = merged.category
  if (merged.year) query.year = merged.year
  if (merged.q?.trim()) query.q = merged.q.trim()
  return query
}

function baseUrl(filters: Props['filters']) {
  const query = buildQuery(filters, {})
  const params = new URLSearchParams(query).toString()
  return params ? `/painel/acesso-informacao?${params}` : '/painel/acesso-informacao'
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Archive
  label: string
  value: string | number
  hint: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy/10 text-navy">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

function MobileRecordCard({
  record,
  onDelete,
}: {
  record: InfoRecord
  onDelete: (record: InfoRecord) => void
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{record.year}</Badge>
            <Badge tone={record.file_url ? 'success' : 'warning'}>
              {record.file_url ? 'Com arquivo' : 'Sem arquivo'}
            </Badge>
          </div>
          <h2 className="text-sm font-bold leading-snug text-foreground">{record.title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{categoryLabel(record.category)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
        {record.file_url ? (
          <a
            href={record.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky/10 px-3 py-2 text-xs font-semibold text-sky no-underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Abrir arquivo
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">Sem PDF vinculado</span>
        )}
        <RowActions>
          <IconLink tone="edit" href={`/painel/acesso-informacao/${record.id}/editar`} title="Editar">
            <Pencil className="h-4 w-4" />
          </IconLink>
          <IconButton tone="delete" title="Excluir" onClick={() => onDelete(record)}>
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </RowActions>
      </div>
    </article>
  )
}

export default function InformationRecordsIndex({ records, filters }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)
  const [search, setSearch] = useState(filters.q || '')
  const total = records.meta?.total || records.data.length
  const currentCount = records.data.length
  const withFileCount = records.data.filter((record) => !!record.file_url).length
  const activeFilters = Boolean(filters.category || filters.year || filters.q)

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const fromRows = records.data.map((record) => record.year).filter(Boolean)
    return Array.from(new Set([currentYear, currentYear - 1, ...fromRows])).sort((a, b) => b - a)
  }, [records.data])

  function applyFilters(patch: Partial<Props['filters']>) {
    router.get('/painel/acesso-informacao', buildQuery(filters, patch), {
      preserveScroll: true,
      preserveState: true,
    })
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    applyFilters({ q: search })
  }

  function clearFilters() {
    setSearch('')
    router.get('/painel/acesso-informacao', {}, { preserveScroll: true })
  }

  return (
    <AdminLayout title="Acesso à Informação">
      <Head title="Acesso à Informação - Painel" />

      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold text-navy">
                <FolderTree className="h-3.5 w-3.5" />
                Transparência ativa
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Registros de Acesso à Informação</h1>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Organize PDFs, conteúdos e links usados nas páginas públicas de transparência. Use filtros
                para revisar rapidamente categorias, anos e registros sem arquivo vinculado.
              </p>
            </div>
            <CreateButton href="/painel/acesso-informacao/criar">Novo registro</CreateButton>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard icon={Archive} label="Total" value={total} hint="Registros cadastrados no acervo" />
            <StatCard icon={FileCheck2} label="Nesta página" value={currentCount} hint="Itens visíveis com os filtros atuais" />
            <StatCard icon={FileText} label="Com arquivo" value={withFileCount} hint="PDFs ou anexos na página atual" />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filtros
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(16rem,1fr)_16rem_10rem_auto]">
            <form onSubmit={submitSearch} className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por título, conteúdo ou categoria"
                className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-navy focus:ring-2 focus:ring-navy/20"
              />
            </form>
            <Select
              value={filters.category}
              onChange={(event) => applyFilters({ category: event.target.value })}
            >
              <option value="">Todas as categorias</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </Select>
            <Select value={filters.year} onChange={(event) => applyFilters({ year: event.target.value })}>
              <option value="">Todos os anos</option>
              {years.map((year) => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </Select>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" className="flex-1 lg:flex-none" onClick={() => applyFilters({ q: search })}>
                Filtrar
              </Button>
              {activeFilters && (
                <Button type="button" variant="ghost" className="flex-1 lg:flex-none" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                  Limpar
                </Button>
              )}
            </div>
          </div>
        </section>

        {records.data.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum registro encontrado"
            description="Ajuste os filtros ou cadastre um novo item de acesso à informação."
            action={<CreateButton href="/painel/acesso-informacao/criar">Novo registro</CreateButton>}
          />
        ) : (
          <>
            <div className="grid gap-3 lg:hidden">
              {records.data.map((record) => (
                <MobileRecordCard
                  key={record.id}
                  record={record}
                  onDelete={(item) => setDeleteTarget({ id: item.id, label: item.title })}
                />
              ))}
            </div>

            <Table
              className="hidden lg:block"
              footer={
                <Pagination
                  meta={records.meta}
                  baseUrl={baseUrl(filters)}
                  itemLabel="registro"
                  itemLabelPlural="registros"
                />
              }
            >
              <THead>
                <TH className="w-24">Ano</TH>
                <TH>Título</TH>
                <TH>Categoria</TH>
                <TH className="w-36">Arquivo</TH>
                <TH className="w-28 text-right">Ações</TH>
              </THead>
              <TBody>
                {records.data.length === 0 ? (
                  <TableEmpty colSpan={5}>Nenhum registro cadastrado</TableEmpty>
                ) : (
                  records.data.map((record) => (
                    <TR key={record.id}>
                      <TD>
                        <Badge tone="neutral">
                          <Calendar className="h-3 w-3" />
                          {record.year}
                        </Badge>
                      </TD>
                      <TD>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{record.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">ID #{record.id}</p>
                        </div>
                      </TD>
                      <TD>
                        <Badge tone="navy">{categoryLabel(record.category)}</Badge>
                      </TD>
                      <TD>
                        {record.file_url ? (
                          <a
                            href={record.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-sky/10 px-2.5 py-1.5 text-xs font-semibold text-sky no-underline hover:bg-sky/15"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Abrir
                          </a>
                        ) : (
                          <Badge tone="warning">Sem arquivo</Badge>
                        )}
                      </TD>
                      <TD>
                        <RowActions>
                          <IconLink tone="edit" href={`/painel/acesso-informacao/${record.id}/editar`} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </IconLink>
                          <IconButton
                            tone="delete"
                            title="Excluir"
                            onClick={() => setDeleteTarget({ id: record.id, label: record.title })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </RowActions>
                      </TD>
                    </TR>
                  ))
                )}
              </TBody>
            </Table>

            {records.meta?.last_page > 1 && (
              <div className="lg:hidden">
                <Pagination
                  meta={records.meta}
                  baseUrl={baseUrl(filters)}
                  itemLabel="registro"
                  itemLabelPlural="registros"
                />
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/acesso-informacao/${id}`}
        entity="registro"
      />
    </AdminLayout>
  )
}
