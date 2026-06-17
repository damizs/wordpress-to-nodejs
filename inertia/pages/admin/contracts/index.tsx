import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  BriefcaseBusiness,
  CalendarClock,
  DownloadCloud,
  FileCheck2,
  Landmark,
  Pencil,
  Search,
  Trash2,
  WalletCards,
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
  Pagination,
  RowActions,
  Select,
  StatusBadge,
  Table,
  TableEmpty,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '~/components/admin/ui'

interface Contract {
  id: number
  number?: string | null
  year?: number | null
  object?: string | null
  contractor_name?: string | null
  value?: number | null
  start_date?: string | null
  end_date?: string | null
  fiscal_name?: string | null
  status: string
}

interface Props {
  contracts: {
    data: Contract[]
    meta: {
      total: number
      per_page?: number
      current_page: number
      last_page: number
    }
  }
  filters: { status: string; search: string }
  linkableCount: number
}

const statusLabels: Record<string, string> = {
  vigente: 'Vigentes',
  encerrado: 'Encerrados',
  rescindido: 'Rescindidos',
  suspenso: 'Suspensos',
}

const fmtMoney = (v: number | null | undefined) =>
  v === null || v === undefined
    ? '-'
    : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v))

function baseUrl(filters: Props['filters']) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.search) params.set('busca', filters.search)
  const query = params.toString()
  return `/painel/contratos${query ? `?${query}` : ''}`
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string | number
  hint: string
  icon: typeof BriefcaseBusiness
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold leading-none text-foreground">{value}</p>
          <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-navy">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function ContractCard({
  contract,
  onDelete,
}: {
  contract: Contract
  onDelete: (target: { id: number; label: string }) => void
}) {
  const title = contract.number ? `Contrato ${contract.number}/${contract.year || '-'}` : 'Contrato'
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{title}</h3>
            <StatusBadge status={contract.status} />
          </div>
          {contract.object && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{contract.object}</p>
          )}
        </div>
        <RowActions>
          <IconLink tone="edit" href={`/painel/contratos/${contract.id}/editar`} title="Editar">
            <Pencil className="h-4 w-4" />
          </IconLink>
          <IconButton
            tone="delete"
            title="Excluir"
            onClick={() => onDelete({ id: contract.id, label: title })}
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </RowActions>
      </div>
      <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <span>Contratado: {contract.contractor_name || '-'}</span>
        <span>Valor: {fmtMoney(contract.value)}</span>
        <span>Fiscal: {contract.fiscal_name || '-'}</span>
        <span>
          Vigencia: {contract.start_date || '-'}
          {contract.end_date ? ` ate ${contract.end_date}` : ''}
        </span>
      </div>
    </article>
  )
}

