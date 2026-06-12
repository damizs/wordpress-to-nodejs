import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Instagram, ArrowLeft, CheckCircle, XCircle, Clock, Trash2, ExternalLink, Filter } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
  ConfirmDelete,
  IconButton,
  Pagination,
  RowActions,
  Table,
  TableEmpty,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from '~/components/admin/ui'

interface Log {
  id: number
  instagram_id: string
  instagram_shortcode: string | null
  instagram_url: string | null
  instagram_caption: string | null
  instagram_image_url: string | null
  instagram_post_date: string | null
  generated_title: string | null
  generated_content: string | null
  ai_provider: string | null
  ai_model: string | null
  ai_tokens_used: number
  news_id: number | null
  status: string
  error_message: string | null
  processing_time: number | null
  created_at: string
  news?: { id: number; title: string; slug: string } | null
  user?: { id: number; name: string } | null
}

interface Props {
  logs: {
    data: Log[]
    meta: {
      total: number
      per_page: number
      current_page: number
      last_page: number
    }
  }
}

export default function InstagramHistory({ logs }: Props) {
  const [filter, setFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

  const handleFilter = (status: string) => {
    setFilter(status)
    router.get('/painel/instagram/historico', { status }, { preserveState: true })
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <Badge tone="success">
            <CheckCircle className="w-3 h-3" /> Publicado
          </Badge>
        )
      case 'draft':
        return (
          <Badge tone="warning">
            <Clock className="w-3 h-3" /> Rascunho
          </Badge>
        )
      case 'error':
        return (
          <Badge tone="danger">
            <XCircle className="w-3 h-3" /> Erro
          </Badge>
        )
      default:
        return (
          <Badge tone="neutral">
            <Clock className="w-3 h-3" /> Pendente
          </Badge>
        )
    }
  }

  return (
    <AdminLayout>
      <Head title="Histórico de Importação" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/painel/instagram"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="p-2 bg-navy text-white rounded-lg">
              <Instagram className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Histórico de Importação
              </h1>
              <p className="text-sm text-muted-foreground">
                {logs.meta.total} registros encontrados
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filtrar:</span>
            {[
              { value: '', label: 'Todos' },
              { value: 'published', label: 'Publicados' },
              { value: 'draft', label: 'Rascunhos' },
              { value: 'error', label: 'Erros' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => handleFilter(opt.value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filter === opt.value
                    ? 'bg-navy/10 text-navy font-medium'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Table
          footer={
            <Pagination
              meta={logs.meta}
              baseUrl={`/painel/instagram/historico${filter ? `?status=${filter}` : ''}`}
              itemLabel="registro"
            />
          }
        >
          <THead>
            <TH>Post</TH>
            <TH>Título Gerado</TH>
            <TH>IA</TH>
            <TH>Status</TH>
            <TH>Data</TH>
            <TH className="text-right">Ações</TH>
          </THead>
          <TBody>
            {logs.data.length === 0 ? (
              <TableEmpty colSpan={6}>Nenhum registro encontrado</TableEmpty>
            ) : (
              logs.data.map(log => (
                <TR key={log.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      {log.instagram_image_url && (
                        <img
                          src={log.instagram_image_url}
                          alt=""
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {log.instagram_shortcode || log.instagram_id}
                        </p>
                        {log.instagram_url && (
                          <a
                            href={log.instagram_url}
                            target="_blank"
                            className="text-xs text-sky hover:underline flex items-center gap-1"
                          >
                            Ver no Instagram <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <div className="max-w-xs">
                      <p className="text-sm text-foreground truncate">{log.generated_title || '-'}</p>
                      {log.news && (
                        <a
                          href={`/noticias/${log.news.slug}`}
                          target="_blank"
                          className="text-xs text-sky hover:underline"
                        >
                          Ver notícia →
                        </a>
                      )}
                    </div>
                  </TD>
                  <TD>
                    <div className="text-sm">
                      <p className="text-foreground capitalize">{log.ai_provider || '-'}</p>
                      <p className="text-xs text-muted-foreground">{log.ai_model}</p>
                      {log.ai_tokens_used > 0 && (
                        <p className="text-xs text-muted-foreground/70">
                          {log.ai_tokens_used} tokens
                        </p>
                      )}
                    </div>
                  </TD>
                  <TD>
                    {getStatusBadge(log.status)}
                    {log.error_message && (
                      <p
                        className="mt-1 text-xs text-destructive max-w-[200px] truncate"
                        title={log.error_message}
                      >
                        {log.error_message}
                      </p>
                    )}
                  </TD>
                  <TD>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(log.created_at)}
                      {log.processing_time && (
                        <p className="text-xs text-muted-foreground/70">
                          {(log.processing_time / 1000).toFixed(1)}s
                        </p>
                      )}
                    </div>
                  </TD>
                  <TD>
                    <RowActions>
                      <IconButton
                        tone="delete"
                        onClick={() =>
                          setDeleteTarget({
                            id: log.id,
                            label: log.generated_title || log.instagram_shortcode || log.instagram_id,
                          })
                        }
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </RowActions>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </Table>
      </div>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/instagram/${id}`}
        entity="registro"
      />
    </AdminLayout>
  )
}
