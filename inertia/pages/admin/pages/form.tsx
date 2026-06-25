import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  Files,
  GripVertical,
  Heading2,
  Image as ImageIcon,
  Layers,
  Link2,
  ListChecks,
  Megaphone,
  Monitor,
  Plus,
  RotateCcw,
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
import { BlockRenderer } from '~/components/blocks/BlockRenderer'
import { RichText } from '~/lib/rich_text'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

let __blockUidSeq = 0
const nextBlockUid = () => `blk-${__blockUidSeq++}-${Math.round(performance.now())}`
const withUid = (b: EditorBlock): EditorBlock => (b.__uid ? b : { ...b, __uid: nextBlockUid() })

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

const PAGE_TEMPLATES: {
  label: string
  description: string
  blocks: EditorBlock[]
}[] = [
  {
    label: 'Carta de Serviços',
    description: 'Serviços, canais, prazos e formas de atendimento ao cidadão.',
    blocks: [
      { type: 'callout', tone: 'info', text: 'Use esta página para reunir os serviços prestados pela Câmara, canais de atendimento, prazos e requisitos.' },
      { type: 'heading', text: 'Serviços disponíveis' },
      {
        type: 'accordion',
        items: [
          { title: 'Atendimento ao cidadão', body: 'Informe aqui os canais presenciais, telefone, e-mail e horário de atendimento.' },
          { title: 'Protocolo e solicitações', body: 'Descreva como o cidadão pode protocolar pedidos, documentos e manifestações.' },
          { title: 'Acesso à informação', body: 'Indique o canal e-SIC, prazos legais e contato do responsável pelo SIC.' },
        ],
      },
      { type: 'heading', text: 'Canais de atendimento' },
      { type: 'buttons', items: [{ label: 'Acessar e-SIC', url: '/esic', variant: 'primary' }, { label: 'Falar com a Ouvidoria', url: '/ouvidoria', variant: 'secondary' }] },
    ],
  },
  {
    label: 'Página institucional',
    description: 'Texto de apresentação com imagem, destaque e documentos.',
    blocks: [
      { type: 'text', text: '<p>Escreva aqui a apresentação institucional da página. Use parágrafos curtos, subtítulos e links quando necessário.</p>' },
      { type: 'image', url: '', caption: '', full: true },
      { type: 'callout', tone: 'success', text: 'Destaque uma informação importante para o cidadão.' },
    ],
  },
  {
    label: 'Transparência com documentos',
    description: 'Resumo, PDFs e botões para consulta externa.',
    blocks: [
      { type: 'text', text: '<p>Informe a finalidade desta página, periodicidade de atualização e fonte dos dados.</p>' },
      { type: 'documents', items: [{ label: 'Documento oficial', url: '' }] },
      { type: 'buttons', items: [{ label: 'Consultar no portal externo', url: '', variant: 'primary' }] },
    ],
  },
  {
    label: 'Perguntas e respostas',
    description: 'Sanfona para dúvidas frequentes e orientações.',
    blocks: [
      {
        type: 'accordion',
        items: [
          { title: 'Pergunta principal', body: 'Resposta objetiva, com link para a página ou serviço quando necessário.' },
          { title: 'Como solicitar atendimento?', body: 'Explique o canal, prazo e documentos exigidos.' },
        ],
      },
    ],
  },
  {
    label: 'Contato / SIC',
    description: 'Autoridade, contatos, horário e links de solicitação.',
    blocks: [
      { type: 'callout', tone: 'warning', text: 'Atualize sempre que houver alteração do responsável, telefone, e-mail ou horário.' },
      { type: 'heading', text: 'Autoridade de monitoramento' },
      { type: 'text', text: '<p><strong>Nome:</strong> informe o responsável<br><strong>E-mail:</strong> informe o e-mail<br><strong>Telefone:</strong> informe o telefone</p>' },
      { type: 'buttons', items: [{ label: 'Abrir e-SIC', url: '/esic', variant: 'primary' }, { label: 'Ouvidoria', url: '/ouvidoria', variant: 'secondary' }] },
    ],
  },
]

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

function PagePreview({
  title,
  subtitle,
  blocks,
  content,
}: {
  title: string
  subtitle: string
  blocks: EditorBlock[]
  content: string
}) {
  const hasBlocks = Array.isArray(blocks) && blocks.length > 0

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="border-b border-border bg-gradient-hero px-5 py-7 text-center text-white">
        <span className="inline-flex rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-navy-dark">
          Prévia
        </span>
        <h2 className="mt-3 text-2xl font-bold">{title || 'Título da página'}</h2>
        {subtitle && <p className="mt-2 text-sm text-white/75">{subtitle}</p>}
      </div>
      <div className="max-h-[620px] overflow-auto p-5">
        {hasBlocks ? (
          <BlockRenderer blocks={blocks as any} />
        ) : content ? (
          <RichText text={content} className="text-foreground/90" />
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Adicione blocos ou texto simples para visualizar a página.
          </div>
        )}
      </div>
    </div>
  )
}

