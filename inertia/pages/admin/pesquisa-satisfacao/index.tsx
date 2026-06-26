import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { useState } from 'react'
import { Star, Eye, Trash2, ClipboardList, MailOpen } from 'lucide-react'
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

interface Props { surveys: any; stats: any; filters: { isRead: string } }

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

export default function PesquisaSatisfacaoAdmin({ surveys, stats, filters }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  const baseUrl = `/painel/pesquisa-satisfacao${filters.isRead ? `?lido=${filters.isRead}` : ''}`

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
