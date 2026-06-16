import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Pencil, Trash2, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
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

interface Pauta {
  id: number
  title: string
  type: string
  document_date: string
  year: number
  file_url: string | null
  is_published: boolean
}

interface Props {
  pautas: { data: Pauta[]; meta: any }
  filters: { year: string; type: string }
  years: number[]
}

const typeLabels: Record<string, string> = {
  ordinaria: 'Ordinária',
  extraordinaria: 'Extraordinária',
  solene: 'Solene',
  especial: 'Especial',
}

export default function PautasIndex({ pautas, filters, years }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  function applyFilters(patch: Record<string, string>) {
    router.get('/painel/pautas', { ...filters, ...patch }, { preserveState: true })
  }

  return (
    <AdminLayout title="Pautas">
      <Head title="Pautas - Painel" />

      <Toolbar className="mb-4 sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {pautas.meta?.total ?? pautas.data.length} pauta(s) — ordem do dia das sessões.
        </p>
        <div className="flex items-center gap-2">
          <Select value={filters.type} onChange={(e) => applyFilters({ type: e.target.value })} className="sm:w-44">
            <option value="">Todos os tipos</option>
            <option value="ordinaria">Ordinária</option>
            <option value="extraordinaria">Extraordinária</option>
            <option value="solene">Solene</option>
            <option value="especial">Especial</option>
          </Select>
          <Select value={filters.year} onChange={(e) => applyFilters({ year: e.target.value })} className="sm:w-32">
            <option value="">Todos os anos</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
          <CreateButton href="/painel/pautas/criar">Nova Pauta</CreateButton>
        </div>
      </Toolbar>

      <Table>
        <THead>
          <TH>Data</TH>
          <TH>Título</TH>
          <TH>Tipo</TH>
          <TH>PDF</TH>
          <TH>Publicada</TH>
          <TH className="text-right">Ações</TH>
        </THead>
        <TBody>
          {pautas.data.length === 0 && <TableEmpty colSpan={6}>Nenhuma pauta cadastrada.</TableEmpty>}
          {pautas.data.map((p) => (
            <TR key={p.id}>
              <TD className="text-muted-foreground whitespace-nowrap">
                {p.document_date ? new Date(p.document_date).toLocaleDateString('pt-BR') : '—'}
              </TD>
              <TD className="font-medium max-w-md">
                <span className="line-clamp-1">{p.title}</span>
              </TD>
              <TD>
                <Badge tone="info">{typeLabels[p.type] || p.type}</Badge>
              </TD>
              <TD>
                {p.file_url ? (
                  <a
                    href={p.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex p-2 rounded-lg text-muted-foreground hover:text-sky hover:bg-sky/10 transition-colors"
                    title="Abrir PDF"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <span className="text-muted-foreground/50">—</span>
                )}
              </TD>
              <TD className="text-muted-foreground text-xs">{p.is_published ? 'Sim' : 'Não'}</TD>
              <TD>
                <RowActions>
                  <IconLink tone="edit" href={`/painel/pautas/${p.id}/editar`} title="Editar">
                    <Pencil className="w-4 h-4" />
                  </IconLink>
                  <IconButton tone="delete" title="Excluir" onClick={() => setDeleteTarget({ id: p.id, label: p.title })}>
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
        deleteUrl={(id) => `/painel/pautas/${id}`}
        entity="pauta"
      />
    </AdminLayout>
  )
}