export default function ContractsIndex({ contracts, filters, linkableCount }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)
  const [search, setSearch] = useState(filters.search || '')
  const [importing, setImporting] = useState(false)

  const currentRows = contracts.data || []
  const totalValue = useMemo(
    () => currentRows.reduce((sum, c) => sum + Number(c.value || 0), 0),
    [currentRows]
  )
  const withFiscal = currentRows.filter((c) => Boolean(c.fiscal_name)).length

  function applyFilters(patch: Record<string, string>) {
    const next = { ...filters, ...patch }
    const params: Record<string, string> = {}
    if (next.status) params.status = next.status
    if (next.search) params.busca = next.search
    router.get('/painel/contratos', params, { preserveState: true })
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    applyFilters({ search })
  }

  function clearFilters() {
    setSearch('')
    router.get('/painel/contratos', {}, { preserveState: true })
  }

  function importFromLicitacoes() {
    setImporting(true)
    router.post('/painel/contratos/importar', {}, { onFinish: () => setImporting(false) })
  }

  return (
    <AdminLayout title="Contratos">
      <Head title="Contratos - Painel" />

      <section className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <Badge tone="navy" className="mb-3">
              PNTP 9.1 / 9.3
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Contratos</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Controle dos contratos estruturados com contratado, vigencia, valor, gestor,
              fiscal tecnico e arquivo do instrumento.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
            {linkableCount > 0 && (
              <Button variant="secondary" onClick={importFromLicitacoes} loading={importing}>
                <DownloadCloud className="h-4 w-4" />
                Importar {linkableCount}
              </Button>
            )}
            <CreateButton href="/painel/contratos/criar">Novo contrato</CreateButton>
          </div>
        </div>
      </section>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <StatCard
          label="Registros"
          value={contracts.meta.total}
          hint="Contratos encontrados nos filtros atuais"
          icon={BriefcaseBusiness}
        />
        <StatCard
          label="Valor na pagina"
          value={fmtMoney(totalValue)}
          hint="Soma dos contratos visiveis nesta pagina"
          icon={WalletCards}
        />
        <StatCard
          label="Com fiscal"
          value={withFiscal}
          hint="Registros da pagina com fiscal informado"
          icon={FileCheck2}
        />
      </div>

      <section className="mb-5 rounded-xl border border-border bg-card p-4 shadow-sm">
        <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]" onSubmit={submitSearch}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por numero, objeto, contratado ou fiscal"
              className="h-11 pl-9"
            />
          </div>
          <Select
            value={filters.status}
            onChange={(e) => applyFilters({ status: e.target.value })}
            className="h-11"
          >
            <option value="">Todos os status</option>
            <option value="vigente">Vigente</option>
            <option value="encerrado">Encerrado</option>
            <option value="rescindido">Rescindido</option>
            <option value="suspenso">Suspenso</option>
          </Select>
          <Button type="submit" variant="secondary" className="h-11">
            Filtrar
          </Button>
          {(filters.status || filters.search) && (
            <Button type="button" variant="ghost" className="h-11" onClick={clearFilters}>
              <X className="h-4 w-4" />
              Limpar
            </Button>
          )}
        </form>
      </section>

      {linkableCount > 0 && (
        <div className="mb-5 rounded-xl border border-sky/20 bg-sky/10 p-4 text-sm text-foreground">
          <div className="flex items-start gap-3">
            <Landmark className="mt-0.5 h-5 w-5 shrink-0 text-sky" />
            <p>
              Existem <strong>{linkableCount}</strong> licitacoes com anexo de contrato ainda sem
              contrato estruturado. A importacao cria registros pre-preenchidos para completar
              valor, vigencia, contratado e fiscal.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3 lg:hidden">
        {currentRows.map((contract) => (
          <ContractCard key={contract.id} contract={contract} onDelete={setDeleteTarget} />
        ))}
        {currentRows.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Nenhum contrato encontrado.
          </div>
        )}
        <Pagination meta={contracts.meta} baseUrl={baseUrl(filters)} itemLabel="contrato" />
      </div>

      <Table
        className="hidden lg:block"
        footer={<Pagination meta={contracts.meta} baseUrl={baseUrl(filters)} itemLabel="contrato" />}
      >
        <THead>
          <TH>Contrato</TH>
          <TH>Contratado</TH>
          <TH>Valor</TH>
          <TH>Vigencia</TH>
          <TH>Fiscal</TH>
          <TH>Status</TH>
          <TH className="text-right">Acoes</TH>
        </THead>
        <TBody>
          {currentRows.map((c) => (
            <TR key={c.id}>
              <TD>
                <div className="font-medium text-foreground">
                  {c.number ? `No ${c.number}` : 'Contrato'} {c.year ? `/ ${c.year}` : ''}
                </div>
                {c.object && (
                  <div className="max-w-md truncate text-xs text-muted-foreground">{c.object}</div>
                )}
              </TD>
              <TD className="max-w-[220px] truncate text-muted-foreground">
                {c.contractor_name || '-'}
              </TD>
              <TD className="whitespace-nowrap text-muted-foreground">{fmtMoney(c.value)}</TD>
              <TD className="text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarClock className="h-3.5 w-3.5" />
                  {c.start_date || '-'}
                  {c.end_date ? ` ate ${c.end_date}` : ''}
                </span>
              </TD>
              <TD className="max-w-[180px] truncate text-muted-foreground">{c.fiscal_name || '-'}</TD>
              <TD>
                <StatusBadge status={c.status} />
              </TD>
              <TD>
                <RowActions>
                  <IconLink tone="edit" href={`/painel/contratos/${c.id}/editar`} title="Editar">
                    <Pencil className="h-4 w-4" />
                  </IconLink>
                  <IconButton
                    tone="delete"
                    title="Excluir"
                    onClick={() =>
                      setDeleteTarget({
                        id: c.id,
                        label: c.number ? `Contrato ${c.number}` : 'contrato',
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </RowActions>
              </TD>
            </TR>
          ))}
          {currentRows.length === 0 && <TableEmpty colSpan={7}>Nenhum contrato cadastrado.</TableEmpty>}
        </TBody>
      </Table>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/contratos/${id}`}
        entity="contrato"
      />
    </AdminLayout>
  )
}
