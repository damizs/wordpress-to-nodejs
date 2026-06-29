import { Head, Link, router, usePage } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Download,
  Eye,
  ExternalLink,
  FileText,
  FileJson,
  FolderTree,
  Layers,
  Link2,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Settings2,
  Tags,
  Trash2,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  Badge,
  Button,
  ButtonLink,
  ConfirmDelete,
  EmptyState,
  IconButton,
  IconLink,
  Modal,
  PageHeader,
  Pagination,
  RowActions,
  Select,
  StatCard,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '~/components/admin/ui'
import { SafeHtml } from '~/components/SafeHtml'

interface CategoryItem {
  id: number
  name: string
  slug: string
  grupo: string | null
  count: number
}

interface Stats {
  totalCategories: number
  filledCategories: number
  emptyCategories: number
  progress: number
}

interface InfoRecord {
  id: number
  title: string
  category: string
  year: number
  content: string | null
  reference_date: string | null
  file_url: string | null
  is_active: boolean
  open_mode?: string | null
  hide_chrome?: boolean | null
  updated_at: string | null
}

interface SelectedCategory {
  id: number | null
  name: string
  slug: string
  grupo: string | null
  count: number
}

interface Props {
  categories: CategoryItem[]
  stats: Stats
  selectedCategory: SelectedCategory | null
  records: { data: InfoRecord[]; meta: any } | null
  years: number[]
  filters: { category: string; year: string; q: string }
  latestUpdate?: string | null
  categoryLatestUpdate?: string | null
}

const SEM_GRUPO = 'Outras categorias'

function formatDateTime(value: string | null): string {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return '—'
  }
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(value))
  } catch {
    return '—'
  }
}

function previewUrl(record: InfoRecord) {
  if (!record.file_url) return null
  if (record.file_url.startsWith('/') && !record.file_url.startsWith('/uploads/') && record.hide_chrome !== false) {
    const separator = record.file_url.includes('?') ? '&' : '?'
    return `${record.file_url}${separator}embed=1`
  }
  return record.file_url
}

function freshness(value: string | null) {
  if (!value) return { label: 'Sem data', tone: 'warning' as const }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { label: 'Sem data', tone: 'warning' as const }
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86_400_000)
  if (diffDays > 90) return { label: 'Desatualizado', tone: 'warning' as const }
  return { label: 'Atualizado', tone: 'success' as const }
}

/* ============================== Visão geral ============================== */

