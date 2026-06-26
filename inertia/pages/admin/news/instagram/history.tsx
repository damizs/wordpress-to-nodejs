import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Instagram, Trash2, Eye, Filter } from 'lucide-react'
import {
  Badge,
  IconLink,
  PageHeader,
  Pagination,
  RowActions,
  Select,
  StatusBadge,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Table,
  TableEmpty,
  Toolbar,
} from '~/components/admin/ui'

interface Log {
  id: number
  instagramId: string
  instagramUrl: string | null
  instagramCaption: string | null
  instagramPostDate: string | null
  generatedTitle: string | null
  generatedContent: string | null
  aiProvider: string | null
  aiModel: string | null
  aiTokensUsed: number
  newsId: number | null
  status: string
  createdAt: string
  news?: { id: number; title: string; slug: string } | null
  user?: { id: number; name: string } | null
}

interface Props {
  logs: {
    data: Log[]
    meta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
    }
  }
  filters?: { status?: string }
}

function LogStatusBadge({ status }: { status: string }) {
  if (status === 'error') return <Badge tone="danger">Erro</Badge>
  if (status === 'published') return <StatusBadge status="published" label="Publicado" />
  return <StatusBadge status={status} />
}

export default function InstagramHistory({ logs, filters }: Props) {
  const statusFilter = filters?.status || ''

  // Filtro server-side: navega preservando o status (corrige a paginação).
  const onStatusChange = (status: string) => {
    router.get(
      '/painel/noticias/instagram/historico',
      status ? { status } : {},
      { preserveState: false, preserveScroll: true }
    )
  }

  const baseUrl = statusFilter
    ? `/painel/noticias/instagram/historico?status=${encodeURIComponent(statusFilter)}`
    : '/painel/noticias/instagram/historico'

  return (
    <AdminLayout>
      <Head title="Histórico - Instagram" />

      <div className="space-y-6">
        <PageHeader
          eyebrow="Instagram"
          icon={Instagram}
          title="Histórico de Importação"
          description={`${logs.meta.total} registro(s) importado(s)${statusFilter ? ` · filtrando por: ${statusFilter}` : ''}`}
          actions={
            <IconLink href="/painel/noticias/instagram" tone="neutral" title="Voltar ao painel">
              <Instagram className="w-5 h-5" />
            </IconLink>
          }
        />

        <Toolbar>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
            <Select
              value={statusFilter}
              onChange={e => onStatusChange(e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="published">Publicado</option>
              <option value="draft">Rascunho</option>
              <option value="error">Erro</option>
            </Select>
          </div>
        </Toolbar>

        <Table
          footer={
            <Pagination
              meta={{
                total: logs.meta.total,
                per_page: logs.meta.perPage,
                current_page: logs.meta.currentPage,
                last_page: logs.meta.lastPage,
              }}
              baseUrl={baseUrl}
              itemLabel="registro"
            />
          }
        >
          <THead>
            <TH>Data</TH>
            <TH>Título Gerado</TH>
            <TH>IA</TH>
            <TH>Status</TH>
            <TH className="hidden md:table-cell">Importado por</TH>
            <TH className="text-right">Ações</TH>
          </THead>
          <TBody>
            {logs.data.length === 0 ? (
              <TableEmpty colSpan={6}>Nenhum registro encontrado</TableEmpty>
            ) : (
              logs.data.map(log => (
                <TR key={log.id}>
                  <TD>
                    <div className="text-sm whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleTimeString('pt-BR')}
                    </div>
                  </TD>
                  <TD>
                    <p className="font-medium text-foreground max-w-xs truncate">
                      {log.generatedTitle || 'Sem título'}
                    </p>
                    {log.instagramPostDate && (
                      <p className="text-xs text-muted-foreground">
                        Post de {new Date(log.instagramPostDate).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </TD>
                  <TD>
                    <Badge tone="navy">{log.aiProvider || '-'}</Badge>
                    {log.aiTokensUsed > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {log.aiTokensUsed} tokens
                      </p>
                    )}
                  </TD>
                  <TD>
                    <LogStatusBadge status={log.status} />
                  </TD>
                  <TD className="hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {log.user?.name || 'Sistema'}
                    </span>
                  </TD>
                  <TD>
                    <RowActions>
                      {log.instagramUrl && (
                        <a
                          href={log.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg transition-colors inline-flex text-muted-foreground hover:text-sky hover:bg-sky/10"
                          title="Ver no Instagram"
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                      {log.newsId && (
                        <IconLink
                          tone="edit"
                          href={`/painel/noticias/${log.newsId}/editar`}
                          title="Editar notícia"
                        >
                          <Eye className="w-4 h-4" />
                        </IconLink>
                      )}
                      <Link
                        href={`/painel/noticias/instagram/${log.id}`}
                        method="delete"
                        as="button"
                        className="p-2 rounded-lg transition-colors inline-flex text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Excluir log"
                        onClick={(e) => {
                          if (!confirm('Remover este log? A notícia não será excluída.')) {
                            e.preventDefault()
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Link>
                    </RowActions>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </div>
    </AdminLayout>
  )
}
