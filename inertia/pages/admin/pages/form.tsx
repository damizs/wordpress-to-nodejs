import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Files,
  Heading2,
  Image as ImageIcon,
  Layers,
  Link2,
  ListChecks,
  Megaphone,
  Plus,
  Save,
  Trash2,
  Type,
  Upload,
  Youtube,
  type LucideIcon,
} from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import {
  Button,
  ButtonLink,
  Card,
  CardHeader,
  Field,
  IconButton,
  Input,
  Select,
  Textarea,
} from '~/components/admin/ui'
import { extractYouTubeId } from '~/components/blocks/BlockRenderer'

/* ============================== Tipos ============================== */

type BlockType =
  | 'heading'
  | 'text'
  | 'image'
  | 'documents'
  | 'accordion'
  | 'callout'
  | 'buttons'
  | 'video'

/** Forma editável (campos livres por tipo — o servidor sanitiza). */
interface EditorBlock {
  type: BlockType
  [key: string]: any
}

interface PageData {
  id: number
  title: string
  slug: string
  content: string | null
  blocks: EditorBlock[] | null
  meta_description: string | null
  hero_subtitle: string | null
  is_published: boolean
}

interface Props {
  page: PageData | null
}

/* ============================== Helpers ============================== */

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

import { uploadMediaFile } from '~/lib/media_upload'
import RichTextEditor from '~/components/admin/RichTextEditor'