function SortableBlock({
  block,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onRemove,
  onChange,
}: {
  block: EditorBlock
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  onChange: (patch: Record<string, any>) => void
}) {
  const def = blockDef(block.type)
  const DefIcon = def?.icon || Type
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.__uid as string,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-border bg-muted/20">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border/70">
        <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-navy">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="Arrastar para reordenar bloco"
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <DefIcon className="w-4 h-4" />
          {def?.label || block.type}
        </span>
        <div className="flex items-center gap-0.5">
          <IconButton
            tone="neutral"
            title="Mover para cima"
            disabled={index === 0}
            className={index === 0 ? 'opacity-30 pointer-events-none' : ''}
            onClick={onMoveUp}
          >
            <ChevronUp className="w-4 h-4" />
          </IconButton>
          <IconButton
            tone="neutral"
            title="Mover para baixo"
            disabled={index === total - 1}
            className={index === total - 1 ? 'opacity-30 pointer-events-none' : ''}
            onClick={onMoveDown}
          >
            <ChevronDown className="w-4 h-4" />
          </IconButton>
          <IconButton tone="delete" title="Remover bloco" onClick={onRemove}>
            <Trash2 className="w-4 h-4" />
          </IconButton>
        </div>
      </div>
      <div className="p-4">
        <BlockFields block={block} onChange={onChange} />
      </div>
    </div>
  )
}

export default function PageForm({ page }: Props) {
  const isEditing = !!page
  const [slugEdited, setSlugEdited] = useState(isEditing)
  const [showAddMenu, setShowAddMenu] = useState(false)

  const initialData = {
    title: page?.title || '',
    slug: page?.slug || '',
    hero_subtitle: page?.hero_subtitle || '',
    meta_description: page?.meta_description || '',
    content: page?.content || '',
    is_published: page?.is_published ?? true,
    blocks: (page?.blocks || []).map(withUid) as EditorBlock[],
  }

  const { data, setData, post, put, processing, errors, transform } = useForm(initialData)
  // Remove o id efêmero de drag-drop (__uid) antes de enviar ao servidor.
  transform((d) => ({
    ...d,
    blocks: (d.blocks as EditorBlock[]).map(({ __uid, ...rest }) => rest),
  }))

  const handleTitleChange = (title: string) => {
    setData((d) => ({ ...d, title, slug: slugEdited ? d.slug : slugify(title) }))
  }

  const setBlocks = (blocks: EditorBlock[]) => setData((d) => ({ ...d, blocks }))

  const addBlock = (type: BlockType) => {
    setBlocks([...data.blocks, withUid(blockDef(type).make())])
    setShowAddMenu(false)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )
  const handleBlockDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (over && active.id !== over.id) {
      const oldI = data.blocks.findIndex((b) => b.__uid === active.id)
      const newI = data.blocks.findIndex((b) => b.__uid === over.id)
      if (oldI !== -1 && newI !== -1) setBlocks(arrayMove(data.blocks, oldI, newI))
    }
  }

  const applyTemplate = (template: (typeof PAGE_TEMPLATES)[number]) => {
    if (
      data.blocks.length > 0 &&
      !window.confirm('Substituir os blocos atuais por este modelo?')
    ) {
      return
    }
    setBlocks(template.blocks.map((block) => withUid(JSON.parse(JSON.stringify(block)))))
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

  const resetChanges = () => {
    setData(initialData)
    setSlugEdited(isEditing)
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

      <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-6">
        <Card>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-navy/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy">
                <Monitor className="h-3.5 w-3.5" />
                Editor visual
              </div>
              <h2 className="mt-3 text-lg font-bold text-foreground">Edite com blocos e confira a prévia</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sem Elementor, esta tela precisa concentrar as alterações comuns: conteúdo, ordem dos blocos,
                publicação, visualização e restauração antes de salvar.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {isEditing && data.slug && (
                <ButtonLink href={`/${data.slug}`} target="_blank" variant="secondary">
                  <Eye className="w-4 h-4" /> Ver no site
                </ButtonLink>
              )}
              <Button type="button" variant="secondary" onClick={resetChanges}>
                <RotateCcw className="w-4 h-4" /> Redefinir alterações
              </Button>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Layers className="h-4 w-4 text-navy" />
                1. Estrutura
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Adicione blocos conforme a necessidade da página.</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Eye className="h-4 w-4 text-navy" />
                2. Prévia
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Confira o resultado renderizado antes de salvar.</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Save className="h-4 w-4 text-navy" />
                3. Publicação
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Publique ou deixe como rascunho sem sair do editor.</p>
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">Modelos prontos</p>
                <p className="text-xs text-muted-foreground">
                  Use um ponto de partida e ajuste os blocos depois.
                </p>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">{data.blocks.length} bloco(s) na página</span>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
              {PAGE_TEMPLATES.map((template) => (
                <button
                  key={template.label}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="rounded-lg border border-border bg-muted/30 p-3 text-left transition-colors hover:border-navy/30 hover:bg-navy/5"
                >
                  <span className="block text-sm font-semibold text-foreground">{template.label}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{template.description}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.45fr)] xl:items-start">
          <div className="space-y-6 min-w-0">
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

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleBlockDragEnd}>
            <SortableContext
              items={data.blocks.map((b) => b.__uid as string)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {data.blocks.map((block, i) => (
                  <SortableBlock
                    key={block.__uid}
                    block={block}
                    index={i}
                    total={data.blocks.length}
                    onMoveUp={() => moveBlock(i, -1)}
                    onMoveDown={() => moveBlock(i, 1)}
                    onRemove={() => removeBlock(i)}
                    onChange={(patch) => updateBlock(i, patch)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

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

          </div>

          <aside className="xl:sticky xl:top-6 space-y-4 min-w-0">
            <Card>
              <CardHeader
                title="Pré-visualização"
                description="Atualiza conforme você edita os campos e blocos."
                icon={Eye}
              />
              <PagePreview
                title={data.title}
                subtitle={data.hero_subtitle}
                blocks={data.blocks}
                content={data.content}
              />
            </Card>
          </aside>
        </div>

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
