import { Head, router } from '@inertiajs/react'
import { RotateCcw, Trash2 } from 'lucide-react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  Badge,
  Button,
  IconButton,
  PageHeader,
  Table,
  TableEmpty,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '~/components/admin/ui'

interface TrashEntry {
  id: number
  tableName: string
  recordId: string
  displayName: string | null
  deletedByUserId: number | null
  deletedAt: string | null
  metadata: Record<string, unknown> | null
}

function formatDate(value: string | null) {
  if (!value) return '-'
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return value
  }
}

const tableLabels: Record<string, string> = {
  news: 'Notícia',
  atas: 'Ata',
  pautas: 'Pauta',
  legislative_activities: 'Atividade legislativa',
  official_publications: 'Publicação oficial',
  transparency_sections: 'Seção da transparência',
  transparency_links: 'Link da transparência',
  information_records: 'Acesso à Informação',
  pages: 'Página',
}

export default function TrashIndex({ entries }: { entries: TrashEntry[] }) {
  function restore(entry: TrashEntry) {
    if (!window.confirm(`Restaurar "${entry.displayName || entry.recordId}"?`)) return
    router.post(`/painel/lixeira/${entry.id}/restaurar`, {}, { preserveScroll: true })
  }

  return (
    <AdminLayout title="Lixeira">
      <Head title="Lixeira - Painel" />

      <PageHeader
        title="Lixeira"
        description="Registros removidos ficam aqui para auditoria e restauração segura."
        icon={Trash2}
        eyebrow="Sistema"
        variant="hero"
      />

      <Table>
        <THead>
          <TH>Registro</TH>
          <TH>Módulo</TH>
          <TH>Excluído em</TH>
          <TH className="text-right">Ações</TH>
        </THead>
        <TBody>
          {entries.map((entry) => (
            <TR key={entry.id}>
              <TD>
                <p className="text-sm font-medium text-foreground">
                  {entry.displayName || `Registro #${entry.recordId}`}
                </p>
                <p className="text-xs text-muted-foreground">ID original: {entry.recordId}</p>
              </TD>
              <TD>
                <Badge tone="neutral">{tableLabels[entry.tableName] ?? entry.tableName}</Badge>
              </TD>
              <TD className="text-muted-foreground">{formatDate(entry.deletedAt)}</TD>
              <TD className="text-right">
                <IconButton tone="success" title="Restaurar" onClick={() => restore(entry)}>
                  <RotateCcw className="w-4 h-4" />
                </IconButton>
              </TD>
            </TR>
          ))}
          {entries.length === 0 && (
            <TableEmpty colSpan={4} icon={Trash2} title="Lixeira vazia">
              Nenhum registro removido aguardando restauração.
            </TableEmpty>
          )}
        </TBody>
      </Table>

      <div className="mt-4 flex justify-end">
        <Button variant="secondary" onClick={() => router.reload({ preserveScroll: true })}>
          Atualizar lista
        </Button>
      </div>
    </AdminLayout>
  )
}
