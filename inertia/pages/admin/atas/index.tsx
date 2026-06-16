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

interface Ata {
  id: number
  title: string
  type: string
  document_date: string
  year: number
  file_url: string | null
  is_published: boolean
}

interface Props {
  atas: { data: Ata[]; meta: any }
  filters: { year: string; type: string }
  years: number[]
}

const typeLabels: Record<string, string> = {
  ordinaria: 'Ordinária',
  extraordinaria: 'Extraordinária',
  solene: 'Solene',
  especial: 'Especial',
}

export default function AtasIndex({ atas, filters, years }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  function applyFilters(patch: Record<string, string>) {
    router.get('/painel/atas', { ...filters, ...patch }, { preserveState: true })
  }

  return (
    <AdminLayout title="Atas">
      <Head title="Atas - Painel" />

      <Toolbar className="mb-4 sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {atas.meta?.total ?? atas.data.length} ata(s) das sessões plenárias.
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
          <CreateButton href="/painel/atas/criar">Nova Ata</CreateButton>
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
          {atas.data.length === 0 && <TableEmpty colSpan={6}>Nenhuma ata cadastrada.</TableEmpty>}
          {atas.data.map((a) => (
            <TR key={a.id}>
              <TD className="text-muted-foreground whitespace-nowrap">
                {a.document_date ? new Date(a.document_date).toLocaleDateString('pt-BR') : '—'}
              </TD>
              <TD className="font-medium max-w-md">
                <span className="line-clamp-1">{a.title}</span>
              </TD>
              <TD>
                <Badge tone="info">{typeLabels[a.type] || a.type}</Badge>
              </TD>
              <TD>
                {a.file_url ? (
                  <a
                    href={a.file_url}
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
              <TD className="text-muted-foreground text-xs">{a.is_published ? 'Sim' : 'Não'}</TD>
              <TD>
                <RowActions>
                  <IconLink tone="edit" href={`/painel/atas/${a.id}/editar`} title="Editar">
                    <Pencil className="w-4 h-4" />
                  </IconLink>
                  <IconButton tone="delete" title="Excluir" onClick={() => setDeleteTarget({ id: a.id, label: a.title })}>
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
        deleteUrl={(id) => `/painel/atas/${id}`}
        entity="ata"
      />
    </AdminLayout>
  )
}
