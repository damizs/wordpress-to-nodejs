import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { useState } from 'react'
import { Star, Eye, Trash2, ClipboardList, MailOpen, BarChart3 } from 'lucide-react'
import {
  Badge,
  ConfirmDelete,
  IconButton,
  IconLink,
  PageHeader,
  Pagination,
  RowActions,
  Select,
  StatCard,
  Table,
  TableEmpty,
  TBody,
  TD,
  TH,
  THead,
  Toolbar,
  TR,
} from '~/components/admin/ui'

interface MonthRow { month: number; label: string; total: number; avg: number }
interface Report {
  years: { year: number; total: number }[]
  selectedYear: number
  monthly: MonthRow[]
  yearTotal: number
  yearAvg: number
}
interface Props { surveys: any; stats: any; report: Report; filters: { isRead: string } }

function RatingValue({ value }: { value: number }) {
  return (
    <>
      {value}
      <span className="text-sm text-muted-foreground font-normal">/5</span>
    </>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3.5 h-3.5 ${rating >= s ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
      ))}
    </div>
  )
}

export default function PesquisaSatisfacaoAdmin({ surveys, stats, report, filters }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  const baseUrl = `/painel/pesquisa-satisfacao${filters.isRead ? `?lido=${filters.isRead}` : ''}`
  const maxMonth = Math.max(1, ...report.monthly.map((m) => m.total))
  const goToYear = (ano: number) =>
    router.get(
      '/painel/pesquisa-satisfacao',
      { ano, ...(filters.isRead ? { lido: filters.isRead } : {}) },
      { preserveScroll: true, preserveState: true }
    )

  return (
    <AdminLayout title="Pesquisa de Satisfação">
      <Head title="Pesquisa de Satisfação - Painel" />

      <PageHeader
        title="Pesquisa de Satisfação"
        description="Acompanhe as avaliações enviadas pelos cidadãos sobre os serviços da Câmara."
        icon={ClipboardList}
        eyebrow="Sistema"
        variant="hero"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <StatCard label="Total de respostas" value={stats.total} icon={ClipboardList} />
        <StatCard label="Não lidas" value={stats.unread} icon={MailOpen} />
        <StatCard label="Média Geral" value={<RatingValue value={stats.avg_geral} />} icon={Star} />
        <StatCard label="Atendimento" value={<RatingValue value={stats.avg_atendimento} />} icon={Star} />
        <StatCard label="Transparência" value={<RatingValue value={stats.avg_transparencia} />} icon={Star} />
        <StatCard label="Legislativo" value={<RatingValue value={stats.avg_legislativo} />} icon={Star} />
        <StatCard label="Infraestrutura" value={<RatingValue value={stats.avg_infraestrutura} />} icon={Star} />
      </div>

      {/* Relatório por período (quantitativo por ano + por mês) */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <BarChart3 className="w-5 h-5 text-navy" /> Relatório por período
          </h2>
          {report.years.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {report.years.map((y) => (
                <button
                  key={y.year}
                  type="button"
                  onClick={() => goToYear(y.year)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    y.year === report.selectedYear
                      ? 'bg-navy text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  }`}
                >
                  {y.year} <span className="opacity-70 tabular-nums">({y.total})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {report.yearTotal === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma resposta registrada em {report.selectedYear}.
          </p>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-2xl font-bold text-foreground tabular-nums">{report.yearTotal}</span>{' '}
                <span className="text-muted-foreground">respostas em {report.selectedYear}</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-foreground tabular-nums">{report.yearAvg}</span>
                <span className="text-muted-foreground">/5 média geral do ano</span>
              </div>
            </div>

            {/* Gráfico de barras por mês */}
            <div className="mb-5 flex h-40 items-end gap-1.5">
              {report.monthly.map((m) => {
                const h = m.total > 0 ? Math.max(6, (m.total / maxMonth) * 100) : 0
                return (
                  <div key={m.month} className="group flex flex-1 flex-col items-center justify-end gap-1">
                    <span className="text-xs font-medium tabular-nums text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      {m.total || ''}
                    </span>
                    <div
                      className="w-full rounded-t bg-navy/80 transition-colors group-hover:bg-navy"
                      style={{ height: `${h}%` }}
                      title={`${m.label}: ${m.total} resposta(s) · média ${m.avg}/5`}
                    />
                    <span className="text-[11px] text-muted-foreground">{m.label}</span>
                  </div>
                )
              })}
            </div>

            {/* Tabela Respostas por Mês */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 font-medium">Mês</th>
                    <th className="py-2 text-right font-medium">Respostas</th>
                    <th className="py-2 text-right font-medium">Média</th>
                  </tr>
                </thead>
                <tbody>
                  {report.monthly
                    .filter((m) => m.total > 0)
                    .map((m) => (
                      <tr key={m.month} className="border-b border-border/50">
                        <td className="py-1.5 text-foreground">{m.label}</td>
                        <td className="py-1.5 text-right tabular-nums text-foreground">{m.total}</td>
                        <td className="py-1.5 text-right tabular-nums text-muted-foreground">{m.avg}/5</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Filter */}
      <Toolbar>
        <div className="sm:w-48">
          <Select
            value={filters.isRead}
            onChange={(e) => router.get('/painel/pesquisa-satisfacao', { lido: e.target.value }, { preserveState: true })}
          >
            <option value="">Todas</option>
            <option value="false">Não lidas</option>
            <option value="true">Lidas</option>
          </Select>
        </div>
      </Toolbar>

      {/* Table */}
      <Table
        footer={
          surveys.meta ? (
            <Pagination meta={surveys.meta} baseUrl={baseUrl} itemLabel="resposta" />
          ) : undefined
        }
      >
        <THead>
          <TH>Nome</TH>
          <TH>Geral</TH>
          <TH>Data</TH>
          <TH>Status</TH>
          <TH className="text-right">Ações</TH>
        </THead>
        <TBody>
          {surveys.data?.map((s: any) => (
            <TR key={s.id} className={!s.is_read ? 'bg-sky/5' : ''}>
              <TD>
                <div className="text-sm font-medium text-foreground">{s.name || <span className="text-muted-foreground italic">Anônimo</span>}</div>
                {s.email && <div className="text-xs text-muted-foreground">{s.email}</div>}
              </TD>
              <TD><Stars rating={s.rating_geral} /></TD>
              <TD className="text-muted-foreground">{new Date(s.created_at).toLocaleDateString('pt-BR')}</TD>
              <TD>
                {!s.is_read ? <Badge tone="info">Nova</Badge> : <Badge tone="neutral">Lida</Badge>}
              </TD>
              <TD>
                <RowActions>
                  <IconLink href={`/painel/pesquisa-satisfacao/${s.id}`} tone="view" title="Ver resposta">
                    <Eye className="w-4 h-4" />
                  </IconLink>
                  <IconButton
                    tone="delete"
                    title="Excluir"
                    onClick={() => setDeleteTarget({ id: s.id, label: s.name || 'Anônimo' })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </RowActions>
              </TD>
            </TR>
          ))}
          {(!surveys.data || surveys.data.length === 0) && (
            <TableEmpty colSpan={5}>Nenhuma resposta recebida ainda.</TableEmpty>
          )}
        </TBody>
      </Table>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/pesquisa-satisfacao/${id}`}
        entity="resposta"
      />
    </AdminLayout>
  )
}
