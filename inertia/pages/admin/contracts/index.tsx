import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Pencil, Trash2, DownloadCloud, Search } from 'lucide-react'
import { useState } from 'react'
import {
  ConfirmDelete,
  CreateButton,
  IconButton,
  IconLink,
  Input,
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
  Toolbar,
} from '~/components/admin/ui'

interface Props {
  contracts: any
  filters: { status: string; search: string }
  linkableCount: number
}

const fmtMoney = (v: number | null) =>
  v === null || v === undefined
    ? '—'
    : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v))

export default function ContractsIndex({ contracts, filters, linkableCount }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)
  const [search, setSearch] = useState(filters.search || '')
  const [importing, setImporting] = useState(false)

  function applyFilters(patch: Record<string, string>) {
    router.get('/painel/contratos', { ...filters, ...patch }, { preserveState: true })
  }

  function importFromLicitacoes() {
    setImporting(true)
    router.post('/painel/contratos/importar', {}, { onFinish: () => setImporting(false) })
  }

  return (
    <AdminLayout title="Contratos">
      <Head title="Contratos - Painel" />

      <Toolbar className="mb-4 sm:justify-between">
        <form
          className="relative w-full sm:w-72"
          onSubmit={(e) => {
            e.preventDefault()
            applyFilters({ busca: search })
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nº, objeto, contratado ou fiscal..."
            className="pl-9"
          />
        </form>
        <div className="flex items-center gap-2">
          <Select
            value={filters.status}
            onChange={(e) => applyFilters({ status: e.target.value })}
            className="sm:w-44"
          >
            <option value="">Todos os status</option>
            <option value="vigente">Vigente</option>
            <option value="encerrado">Encerrado</option>
            <option value="rescindido">Rescindido</option>
            <option value="suspenso">Suspenso</option>
          </Select>
          <CreateButton href="/painel/contratos/criar">Novo Contrato</CreateButton>
        </div>
      </Toolbar>

      {linkableCount > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-sky/20 bg-sky/10 p-4">
          <div className="flex-1 text-sm text-foreground">
            <strong>{linkableCount}</strong> licitação(ões) têm anexo de contrato ainda sem contrato
            estruturado. Importe para preencher automaticamente número, objeto, ano e PDF — depois é
            só completar contratante, valor, vigência e fiscal.
          </div>
          <button
            type="button"
            onClick={importFromLicitacoes}
            disabled={importing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-navy text-primary-foreground rounded-lg text-sm font-medium hover:bg-navy-light transition-colors disabled:opacity-60"
          >
            <DownloadCloud className="w-4 h-4" />
            {importing ? 'Importando...' : 'Importar de licitações'}
          </button>
        </div>
      )}

      <Table>
        <THead>
          <TH>Contrato</TH>
          <TH>Contratado</TH>
          <TH>Valor</TH>
          <TH>Vigência</TH>
          <TH>Fiscal</TH>
          <TH>Status</TH>
          <TH className="text-right">Ações</TH>
        </THead>
        <TBody>
          {contracts.data?.map((c: any) => (
            <TR key={c.id}>
              <TD>
                <div className="font-medium text-foreground">
                  {c.number ? `Nº ${c.number}` : 'Contrato'} {c.year ? `/ ${c.year}` : ''}
                </div>
                {c.object && (
                  <div className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{c.object}</div>
                )}
              </TD>
              <TD className="text-muted-foreground">{c.contractor_name || '—'}</TD>
              <TD className="text-muted-foreground whitespace-nowrap">{fmtMoney(c.value)}</TD>
              <TD className="text-muted-foreground text-xs">
                {c.start_date || '—'}
                {c.end_date ? ` → ${c.end_date}` : ''}
              </TD>
              <TD className="text-muted-foreground">{c.fiscal_name || '—'}</TD>
              <TD>
                <StatusBadge status={c.status} />
              </TD>
              <TD>
                <RowActions>
                  <IconLink tone="edit" href={`/painel/contratos/${c.id}/editar`} title="Editar">
                    <Pencil className="w-4 h-4" />
                  </IconLink>
                  <IconButton
                    tone="delete"
                    title="Excluir"
                    onClick={() => setDeleteTarget({ id: c.id, label: c.number ? `Nº ${c.number}` : 'contrato' })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </RowActions>
              </TD>
            </TR>
          ))}
          {(!contracts.data || contracts.data.length === 0) && (
            <TableEmpty colSpan={7}>Nenhum contrato cadastrado.</TableEmpty>
          )}
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