/** Botão de upload que envia para /painel/midia/upload e devolve a URL. */
function UploadButton({
  onUploaded,
  accept = 'image/*',
  label = 'Enviar arquivo',
}: {
  onUploaded: (url: string) => void
  accept?: string
  label?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      onUploaded(await uploadMediaFile(file))
    } catch (err: any) {
      setError(err?.message || 'Falha no upload')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        loading={busy}
        onClick={() => ref.current?.click()}
      >
        {!busy && <Upload className="w-3.5 h-3.5" />}
        {busy ? 'Enviando...' : label}
      </Button>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={handleChange} />
      {error && (
        <p className="mt-1 text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  )
}

/* ============================== Definições de blocos ============================== */

const BLOCK_DEFS: { type: BlockType; label: string; icon: LucideIcon; make: () => EditorBlock }[] =
  [
    { type: 'heading', label: 'Título de seção', icon: Heading2, make: () => ({ type: 'heading', text: '' }) },
    { type: 'text', label: 'Texto', icon: Type, make: () => ({ type: 'text', text: '' }) },
    { type: 'image', label: 'Imagem', icon: ImageIcon, make: () => ({ type: 'image', url: '', caption: '', full: false }) },
    { type: 'documents', label: 'Documentos', icon: Files, make: () => ({ type: 'documents', items: [{ label: '', url: '' }] }) },
    { type: 'accordion', label: 'Sanfona (FAQ)', icon: ListChecks, make: () => ({ type: 'accordion', items: [{ title: '', body: '' }] }) },
    { type: 'callout', label: 'Destaque', icon: Megaphone, make: () => ({ type: 'callout', tone: 'info', text: '' }) },
    { type: 'buttons', label: 'Botões', icon: Link2, make: () => ({ type: 'buttons', items: [{ label: '', url: '', variant: 'primary' }] }) },
    { type: 'video', label: 'Vídeo (YouTube)', icon: Youtube, make: () => ({ type: 'video', url: '' }) },
  ]

const blockDef = (type: BlockType) => BLOCK_DEFS.find((d) => d.type === type)!

/* ============================== Editores por tipo ============================== */

interface BlockEditorProps {
  block: EditorBlock
  onChange: (patch: Record<string, any>) => void
}

function HeadingEditor({ block, onChange }: BlockEditorProps) {
  return (
    <Input
      value={block.text || ''}
      onChange={(e) => onChange({ text: e.target.value })}
      placeholder="Texto do título de seção"
    />
  )
}

function TextEditor({ block, onChange }: BlockEditorProps) {
  return (
    <Field label="Texto" hint="Editor visual — negrito, listas, links e imagens.">
      <RichTextEditor
        value={block.text || ''}
        onChange={(html) => onChange({ text: html })}
        minHeight={260}
      />
    </Field>
  )
}

function ImageEditor({ block, onChange }: BlockEditorProps) {
  return (
    <div className="space-y-3">
      <Field label="URL da imagem" hint="Envie um arquivo ou cole uma URL.">
        <div className="flex gap-2 items-start">
          <Input
            value={block.url || ''}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="/uploads/... ou https://..."
          />
          <UploadButton label="Enviar imagem" onUploaded={(url) => onChange({ url })} />
        </div>
      </Field>
      {block.url && (
        <img
          src={block.url}
          alt="Pré-visualização"
          className="max-h-40 rounded-lg border border-border object-contain bg-muted/40"
        />
      )}
      <div className="grid sm:grid-cols-2 gap-3 items-end">
        <Field label="Legenda (opcional)">
          <Input
            value={block.caption || ''}
            onChange={(e) => onChange({ caption: e.target.value })}
            placeholder="Legenda exibida abaixo da imagem"
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-foreground pb-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={!!block.full}
            onChange={(e) => onChange({ full: e.target.checked })}
            className="w-4 h-4 rounded border-border accent-[hsl(var(--navy))]"
          />
          Largura total
        </label>
      </div>
    </div>
  )
}

function DocumentsEditor({ block, onChange }: BlockEditorProps) {
  const items: { label: string; url: string }[] = block.items || []
  const setItems = (next: typeof items) => onChange({ items: next })
  const updateItem = (i: number, patch: Partial<(typeof items)[number]>) =>
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex flex-wrap items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/60">
          <Input
            value={item.label || ''}
            onChange={(e) => updateItem(i, { label: e.target.value })}
            placeholder="Nome do documento"
            className="flex-1 min-w-[160px]"
          />
          <Input
            value={item.url || ''}
            onChange={(e) => updateItem(i, { url: e.target.value })}
            placeholder="URL do arquivo"
            className="flex-1 min-w-[160px]"
          />
          <UploadButton
            label="Enviar"
            accept="*/*"
            onUploaded={(url) => updateItem(i, { url })}
          />
          <IconButton
            tone="delete"
            title="Remover documento"
            onClick={() => setItems(items.filter((_, idx) => idx !== i))}
          >
            <Trash2 className="w-4 h-4" />
          </IconButton>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setItems([...items, { label: '', url: '' }])}
      >
        <Plus className="w-3.5 h-3.5" /> Adicionar documento
      </Button>
    </div>
  )
}

function AccordionEditor({ block, onChange }: BlockEditorProps) {
  const items: { title: string; body: string }[] = block.items || []
  const setItems = (next: typeof items) => onChange({ items: next })
  const updateItem = (i: number, patch: Partial<(typeof items)[number]>) =>
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border/60 space-y-2">
          <div className="flex items-start gap-2">
            <Input
              value={item.title || ''}
              onChange={(e) => updateItem(i, { title: e.target.value })}
              placeholder="Título do item"
            />
            <IconButton
              tone="delete"
              title="Remover item"
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
            >
              <Trash2 className="w-4 h-4" />
            </IconButton>
          </div>
          <Textarea
            value={item.body || ''}
            onChange={(e) => updateItem(i, { body: e.target.value })}
            rows={3}
            placeholder="Conteúdo do item (aceita markdown-lite)"
          />
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setItems([...items, { title: '', body: '' }])}
      >
        <Plus className="w-3.5 h-3.5" /> Adicionar item
      </Button>
    </div>
  )
}

function CalloutEditor({ block, onChange }: BlockEditorProps) {
  return (
    <div className="space-y-3">
      <Field label="Tom">
        <Select value={block.tone || 'info'} onChange={(e) => onChange({ tone: e.target.value })}>
          <option value="info">Informativo</option>
          <option value="warning">Atenção</option>
          <option value="success">Sucesso</option>
        </Select>
      </Field>
      <Field label="Texto">
        <Textarea
          value={block.text || ''}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={3}
          placeholder="Texto do destaque (aceita markdown-lite)"
        />
      </Field>
    </div>
  )
}

