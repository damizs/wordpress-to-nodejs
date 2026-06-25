/**
 * Renderizador público dos blocos de conteúdo do módulo "Páginas".
 * Os tipos espelham app/models/page.ts (PageBlock). Estilização com os
 * tokens do design system (navy/gold/muted/border/card) — nada de cores soltas.
 */
import { AlertTriangle, CheckCircle2, ChevronDown, Download, Info } from 'lucide-react'
import { RichText } from '~/lib/rich_text'

export type PageBlock =
  | { type: 'heading'; text: string }
  | { type: 'text'; text: string }
  | { type: 'image'; url: string; caption?: string; full?: boolean }
  | { type: 'documents'; items: { label: string; url: string }[] }
  | { type: 'accordion'; items: { title: string; body: string }[] }
  | { type: 'callout'; tone: 'info' | 'warning' | 'success'; text: string }
  | { type: 'buttons'; items: { label: string; url: string; variant: 'primary' | 'secondary' }[] }
  | { type: 'video'; url: string }
  | { type: 'columns'; layout: string; columns: PageBlock[][] }

/** Extrai o ID de vídeo do YouTube das formas comuns de URL (watch, youtu.be, embed, shorts, live). */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com|youtube-nocookie\.com)\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /[?&]v=([A-Za-z0-9_-]{11})/,
  ]
  for (const re of patterns) {
    const m = url.match(re)
    if (m) return m[1]
  }
  return null
}

function HeadingBlock({ text }: { text: string }) {
  return (
    <h2 className="flex items-center gap-3 text-xl md:text-2xl font-bold text-navy mt-10 mb-4 first:mt-0">
      <span className="w-1.5 h-7 rounded-full bg-gold shrink-0" aria-hidden="true" />
      {text}
    </h2>
  )
}

function ImageBlock({ url, caption, full }: { url: string; caption?: string; full?: boolean }) {
  if (!url) return null
  return (
    <figure className={`my-6 ${full ? 'w-full' : 'max-w-2xl mx-auto'}`}>
      <img
        src={url}
        alt={caption || ''}
        loading="lazy"
        className="w-full rounded-xl border border-border shadow-sm"
      />
      {caption && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

function DocumentsBlock({ items }: { items: { label: string; url: string }[] }) {
  const valid = (items || []).filter((d) => d?.url)
  if (valid.length === 0) return null
  return (
    <div className="my-6 rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
      {valid.map((doc, i) => (
        <a
          key={i}
          href={doc.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-foreground no-underline hover:bg-muted/60 transition-colors group"
        >
          <span className="w-9 h-9 rounded-lg bg-navy/10 text-navy flex items-center justify-center shrink-0 group-hover:bg-navy group-hover:text-white transition-colors">
            <Download className="w-4 h-4" />
          </span>
          <span className="min-w-0 truncate">{doc.label || doc.url}</span>
        </a>
      ))}
    </div>
  )
}

function AccordionBlock({ items }: { items: { title: string; body: string }[] }) {
  const valid = (items || []).filter((it) => it?.title)
  if (valid.length === 0) return null
  return (
    <div className="my-6 space-y-3">
      {valid.map((item, i) => (
        <details
          key={i}
          className="group rounded-xl border border-border bg-card overflow-hidden"
        >
          <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none text-sm md:text-[15px] font-semibold text-foreground hover:bg-muted/50 transition-colors [&::-webkit-details-marker]:hidden">
            {item.title}
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <div className="px-5 pb-4 pt-1 text-sm text-muted-foreground border-t border-border/60">
            <RichText text={item.body || ''} />
          </div>
        </details>
      ))}
    </div>
  )
}

const calloutStyles: Record<
  'info' | 'warning' | 'success',
  { wrapper: string; icon: typeof Info; iconColor: string }
> = {
  info: { wrapper: 'bg-sky/10 border-sky/30', icon: Info, iconColor: 'text-sky' },
  warning: {
    wrapper: 'bg-amber-500/10 border-amber-500/30',
    icon: AlertTriangle,
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  success: {
    wrapper: 'bg-emerald-600/10 border-emerald-600/30',
    icon: CheckCircle2,
    iconColor: 'text-emerald-700 dark:text-emerald-300',
  },
}

function CalloutBlock({ tone, text }: { tone: 'info' | 'warning' | 'success'; text: string }) {
  const style = calloutStyles[tone] || calloutStyles.info
  const Icon = style.icon
  return (
    <div className={`my-6 flex gap-3 rounded-xl border px-5 py-4 ${style.wrapper}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.iconColor}`} />
      <div className="text-sm text-foreground [&>div>p]:my-0 [&>div>p+p]:mt-3">
        <RichText text={text || ''} />
      </div>
    </div>
  )
}

function ButtonsBlock({
  items,
}: {
  items: { label: string; url: string; variant: 'primary' | 'secondary' }[]
}) {
  const valid = (items || []).filter((b) => b?.url && b?.label)
  if (valid.length === 0) return null
  return (
    <div className="my-6 flex flex-wrap gap-3">
      {valid.map((btn, i) => (
        <a
          key={i}
          href={btn.url}
          target={btn.url.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold no-underline transition-colors shadow-sm ${
            btn.variant === 'secondary'
              ? 'bg-card text-navy border border-navy/30 hover:bg-navy/5'
              : 'bg-navy text-white hover:bg-navy-dark'
          }`}
        >
          {btn.label}
        </a>
      ))}
    </div>
  )
}

function VideoBlock({ url }: { url: string }) {
  const id = extractYouTubeId(url)
  if (!id) return null
  return (
    <div className="my-6 aspect-video rounded-xl overflow-hidden border border-border shadow-sm bg-navy-dark">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title="Vídeo do YouTube"
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  )
}

function ColumnsBlock({ layout, columns }: { layout: string; columns: PageBlock[][] }) {
  const cols = Array.isArray(columns) ? columns : []
  const gridCls =
    layout === '1-1-1' || layout === '1-2' || layout === '2-1' ? 'md:grid-cols-3' : 'md:grid-cols-2'
  const spanFor = (i: number) => {
    if (layout === '1-2') return i === 1 ? 'md:col-span-2' : ''
    if (layout === '2-1') return i === 0 ? 'md:col-span-2' : ''
    return ''
  }
  if (cols.length === 0) return null
  return (
    <div className={`my-6 grid grid-cols-1 ${gridCls} gap-6`}>
      {cols.map((colBlocks, i) => (
        <div key={i} className={`min-w-0 ${spanFor(i)}`}>
          {(Array.isArray(colBlocks) ? colBlocks : []).map((b, j) => (
            <Block key={j} block={b} />
          ))}
        </div>
      ))}
    </div>
  )
}

function Block({ block }: { block: PageBlock }) {
  switch (block.type) {
    case 'heading':
      return <HeadingBlock text={block.text} />
    case 'columns':
      return <ColumnsBlock layout={block.layout} columns={block.columns} />
    case 'text':
      return <RichText text={block.text || ''} className="text-foreground/90" />
    case 'image':
      return <ImageBlock url={block.url} caption={block.caption} full={block.full} />
    case 'documents':
      return <DocumentsBlock items={block.items} />
    case 'accordion':
      return <AccordionBlock items={block.items} />
    case 'callout':
      return <CalloutBlock tone={block.tone} text={block.text} />
    case 'buttons':
      return <ButtonsBlock items={block.items} />
    case 'video':
      return <VideoBlock url={block.url} />
    default:
      return null
  }
}

export function BlockRenderer({ blocks }: { blocks: PageBlock[] }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null
  return (
    <div className="min-w-0">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}
