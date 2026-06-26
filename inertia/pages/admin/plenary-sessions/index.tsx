import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Calendar, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
  ConfirmDelete,
  CreateButton,
  EmptyState,
  IconButton,
  IconLink,
  PageHeader,
  RowActions,
  Select,
  Table,
  TBody,
  TD,
  TH,
  THead,
  Toolbar,
  TR,
} from '~/components/admin/ui'

interface PlenarySession {
  id: number
  title: string
  type: string
  session_date: string
  year: number
  status: string
  file_url: string | null
}

interface Props {
  sessions: { data: PlenarySession[]; meta: any }
  filters: { year: string; type: string }
}

const typeLabels: Record<string, string> = {
  ordinaria: 'Ordinária', extraordinaria: 'Extraordinária', solene: 'Solene', especial: 'Especial',
}
const statusBadges: Record<string, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  agendada: { label: 'Agendada', tone: 'warning' },
  realizada: { label: 'Realizada', tone: 'success' },
  cancelada: { label: 'Cancelada', tone: 'danger' },
}

export default function PlenarySessionsIndex({ sessions, filters }: Props) {
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  return (
    <AdminLayout title="Sessões">
      <Head title="Sessões - Painel" />

      <PageHeader
        title="Sessões Plenárias"
        description="Agende, registre e acompanhe as sessões da Câmara Municipal."
        icon={Calendar}
        eyebrow="Legislativo"
        variant="hero"
        actions={<CreateButton href="/painel/sessoes/criar">Nova Sessão</CreateButton>}
      />

      <Toolbar>
        <Select
          value={filters.type}
          onChange={(e) =>
            router.get('/painel/sessoes', { type: e.target.value, year: filters.year }, { preserveState: true })
          }
          className="sm:w-48"
        >
          <option value="">Todos os tipos</option>
          <option value="ordinaria">Ordinária</option>
          <option value="extraordinaria">Extraordinária</option>
          <option value="solene">Solene</option>
        </Select>
        <span className="text-sm text-muted-foreground hidden sm:inline self-center">
          {sessions.meta?.total ?? sessions.data.length} sessão(ões)
        </span>
      </Toolbar>

      {sessions.data.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Nenhuma sessão cadastrada"
          description="Crie a primeira sessão plenária para começar."
          action={<CreateButton href="/painel/sessoes/criar">Nova Sessão</CreateButton>}
        />
      ) : (
        <Table>
          <THead>
            <TH>Data</TH>
            <TH>Título</TH>
            <TH>Tipo</TH>
            <TH>Status</TH>
            <TH>Arquivo</TH>
            <TH className="text-right">Ações</TH>
          </THead>
          <TBody>
            {sessions.data.map((s) => {
              const status = statusBadges[s.status]
              return (
                <TR key={s.id}>
                  <TD className="text-muted-foreground whitespace-nowrap">
                    {new Date(s.session_date).toLocaleDateString('pt-BR')}
                  </TD>
                  <TD className="font-medium">{s.title}</TD>
                  <TD>
                    <Badge tone="info">{typeLabels[s.type] || s.type}</Badge>
                  </TD>
                  <TD>
                    <Badge tone={status?.tone ?? 'neutral'}>{status?.label ?? s.status}</Badge>
                  </TD>
                  <TD>
                    {s.file_url ? (
                      <a
                        href={s.file_url}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex p-2 rounded-lg text-muted-foreground hover:text-sky hover:bg-sky/10 transition-colors"
                        title="Abrir arquivo"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </TD>
                  <TD>
                    <RowActions>
                      <IconLink tone="edit" href={`/painel/sessoes/${s.id}/editar`} title="Editar">
                        <Pencil className="w-4 h-4" />
                      </IconLink>
                      <IconButton
                        tone="delete"
                        onClick={() => setDeleteTarget({ id: s.id, label: s.title })}
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </RowActions>
                  </TD>
                </TR>
              )
            })}
          </TBody>
        </Table>
      )}

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/sessoes/${id}`}
        entity="sessão"
      />
    </AdminLayout>
  )
}