function ButtonsEditor({ block, onChange }: BlockEditorProps) {
  const items: { label: string; url: string; variant: string }[] = block.items || []
  const setItems = (next: typeof items) => onChange({ items: next })
  const updateItem = (i: number, patch: Partial<(typeof items)[number]>) =>
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="flex flex-wrap items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border/60">
          <Input
            value={item.label || ''}
            onChange={(e) => updateItem(i, { label: e.target.value })}
            placeholder="Rótulo do botão"
            className="flex-1 min-w-[140px]"
          />
          <Input
            value={item.url || ''}
            onChange={(e) => updateItem(i, { url: e.target.value })}
            placeholder="URL de destino"
            className="flex-1 min-w-[160px]"
          />
          <Select
            value={item.variant || 'primary'}
            onChange={(e) => updateItem(i, { variant: e.target.value })}
            className="w-32"
          >
            <option value="primary">Primário</option>
            <option value="secondary">Secundário</option>
          </Select>
          <IconButton
            tone="delete"
            title="Remover botão"
            onClick={() => setItems(items.filter((_, idx) => idx !== i))}
          >
            <Trash2 className="w-4 h-4" />
          </IconButton>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setItems([...items, { label: '', url: '', variant: 'primary' }])}
      >
        <Plus className="w-3.5 h-3.5" /> Adicionar botão
      </Button>
    </div>
  )
}

function VideoEditor({ block, onChange }: BlockEditorProps) {
  const videoId = extractYouTubeId(block.url || '')
  return (
    <div className="space-y-3">
      <Field
        label="URL do vídeo (YouTube)"
        hint="Aceita youtube.com/watch?v=..., youtu.be/..., shorts e embed."
      >
        <Input
          value={block.url || ''}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </Field>
      {block.url && !videoId && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Não foi possível identificar o vídeo nesta URL.
        </p>
      )}
      {videoId && (
        <img
          src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
          alt="Pré-visualização do vídeo"
          className="h-28 rounded-lg border border-border"
        />
      )}
    </div>
  )
}

function BlockFields({ block, onChange }: BlockEditorProps) {
  switch (block.type) {
    case 'heading':
      return <HeadingEditor block={block} onChange={onChange} />
    case 'text':
      return <TextEditor block={block} onChange={onChange} />
    case 'image':
      return <ImageEditor block={block} onChange={onChange} />
    case 'documents':
      return <DocumentsEditor block={block} onChange={onChange} />
    case 'accordion':
      return <AccordionEditor block={block} onChange={onChange} />
    case 'callout':
      return <CalloutEditor block={block} onChange={onChange} />
    case 'buttons':
      return <ButtonsEditor block={block} onChange={onChange} />
    case 'video':
      return <VideoEditor block={block} onChange={onChange} />
    default:
      return null
  }
}

/* ============================== Formulário ============================== */

