import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  Check,
  Copy,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Loader2,
  Trash2,
  UploadCloud,
  type LucideIcon,
} from 'lucide-react'
import { useRef, useState, type DragEvent } from 'react'
import {
  Button,
  ConfirmDelete,
  EmptyState,
  IconButton,
  PageHeader,
  Pagination,
  SearchInput,
  Toolbar,
} from '~/components/admin/ui'

interface MediaItem {
  id: number
  filename: string
  url: string
  mime_type: string
  size: number
  created_at: string
}

interface Props {
  files: {
    data: MediaItem[]
    meta: {
      total: number
      per_page: number
      current_page: number
      last_page: number
    }
  }
  filters: { type: string; search: string }
}

const ACCEPT =
  '.png,.jpg,.jpeg,.webp,.svg,.gif,.pdf,.doc,.docx,.xls,.xlsx,.csv,.zip'

function formatSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(mime: string): boolean {
  return mime.startsWith('image/')
}

function fileIcon(item: MediaItem): LucideIcon {
  const ext = item.filename.split('.').pop()?.toLowerCase() ?? ''
  if (isImage(item.mime_type)) return FileImage
  if (ext === 'pdf') return FileText
  if (['doc', 'docx'].includes(ext)) return FileText
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet
  if (ext === 'zip') return FileArchive
  return File
}

function getCsrfToken(): string {
  const raw =
    document.cookie.split('; ').find((row) => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''
  return decodeURIComponent(raw)
}

export default function MediaIndex({ files, filters }: Props) {
  const [search, setSearch] = useState(filters.search)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const baseParams = new URLSearchParams()
  if (filters.type) baseParams.set('type', filters.type)
  if (filters.search) baseParams.set('search', filters.search)
  const baseUrl = `/painel/midia${baseParams.toString() ? `?${baseParams.toString()}` : ''}`

  function applyFilters(overrides: Record<string, string> = {}) {
    const params: Record<string, string> = { type: filters.type, search, ...overrides }
    const clean: Record<string, string> = {}
    for (const [k, v] of Object.entries(params)) {
      if (v) clean[k] = v
    }
    router.get('/painel/midia', clean, { preserveState: true })
  }

  async function uploadFiles(list: FileList | globalThis.File[]) {
    const items = Array.from(list)
    if (items.length === 0) return

    setUploading(true)
    setUploadError(null)

    const formData = new FormData()
    for (const file of items) {
      formData.append('files', file)
    }

    try {
      const res = await fetch('/painel/midia/upload', {
        method: 'POST',
        headers: { 'X-XSRF-TOKEN': getCsrfToken() },
        body: formData,
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setUploadError(data?.error || 'Erro ao enviar arquivos. Tente novamente.')
      } else {
        router.reload({ only: ['files'] })
      }
    } catch {
      setUploadError('Erro de conexão ao enviar arquivos.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    if (uploading) return
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files)
  }

  async function copyUrl(item: MediaItem) {
    const fullUrl = `${window.location.origin}${item.url}`
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId((current) => (current === item.id ? null : current)), 2000)
    } catch {
      /* clipboard indisponível */
    }
  }

  const typeFilters: Array<{ value: string; label: string }> = [
    { value: '', label: 'Todos' },
    { value: 'image', label: 'Imagens' },
    { value: 'document', label: 'Documentos' },
  ]

  return (
    <AdminLayout title="Biblioteca de Mídia">
      <Head title="Biblioteca de Mídia - Painel" />

      <PageHeader
        title="Biblioteca de Mídia"
        description="Imagens e documentos enviados para uso em todo o site"
      />

      {/* Área de upload */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`mb-6 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? 'border-navy bg-navy/5' : 'border-border bg-card'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        <div className="w-12 h-12 rounded-xl bg-navy/10 text-navy flex items-center justify-center mx-auto mb-3">
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">
          {uploading ? 'Enviando arquivos...' : 'Arraste arquivos aqui ou clique para enviar'}
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          PNG, JPG, WEBP, SVG, GIF, PDF, DOC, XLS, CSV ou ZIP — até 20MB por arquivo
        </p>
        <Button
          variant="secondary"
          size="sm"
          loading={uploading}
          onClick={() => inputRef.current?.click()}
        >
          Selecionar arquivos
        </Button>
        {uploadError && <p className="text-xs text-destructive mt-3">{uploadError}</p>}
      </div>

      {/* Filtros */}
      <Toolbar>
        <SearchInput
          value={search}
          onChange={setSearch}
          onSearch={() => applyFilters({ search })}
          placeholder="Buscar por nome..."
          className="sm:w-72"
        />
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {typeFilters.map((tf) => (
            <button
              key={tf.value}
              onClick={() => applyFilters({ type: tf.value })}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filters.type === tf.value
                  ? 'bg-navy text-white'
                  : 'text-muted-foreground hover:text-navy hover:bg-navy/5'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </Toolbar>

      {/* Grid de arquivos */}
      {files.data.length === 0 ? (
        <EmptyState
          icon={FileImage}
          title="Nenhum arquivo encontrado"
          description={
            filters.search || filters.type
              ? 'Ajuste a busca ou os filtros e tente novamente.'
              : 'Envie imagens e documentos usando a área acima.'
          }
        />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
            {files.data.map((item) => {
              const Icon = fileIcon(item)
              const ext = item.filename.split('.').pop()?.toUpperCase() ?? ''
              return (
                <div
                  key={item.id}
                  className="group rounded-lg border border-border overflow-hidden bg-card hover:shadow-md hover:border-navy/25 transition-all flex flex-col"
                >
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    {isImage(item.mime_type) ? (
                      <img
                        src={item.url}
                        alt={item.filename}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Icon className="w-10 h-10" />
                        <span className="text-[10px] font-bold tracking-wider">{ext}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 border-t border-border flex-1 flex flex-col">
                    <p
                      className="text-xs font-medium text-foreground truncate"
                      title={item.filename}
                    >
                      {item.filename}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatSize(item.size)}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <button
                        onClick={() => copyUrl(item)}
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition-colors ${
                          copiedId === item.id
                            ? 'text-emerald-700 bg-emerald-600/10'
                            : 'text-muted-foreground hover:text-navy hover:bg-navy/10'
                        }`}
                        title="Copiar URL"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3" /> Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copiar URL
                          </>
                        )}
                      </button>
                      <IconButton
                        tone="delete"
                        className="!p-1.5"
                        title="Excluir"
                        onClick={() => setDeleteTarget({ id: item.id, label: item.filename })}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <Pagination meta={files.meta} baseUrl={baseUrl} itemLabel="arquivo" />
        </div>
      )}

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/midia/${id}`}
        entity="arquivo"
      />
    </AdminLayout>
  )
}
