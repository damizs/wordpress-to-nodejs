import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Pencil, Trash2, FileText, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import {
  ConfirmDelete,
  CreateButton,
  IconButton,
  IconLink,
  RowActions,
  Select,
  Table,
  TableEmpty,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Toolbar,
} from '~/components/admin/ui'

interface Report {
  id: number
  report_type: string
  year: number
  period_kind: string
  period_number: number | null
  periodLabel: string
  title: string | null
  file_url: string | null
  is_active: boolean
}

interface Props {
  reports: Report[]
  filters: { type: string; year: string }
  years: number[]
  types: string[]
}

export default function FiscalReportsIndex({ reports, filters, years, types }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  function applyFilters(patch: Record<string, string>) {
    router.get('/painel/relatorios-fiscais', { ...filters, ...patch }, { preserveState: true })
  }

  return (
    <AdminLayout title="Relatórios Fiscais">
      <Head title="Relatórios Fiscais - Painel" />

      <Toolbar className="mb-4 sm:justify-between">
        <p className="text-sm text-muted-foreground">
          RGF, RREO e demais relatórios — organizados por ano e período (LRF / PNTP 11.5).
        </p>
        <div className="flex items-center gap-2">
          <Select value={filters.type} onChange={(e) => applyFilters({ tipo: e.target.value })} className="sm:w-32">
            <option value="">Todos os tipos</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
          <Select value={filters.year} onChange={(e) => applyFilters({ ano: e.target.value })} className="sm:w-32">
            <option value="">Todos os anos</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
          <CreateButton href="/painel/relatorios-fiscais/criar">Novo Relatório</CreateButton>
        </div>
      </Toolbar>

      <Table>
        <THead>
          <TH>Tipo</TH>
          <TH>Ano</TH>
          <TH>Período</TH>
          <TH>Título</TH>
          <TH>Arquivo</TH>
          <TH>Publicado</TH>
          <TH className="text-right">Ações</TH>
        </THead>
        <TBody>
          {reports.map((r) => (
            <TR key={r.id}>
              <TD>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {r.report_type}
                </span>
              </TD>
              <TD className="text-foreground font-medium tabular-nums">{r.year}</TD>
              <TD className="text-muted-foreground">{r.periodLabel}</TD>
              <TD className="text-muted-foreground max-w-xs">
                <span className="line-clamp-1">{r.title || '—'}</span>
              </TD>
              <TD>
                {r.file_url ? (
                  <a
                    href={r.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-navy dark:text-sky text-sm hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" /> PDF <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">sem arquivo</span>
                )}
              </TD>
              <TD className="text-muted-foreground text-xs">{r.is_active ? 'Sim' : 'Não'}</TD>
              <TD>
                <RowActions>
                  <IconLink tone="edit" href={`/painel/relatorios-fiscais/${r.id}/editar`} title="Editar">
                    <Pencil className="w-4 h-4" />
                  </IconLink>
                  <IconButton
                    tone="delete"
                    title="Excluir"
                    onClick={() =>
                      setDeleteTarget({ id: r.id, label: `${r.report_type} ${r.periodLabel}/${r.year}` })
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </RowActions>
              </TD>
            </TR>
          ))}
          {reports.length === 0 && (
            <TableEmpty colSpan={7}>Nenhum relatório fiscal cadastrado.</TableEmpty>
          )}
        </TBody>
      </Table>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/relatorios-fiscais/${id}`}
        entity="relatório"
      />
    </AdminLayout>
  )
}