export default function PageForm({ page }: Props) {
  const isEditing = !!page
  const [slugEdited, setSlugEdited] = useState(isEditing)
  const [showAddMenu, setShowAddMenu] = useState(false)

  const { data, setData, post, put, processing, errors } = useForm({
    title: page?.title || '',
    slug: page?.slug || '',
    hero_subtitle: page?.hero_subtitle || '',
    meta_description: page?.meta_description || '',
    content: page?.content || '',
    is_published: page?.is_published ?? true,
    blocks: (page?.blocks || []) as EditorBlock[],
  })

  const handleTitleChange = (title: string) => {
    setData((d) => ({ ...d, title, slug: slugEdited ? d.slug : slugify(title) }))
  }

  const setBlocks = (blocks: EditorBlock[]) => setData((d) => ({ ...d, blocks }))

  const addBlock = (type: BlockType) => {
    setBlocks([...data.blocks, blockDef(type).make()])
    setShowAddMenu(false)
  }

  const updateBlock = (index: number, patch: Record<string, any>) => {
    setBlocks(data.blocks.map((b, i) => (i === index ? { ...b, ...patch } : b)))
  }

  const removeBlock = (index: number) => {
    setBlocks(data.blocks.filter((_, i) => i !== index))
  }

  const moveBlock = (index: number, delta: -1 | 1) => {
    const target = index + delta
    if (target < 0 || target >= data.blocks.length) return
    const next = [...data.blocks]
    ;[next[index], next[target]] = [next[target], next[index]]
    setBlocks(next)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isEditing) put(`/painel/paginas/${page.id}`)
    else post('/painel/paginas')
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Página' : 'Nova Página'}>
      <Head title={(isEditing ? 'Editar' : 'Nova') + ' Página - Painel'} />

      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/painel/paginas"
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          {isEditing ? 'Editar Página' : 'Nova Página'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="admin-form">
        {/* ===== Dados gerais ===== */}
        <Card>
          <CardHeader title="Dados da página" icon={FileText} />
          <div className="space-y-5">
            <Field label="Título" required error={errors.title}>
              <Input
                value={data.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ex: Carta de Serviços ao Cidadão"
                required
              />
            </Field>

            <Field
              label="Slug (endereço)"
              required
              error={errors.slug}
              hint={`A página ficará em /${data.slug || 'slug-da-pagina'}`}
            >
              <Input
                value={data.slug}
                onChange={(e) => {
                  setSlugEdited(true)
                  setData('slug', slugify(e.target.value) || e.target.value.toLowerCase())
                }}
                placeholder="carta-de-servicos"
              />
            </Field>

            <Field label="Subtítulo do hero" hint="Frase curta exibida abaixo do título no topo da página.">
              <Input
                value={data.hero_subtitle}
                onChange={(e) => setData('hero_subtitle', e.target.value)}
                placeholder="Ex: Conheça os serviços oferecidos pela Câmara"
              />
            </Field>

            <Field
              label="Meta description (SEO)"
              hint="Descrição exibida nos resultados de busca (até ~160 caracteres)."
            >
              <Textarea
                value={data.meta_description}
                onChange={(e) => setData('meta_description', e.target.value)}
                rows={2}
                maxLength={255}
              />
            </Field>

            <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={data.is_published}
                onChange={(e) => setData('is_published', e.target.checked)}
                className="w-4 h-4 rounded border-border accent-[hsl(var(--navy))]"
              />
              Publicada (visível no site)
            </label>
          </div>
        </Card>

        {/* ===== Editor de blocos ===== */}
        <Card>
          <CardHeader
            title="Conteúdo em blocos"
            description="Monte a página combinando blocos. Use as setas para reordenar."
            icon={Layers}
          />

          {data.blocks.length === 0 && (
            <div className="rounded-xl border border-dashed border-border py-10 px-6 text-center mb-4">
              <Layers className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Nenhum bloco ainda. Adicione o primeiro bloco abaixo.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {data.blocks.map((block, i) => {
              const def = blockDef(block.type)
              const DefIcon = def?.icon || Type
              return (
                <div key={i} className="rounded-xl border border-border bg-muted/20">
                  <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border/70">
                    <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-navy">
                      <DefIcon className="w-4 h-4" />
                      {def?.label || block.type}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <IconButton
                        tone="neutral"
                        title="Mover para cima"
                        disabled={i === 0}
                        className={i === 0 ? 'opacity-30 pointer-events-none' : ''}
                        onClick={() => moveBlock(i, -1)}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </IconButton>
                      <IconButton
                        tone="neutral"
                        title="Mover para baixo"
                        disabled={i === data.blocks.length - 1}
                        className={
                          i === data.blocks.length - 1 ? 'opacity-30 pointer-events-none' : ''
                        }
                        onClick={() => moveBlock(i, 1)}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </IconButton>
                      <IconButton tone="delete" title="Remover bloco" onClick={() => removeBlock(i)}>
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </div>
                  </div>
                  <div className="p-4">
                    <BlockFields block={block} onChange={(patch) => updateBlock(i, patch)} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Menu de adicionar bloco */}
          <div className="mt-4">
            {showAddMenu ? (
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1 mb-2">
                  Escolha o tipo de bloco
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BLOCK_DEFS.map((def) => (
                    <button
                      key={def.type}
                      type="button"
                      onClick={() => addBlock(def.type)}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border text-muted-foreground hover:border-navy/40 hover:text-navy hover:bg-navy/5 transition-colors"
                    >
                      <def.icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{def.label}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-right">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddMenu(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button type="button" variant="secondary" onClick={() => setShowAddMenu(true)}>
                <Plus className="w-4 h-4" /> Adicionar bloco
              </Button>
            )}
          </div>
        </Card>

        {/* ===== Texto simples (fallback legado) ===== */}
        <Card>
          <CardHeader
            title="Texto simples (opcional)"
            description="Usado apenas quando a página não tem blocos. Aceita markdown-lite."
            icon={Type}
          />
          <Textarea
            value={data.content}
            onChange={(e) => setData('content', e.target.value)}
            rows={5}
            placeholder="Conteúdo em texto corrido..."
          />
        </Card>

        <div className="flex justify-end gap-3">
          <ButtonLink href="/painel/paginas" variant="secondary">
            Cancelar
          </ButtonLink>
          <Button type="submit" loading={processing}>
            {!processing && <Save className="w-4 h-4" />}
            {processing ? 'Salvando...' : 'Salvar página'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
