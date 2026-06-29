import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  AlertTriangle,
  Check,
  Copy,
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  HardDrive,
  Loader2,
  Trash2,
  UploadCloud,
  type LucideIcon,
} from 'lucide-react'
import { useRef, useState, type DragEvent } from 'react'
import {
  Badge,
  Button,
  EmptyState,
  IconButton,
  Modal,
  PageHeader,
  Pagination,
  SearchInput,
  Toolbar,
} from '~/components/admin/ui'

/* ============================== Tipos ============================== */

interface LibraryItem {
  id: number
  filename: string
  url: string
  mime_type: string
  size: number
  created_at: string
}

interface FsItem {
  path: string
  url: string
  name: string
  size: number
  mtime: string
  type: 'image' | 'document'
  tracked: boolean
  trackedId: number | null
}

interface PageMeta {
  total: number
  per_page: number
  current_page: number
  last_page: number
}

interface Props {
  tab: 'all' | 'library'
  filters: { type: string; search: string }
  library: { data: LibraryItem[]; meta: PageMeta } | null
  allFiles: {
    data: FsItem[]
    meta: PageMeta
    truncated: boolean
    scanned: number
  } | null
}

type DeleteTarget =
  | { kind: 'library'; id: number; label: string }
  | { kind: 'fs'; path: string; label: string; tracked: boolean }

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']
const ACCEPT = '.png,.jpg,.jpeg,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx,.csv,.zip'

/* ============================== Helpers ============================== */

function formatSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function extOf(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? ''
}

function isImageName(name: string): boolean {
  return IMAGE_EXTS.includes(extOf(name))
}

function iconFor(name: string, isImage: boolean): LucideIcon {
  if (isImage) return FileImage
  const ext = extOf(name)
  if (ext === 'pdf' || ext === 'doc' || ext === 'docx') return FileText
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet
  if (ext === 'zip') return FileArchive
  return File
}

function folderOf(path: string): string {
  const idx = path.lastIndexOf('/')
  return idx === -1 ? 'uploads' : `uploads/${path.slice(0, idx)}`
}

