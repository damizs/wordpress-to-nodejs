import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  ConfirmDelete,
  CreateButton,
  IconButton,
  IconLink,
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

interface Props { licitacoes: any; filters: { status: string; modality: string } }

export default function LicitacoesIndex({ licitacoes, filters }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  return (
    <AdminLayout title="Licitações">
      <Head title="Licitações - Painel" />
      <Toolbar className="mb-6 sm:justify-between">
        <Select
          value={filters.status}
          onChange={(e) => router.get('/painel/licitacoes', { ...filters, status: e.target.value }, { preserveState: true })}
          className="sm:w-56"
        >
          <option value="">Todos os status</option>
          <option value="aberta">Aberta</option>
          <option value="em_andamento">Em andamento</option>
          <option value="encerrada">Encerrada</option>
          <option value="deserta">Deserta</option>
          <option value="revogada">Revogada</option>
          <option value="suspensa">Suspensa</option>
        </Select>
        <CreateButton href="/painel/licitacoes/criar">Nova Licitação</CreateButton>
      </Toolbar>

      <Table>
        <THead>
          <TH>Título</TH>
          <TH>Modalidade</TH>
          <TH>Status</TH>
          <TH>Abertura</TH>
          <TH className="text-right">Ações</TH>
        </THead>
        <TBody>
          {licitacoes.data?.map((l: any) => (
            <TR key={l.id}>
              <TD>
                <div className="font-medium text-foreground">{l.title}</div>
                {l.number && <div className="text-xs text-muted-foreground">Nº {l.number}</div>}
              </TD>
              <TD className="text-muted-foreground capitalize">{l.modality?.replace('_', ' ') || '—'}</TD>
              <TD>
                <StatusBadge status={l.status} />
              </TD>
              <TD className="text-muted-foreground">{l.opening_date || '—'}</TD>
              <TD>
                <RowActions>
                  <IconLink tone="edit" href={`/painel/licitacoes/${l.id}/editar`} title="Editar">
                    <Pencil className="w-4 h-4" />
                  </IconLink>
                  <IconButton
                    tone="delete"
                    title="Excluir"
                    onClick={() => setDeleteTarget({ id: l.id, label: l.title })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </RowActions>
              </TD>
            </TR>
          ))}
          {(!licitacoes.data || licitacoes.data.length === 0) && (
            <TableEmpty colSpan={5}>Nenhuma licitação cadastrada.</TableEmpty>
          )}
        </TBody>
      </Table>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/licitacoes/${id}`}
        entity="licitação"
      />
    </AdminLayout>
  )
}