function Overview({
  categories,
  stats,
  canManageCategories,
  latestUpdate,
}: {
  categories: CategoryItem[]
  stats: Stats
  canManageCategories: boolean
  latestUpdate?: string | null
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, CategoryItem[]>()
    for (const c of categories) {
      const key = c.grupo?.trim() || SEM_GRUPO
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(c)
    }
    return Array.from(map.entries())
  }, [categories])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Acesso à Informação"
        description="Visão geral das categorias do PNTP. Selecione uma dimensão para gerenciar seus registros."
        icon={FolderTree}
        eyebrow="Transparência ativa"
        variant="hero"
        actions={
          canManageCategories ? (
            <Link
              href="/painel/acesso-informacao/categorias"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white no-underline transition-colors hover:bg-white/20"
            >
              <Settings2 className="h-4 w-4" /> Gerenciar categorias
            </Link>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Clock3 className="h-4 w-4 text-gold" />
          <span className="font-semibold">Atualizado em</span>
          <span className="text-muted-foreground">{formatDateTime(latestUpdate || null)}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Referência do registro PNTP/LAI mais recente no painel.
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Tags} label="Categorias" value={stats.totalCategories} hint="Seções PNTP" />
        <StatCard
          icon={CheckCircle2}
          label="Com registros"
          value={stats.filledCategories}
          hint="Categorias preenchidas"
        />
        <StatCard
          icon={CircleDashed}
          label="Vazias"
          value={stats.emptyCategories}
          hint="Sem nenhum registro"
        />
        <StatCard
          icon={Activity}
          label="Progresso"
          value={`${stats.progress}%`}
          hint="Cobertura das categorias"
        />
      </div>

      {/* Barra de progresso */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            {stats.filledCategories} de {stats.totalCategories} categorias preenchidas
          </span>
          <span className="font-bold text-navy dark:text-navy-light">{stats.progress}%</span>
        </div>
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={stats.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-hero transition-all"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
      </section>

      {/* Grid agrupado por dimensão */}
      {categories.length === 0 ? (
        <EmptyState
          icon={FolderTree}
          title="Nenhuma categoria ativa"
          description="Crie categorias de Acesso à Informação para começar a organizar os registros."
          action={
            canManageCategories ? (
              <ButtonLink href="/painel/acesso-informacao/categorias">
                <Settings2 className="h-4 w-4" /> Gerenciar categorias
              </ButtonLink>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-6">
          {grouped.map(([grupo, items]) => (
            <section key={grupo}>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy/10 text-navy dark:text-navy-light">
                  <Layers className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  {grupo}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c) => (
                  <Link
                    key={c.id}
                    href={`/painel/acesso-informacao?category=${encodeURIComponent(c.slug)}`}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 no-underline shadow-sm transition-all hover:border-navy/30 hover:shadow-md"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        aria-hidden="true"
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          c.count > 0 ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground group-hover:text-navy dark:group-hover:text-navy-light">
                          {c.name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {c.count > 0 ? `${c.count} registro(s)` : 'Sem registros'}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge tone={c.count > 0 ? 'success' : 'warning'}>
                        {c.count > 0 ? 'Com registros' : 'Vazio'}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

/* ============================== Listagem de uma categoria ============================== */

function MobileRecordCard({
  record,
  onDelete,
  onPreview,
}: {
  record: InfoRecord
  onDelete: (record: InfoRecord) => void
  onPreview: (record: InfoRecord) => void
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge tone="neutral">
          <Calendar className="h-3 w-3" />
          {record.year}
        </Badge>
        <Badge tone={record.is_active ? 'success' : 'neutral'}>
          {record.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
        <Badge tone={record.file_url ? 'info' : 'warning'}>
          {record.file_url ? 'Com anexo' : 'Sem anexo'}
        </Badge>
      </div>
      <h2 className="text-sm font-bold leading-snug text-foreground">{record.title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Atualizado em {formatDateTime(record.updated_at)}
      </p>

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
          <IconButton tone="view" title="Visualizar" onClick={() => onPreview(record)}>
            <Eye className="h-4 w-4" />
          </IconButton>
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

function CategoryListing({
  selectedCategory,
  categories,
  records,
  years,
  filters,
  onDelete,
  categoryLatestUpdate,
}: {
  selectedCategory: SelectedCategory
  categories: CategoryItem[]
  records: { data: InfoRecord[]; meta: any }
  years: number[]
  filters: Props['filters']
  onDelete: (record: InfoRecord) => void
  categoryLatestUpdate?: string | null
}) {
  const [search, setSearch] = useState(filters.q || '')
  const [previewRecord, setPreviewRecord] = useState<InfoRecord | null>(null)
  const fresh = freshness(categoryLatestUpdate || null)
  const totalRecords = Number(records.meta?.total ?? records.data.length)

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear()
    return Array.from(new Set([current, current - 1, ...years])).sort((a, b) => b - a)
  }, [years])

  function applyFilters(patch: Partial<Props['filters']>) {
    const merged = { ...filters, ...patch }
    const query: Record<string, string> = { category: selectedCategory.slug }
    if (merged.year) query.year = merged.year
    if (merged.q?.trim()) query.q = merged.q.trim()
    router.get('/painel/acesso-informacao', query, {
      preserveScroll: true,
      preserveState: true,
    })
  }

  function clearFilters() {
    setSearch('')
    router.get(
      '/painel/acesso-informacao',
      { category: selectedCategory.slug },
      { preserveScroll: true }
    )
  }

  function changeCategory(nextCategory: string) {
    router.get(
      '/painel/acesso-informacao',
      { category: nextCategory },
      { preserveScroll: true }
    )
  }

  const activeFilters = Boolean(filters.year || filters.q)
  const baseUrl = (() => {
    const query: Record<string, string> = { category: selectedCategory.slug }
    if (filters.year) query.year = filters.year
    if (filters.q?.trim()) query.q = filters.q.trim()
    return `/painel/acesso-informacao?${new URLSearchParams(query).toString()}`
  })()

  const createUrl = `/painel/acesso-informacao/criar?category=${encodeURIComponent(
    selectedCategory.slug
  )}`

  const recordsByYear = useMemo(() => {
    const map = new Map<number, InfoRecord[]>()
    for (const record of records.data) {
      if (!map.has(record.year)) map.set(record.year, [])
      map.get(record.year)!.push(record)
    }
    return Array.from(map.entries()).sort(([a], [b]) => b - a)
  }, [records.data])

  const exportUrl = (format: 'csv' | 'json') => {
    const query: Record<string, string> = { category: selectedCategory.slug, format }
    if (filters.year) query.year = filters.year
    if (filters.q?.trim()) query.q = filters.q.trim()
    return `/painel/acesso-informacao/exportar?${new URLSearchParams(query).toString()}`
  }

  return (
    <div className="space-y-6">
      <Link
        href="/painel/acesso-informacao"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar à visão geral
      </Link>

      <PageHeader
        title={selectedCategory.name}
        description={`${records.meta?.total ?? records.data.length} registro(s) nesta categoria`}
        icon={FileText}
        eyebrow={selectedCategory.grupo || 'Acesso à Informação'}
        actions={
          <ButtonLink href={createUrl}>
            <Plus className="h-4 w-4" /> Novo registro
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Clock3 className="h-4 w-4 text-gold" />
            <span className="font-semibold text-foreground">Atualizado em</span>
            <span className="text-muted-foreground">{formatDateTime(categoryLatestUpdate || null)}</span>
            <Badge tone={fresh.tone}>{fresh.label}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Data do registro mais recente desta seção, usada como sinal de frescor PNTP.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
          <span className="text-sm font-semibold text-foreground">{totalRecords} registro(s)</span>
          <a href={exportUrl('csv')} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground no-underline transition-colors hover:border-navy/40 hover:text-navy dark:hover:text-navy-light">
            <Download className="h-4 w-4" />
            CSV
          </a>
          <a href={exportUrl('json')} className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground no-underline transition-colors hover:border-navy/40 hover:text-navy dark:hover:text-navy-light">
            <FileJson className="h-4 w-4" />
            JSON
          </a>
        </div>
      </div>

      {/* Filtros */}
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[16rem_minmax(16rem,1fr)_12rem_auto]">
          <Select value={selectedCategory.slug} onChange={(event) => changeCategory(event.target.value)}>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </Select>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              applyFilters({ q: search })
            }}
            className="relative min-w-0"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por título ou conteúdo"
              className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-navy focus:ring-2 focus:ring-navy/20"
            />
          </form>
          <Select value={filters.year} onChange={(event) => applyFilters({ year: event.target.value })}>
            <option value="">Todos os anos</option>
            {yearOptions.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </Select>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 lg:flex-none"
              onClick={() => applyFilters({ q: search })}
            >
              Filtrar
            </Button>
            {activeFilters && (
              <Button
                type="button"
                variant="ghost"
                className="flex-1 lg:flex-none"
                onClick={clearFilters}
              >
                <X className="h-4 w-4" /> Limpar
              </Button>
            )}
          </div>
        </div>
      </section>

      {records.data.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={
            activeFilters ? 'Nenhum registro encontrado' : 'Nenhum registro nesta categoria'
          }
          description={
            activeFilters
              ? 'Ajuste os filtros para ver outros registros.'
              : 'Adicione o primeiro registro desta categoria.'
          }
          action={
            <ButtonLink href={createUrl}>
              <Plus className="h-4 w-4" /> Adicionar primeiro registro
            </ButtonLink>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 lg:hidden">
            {recordsByYear.map(([year, group]) => (
              <section key={year} className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2">
                  <span className="text-sm font-bold text-foreground">{year}</span>
                  <Badge tone="neutral">{group.length} registro(s)</Badge>
                </div>
                {group.map((record) => (
                  <MobileRecordCard
                    key={record.id}
                    record={record}
                    onDelete={onDelete}
                    onPreview={setPreviewRecord}
                  />
                ))}
              </section>
            ))}
          </div>

          <div className="hidden space-y-4 lg:block">
            {recordsByYear.map(([year, group]) => (
              <section key={year} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gold" />
                    <h2 className="text-sm font-bold text-foreground">{year}</h2>
                  </div>
                  <Badge tone="neutral">{group.length} registro(s)</Badge>
                </div>
                <Table className="border-0 shadow-none">
                  <THead>
                    <TH>Título</TH>
                    <TH className="w-28">Arquivo</TH>
                    <TH className="w-28">Status</TH>
                    <TH className="w-44">Atualizado</TH>
                    <TH className="w-36 text-right">Ações</TH>
                  </THead>
                  <TBody>
                    {group.map((record) => (
                      <TR key={record.id}>
                        <TD>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground">{record.title}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              ID #{record.id}
                              {record.reference_date ? ` · Ref. ${formatDate(record.reference_date)}` : ''}
                            </p>
                          </div>
                        </TD>
                        <TD>
                          {record.file_url ? (
                            <button
                              type="button"
                              onClick={() => setPreviewRecord(record)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-sky/10 px-2.5 py-1.5 text-xs font-semibold text-sky transition-colors hover:bg-sky/15"
                            >
                              <Paperclip className="h-3.5 w-3.5" />
                              Ver
                            </button>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TD>
                        <TD>
                          <Badge tone={record.is_active ? 'success' : 'neutral'}>
                            {record.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TD>
                        <TD>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(record.updated_at)}
                          </span>
                        </TD>
                        <TD>
                          <RowActions>
                            <IconButton tone="view" title="Visualizar" onClick={() => setPreviewRecord(record)}>
                              <Eye className="h-4 w-4" />
                            </IconButton>
                            <IconLink
                              tone="edit"
                              href={`/painel/acesso-informacao/${record.id}/editar`}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </IconLink>
                            <IconButton tone="delete" title="Excluir" onClick={() => onDelete(record)}>
                              <Trash2 className="h-4 w-4" />
                            </IconButton>
                          </RowActions>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </section>
            ))}
          </div>

          {records.meta?.last_page > 1 && (
            <Pagination
              meta={records.meta}
              baseUrl={baseUrl}
              itemLabel="registro"
              itemLabelPlural="registros"
            />
          )}
        </>
      )}

      <RecordPreviewModal record={previewRecord} onClose={() => setPreviewRecord(null)} />
    </div>
  )
}

function RecordPreviewModal({ record, onClose }: { record: InfoRecord | null; onClose: () => void }) {
  const url = record ? previewUrl(record) : null

  return (
    <Modal open={Boolean(record)} onClose={onClose} maxWidth="max-w-5xl">
      {record && (
        <div className="flex max-h-[90dvh] flex-col">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge tone="neutral">
                  <Calendar className="h-3 w-3" />
                  {record.year}
                </Badge>
                <Badge tone={record.is_active ? 'success' : 'neutral'}>
                  {record.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
                {record.file_url && (
                  <Badge tone="info">
                    <Paperclip className="h-3 w-3" />
                    Documento
                  </Badge>
                )}
              </div>
              <h2 className="text-lg font-bold leading-tight text-foreground">{record.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Atualizado em {formatDateTime(record.updated_at)}
                {record.reference_date ? ` · Referência ${formatDate(record.reference_date)}` : ''}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {record.file_url && (
                <a
                  href={record.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground no-underline transition-colors hover:border-navy/40 hover:text-navy dark:hover:text-navy-light"
                >
                  <ExternalLink className="h-4 w-4" />
                  Nova aba
                </a>
              )}
              <Button type="button" variant="secondary" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {url ? (
              <div className="overflow-hidden rounded-lg border border-border bg-background">
                <iframe
                  src={url}
                  title={record.title}
                  className="h-[70dvh] w-full bg-background"
                />
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-background p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Link2 className="h-4 w-4" />
                  Conteúdo textual
                </div>
                {record.content ? (
                  <SafeHtml html={record.content} className="prose prose-sm max-w-none dark:prose-invert" />
                ) : (
                  <p className="text-sm text-muted-foreground">Este registro ainda não possui arquivo ou descrição.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}

/* ============================== Página ============================== */

export default function InformationRecordsIndex({
  categories,
  stats,
  selectedCategory,
  records,
  years,
  filters,
  latestUpdate,
  categoryLatestUpdate,
}: Props) {
  const { auth } = usePage().props as any
  const canManageCategories = auth?.user?.role === 'super_admin'
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  const inCategory = Boolean(selectedCategory && records)

  return (
    <AdminLayout title="Acesso à Informação">
      <Head title="Acesso à Informação - Painel" />

      {inCategory ? (
        <CategoryListing
          selectedCategory={selectedCategory!}
          categories={categories}
          records={records!}
          years={years}
          filters={filters}
          categoryLatestUpdate={categoryLatestUpdate}
          onDelete={(record) => setDeleteTarget({ id: record.id, label: record.title })}
        />
      ) : (
        <Overview
          categories={categories}
          stats={stats}
          canManageCategories={canManageCategories}
          latestUpdate={latestUpdate}
        />
      )}

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/acesso-informacao/${id}`}
        entity="registro"
      />
    </AdminLayout>
  )
}