function getCsrfToken(): string {
  const raw =
    document.cookie.split('; ').find((row) => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''
  return decodeURIComponent(raw)
}

/* ============================== Cartão de arquivo ============================== */

function FileCard({
  name,
  url,
  size,
  isImage,
  badge,
  copied,
  onCopy,
  onDelete,
}: {
  name: string
  url: string
  size: number
  isImage: boolean
  badge?: string
  copied: boolean
  onCopy: () => void
  onDelete: () => void
}) {
  const Icon = iconFor(name, isImage)
  const ext = extOf(name).toUpperCase()
  return (
    <div className="group rounded-lg border border-border overflow-hidden bg-card hover:shadow-md hover:border-navy/25 transition-all flex flex-col">
      <div className="relative aspect-square bg-muted flex items-center justify-center overflow-hidden">
        {isImage ? (
          <img src={url} alt={name} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Icon className="w-10 h-10" />
            <span className="text-[10px] font-bold tracking-wider">{ext}</span>
          </div>
        )}
        {badge && (
          <span className="absolute top-1.5 left-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-navy/85 text-white">
            {badge}
          </span>
        )}
      </div>
      <div className="p-2.5 border-t border-border flex-1 flex flex-col">
        <p className="text-xs font-medium text-foreground truncate" title={name}>
          {name}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{formatSize(size)}</p>
        <div className="flex items-center justify-between mt-2">
          <button
            onClick={onCopy}
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition-colors ${
              copied
                ? 'text-emerald-700 bg-emerald-600/10'
                : 'text-muted-foreground hover:text-navy hover:bg-navy/10'
            }`}
            title="Copiar URL"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" /> Copiado!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Copiar URL
              </>
            )}
          </button>
          <IconButton tone="delete" className="!p-1.5" title="Excluir" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </IconButton>
        </div>
      </div>
    </div>
  )
}

/* ============================== Página ============================== */

export default function MediaIndex({ tab, filters, library, allFiles }: Props) {
  const [search, setSearch] = useState(filters.search)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const meta = tab === 'library' ? library?.meta : allFiles?.meta

  function buildUrl(overrides: Record<string, string> = {}): string {
    const params: Record<string, string> = {
      tab,
      type: filters.type,
      search: filters.search,
      ...overrides,
    }
    const usp = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v) usp.set(k, v)
    }
    const qs = usp.toString()
    return `/painel/midia${qs ? `?${qs}` : ''}`
  }

  const baseUrl = buildUrl()

  function navigate(overrides: Record<string, string> = {}) {
    const params: Record<string, string> = { tab, type: filters.type, search, ...overrides }
    const clean: Record<string, string> = {}
    for (const [k, v] of Object.entries(params)) {
      if (v) clean[k] = v
    }
    router.get('/painel/midia', clean, { preserveState: true, preserveScroll: true })
  }

  function switchTab(next: 'all' | 'library') {
    if (next === tab) return
    // Troca de aba reinicia a paginação.
    router.get('/painel/midia', { tab: next, type: filters.type, search }, { preserveScroll: true })
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
        router.reload({ preserveScroll: true })
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

  async function copyUrl(key: string, url: string) {
    const fullUrl = `${window.location.origin}${url}`
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 2000)
    } catch {
      /* clipboard indisponível */
    }
  }

  function requestDelete(target: DeleteTarget) {
    setDeleteError(null)
    setDeleteTarget(target)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError(null)

    if (deleteTarget.kind === 'library') {
      router.delete(`/painel/midia/${deleteTarget.id}`, {
        preserveScroll: true,
        preserveState: true,
        onFinish: () => {
          setDeleting(false)
          setDeleteTarget(null)
        },
        onError: () => {
          setDeleting(false)
          setDeleteError('Erro ao excluir o arquivo.')
        },
      })
      return
    }

    // Exclusão por caminho (filesystem) — endpoint dedicado, via fetch.
    try {
      const res = await fetch('/painel/midia/arquivos/excluir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
        body: JSON.stringify({ path: deleteTarget.path }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setDeleteError(data?.error || 'Erro ao excluir o arquivo.')
        setDeleting(false)
        return
      }
      setDeleting(false)
      setDeleteTarget(null)
      router.reload({ preserveScroll: true })
    } catch {
      setDeleteError('Erro de conexão ao excluir.')
      setDeleting(false)
    }
  }

  const typeFilters: Array<{ value: string; label: string }> = [
    { value: '', label: 'Todos' },
    { value: 'image', label: 'Imagens' },
    { value: 'document', label: 'Documentos' },
  ]

  const tabs: Array<{ value: 'all' | 'library'; label: string; icon: LucideIcon }> = [
    { value: 'all', label: 'Todos os arquivos', icon: HardDrive },
    { value: 'library', label: 'Enviados por aqui', icon: UploadCloud },
  ]

  const isEmpty =
    tab === 'library' ? (library?.data.length ?? 0) === 0 : (allFiles?.data.length ?? 0) === 0

  return (
    <AdminLayout title="Biblioteca de Mídia">
      <Head title="Biblioteca de Mídia - Painel" />

      <PageHeader
        title="Biblioteca de Mídia"
        description="Imagens e documentos do site — enviados aqui ou vindos da migração"
        icon={FileImage}
        eyebrow="Site"
        variant="hero"
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
          PNG, JPG, WEBP, GIF, PDF, DOC, XLS, CSV ou ZIP — até 20MB por arquivo
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

      {/* Abas */}
      <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1 mb-5 w-full sm:w-fit">
        {tabs.map((t) => {
          const TabIcon = t.icon
          return (
            <button
              key={t.value}
              onClick={() => switchTab(t.value)}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors ${
                tab === t.value
                  ? 'bg-navy text-white'
                  : 'text-muted-foreground hover:text-navy hover:bg-navy/5'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Filtros */}
      <Toolbar>
        <SearchInput
          value={search}
          onChange={setSearch}
          onSearch={() => navigate({ search })}
          placeholder="Buscar por nome..."
          className="sm:w-72"
        />
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {typeFilters.map((tf) => (
            <button
              key={tf.value}
              onClick={() => navigate({ type: tf.value })}
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

      {/* Aviso de varredura limitada */}
      {tab === 'all' && allFiles?.truncated && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-l-4 border-l-amber-500 bg-amber-500/5 p-3 text-xs text-muted-foreground">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
          <span>
            A pasta de uploads tem muitos arquivos — a varredura foi limitada aos{' '}
            <strong className="text-foreground">{allFiles.scanned.toLocaleString('pt-BR')}</strong>{' '}
            mais relevantes. Use a busca por nome para localizar arquivos específicos.
          </span>
        </div>
      )}

      {/* Conteúdo */}
      {isEmpty ? (
        <EmptyState
          icon={FileImage}
          title="Nenhum arquivo encontrado"
          description={
            filters.search || filters.type
              ? 'Ajuste a busca ou os filtros e tente novamente.'
              : tab === 'all'
                ? 'Nenhum arquivo em public/uploads. Envie arquivos usando a área acima.'
                : 'Envie imagens e documentos usando a área acima.'
          }
        />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
            {tab === 'library'
              ? library!.data.map((item) => {
                  const key = `lib-${item.id}`
                  return (
                    <FileCard
                      key={key}
                      name={item.filename}
                      url={item.url}
                      size={item.size}
                      isImage={item.mime_type.startsWith('image/')}
                      copied={copiedKey === key}
                      onCopy={() => copyUrl(key, item.url)}
                      onDelete={() =>
                        requestDelete({ kind: 'library', id: item.id, label: item.filename })
                      }
                    />
                  )
                })
              : allFiles!.data.map((item) => {
                  const key = `fs-${item.path}`
                  return (
                    <FileCard
                      key={key}
                      name={item.name}
                      url={item.url}
                      size={item.size}
                      isImage={item.type === 'image' || isImageName(item.name)}
                      badge={item.tracked ? 'Biblioteca' : folderOf(item.path).replace('uploads/', '')}
                      copied={copiedKey === key}
                      onCopy={() => copyUrl(key, item.url)}
                      onDelete={() =>
                        requestDelete({
                          kind: 'fs',
                          path: item.path,
                          label: item.name,
                          tracked: item.tracked,
                        })
                      }
                    />
                  )
                })}
          </div>
          {meta && <Pagination meta={meta} baseUrl={baseUrl} itemLabel="arquivo" />}
        </div>
      )}

      {/* Confirmação de exclusão (biblioteca e filesystem) */}
      <Modal open={deleteTarget !== null} onClose={() => !deleting && setDeleteTarget(null)}>
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground text-center mb-2">Excluir arquivo</h3>
          <p className="text-muted-foreground text-center text-sm">
            Tem certeza que deseja excluir &ldquo;{deleteTarget?.label}&rdquo;? O arquivo será
            apagado do servidor e esta ação não pode ser desfeita.
          </p>
          {deleteTarget?.kind === 'fs' && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <FolderOpen className="w-3.5 h-3.5" />
              <code className="font-mono">/{folderOf(deleteTarget.path)}</code>
              {deleteTarget.tracked && <Badge tone="navy">Também na biblioteca</Badge>}
            </div>
          )}
          {deleteError && (
            <p className="mt-3 text-xs text-destructive text-center">{deleteError}</p>
          )}
        </div>
        <div className="flex gap-3 p-4 bg-muted/50 rounded-b-xl border-t border-border">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={confirmDelete}
            loading={deleting}
          >
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </Modal>
    </AdminLayout>
  )
}
