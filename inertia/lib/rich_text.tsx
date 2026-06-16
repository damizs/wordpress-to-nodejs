/**
 * Renderizador de texto rico compartilhado (Páginas, Conteúdo Institucional, blocos).
 * Aceita HTML (TinyMCE) ou markdown-lite legado (**negrito**, listas, ## subtítulo).
 */
import { Fragment, type ReactNode } from 'react'

const HTML_LIKE = /<(?:p|br|div|ul|ol|li|h[1-6]|strong|em|a|img|table|blockquote)\b/i

function looksLikeHtml(text: string): boolean {
  return HTML_LIKE.test(text.trim())
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = []
  // links [label](url) | **bold** | *italic*
  const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index))
    if (m[1] !== undefined) {
      out.push(
        <a
          key={`${keyPrefix}-a${i}`}
          href={m[2]}
          target={m[2].startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {m[1]}
        </a>
      )
    } else if (m[3] !== undefined) {
      out.push(<strong key={`${keyPrefix}-b${i}`}>{m[3]}</strong>)
    } else if (m[4] !== undefined) {
      out.push(<em key={`${keyPrefix}-i${i}`}>{m[4]}</em>)
    }
    last = re.lastIndex
    i++
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

function renderLines(lines: string[], keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = []
  lines.forEach((line, li) => {
    if (li > 0) out.push(<br key={`${keyPrefix}-br${li}`} />)
    out.push(<Fragment key={`${keyPrefix}-l${li}`}>{renderInline(line, `${keyPrefix}-l${li}`)}</Fragment>)
  })
  return out
}

/** Renderiza um texto rico completo em parágrafos/listas/subtítulos React ou HTML. */
export function RichText({ text, className = '' }: { text: string; className?: string }) {
  if (!text || !text.trim()) return null

  if (looksLikeHtml(text)) {
    return (
      <div
        className={`prose prose-slate dark:prose-invert max-w-none prose-p:text-justify prose-img:rounded-lg ${className}`}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    )
  }

  const blocks = text.replace(/\r\n/g, '\n').split(/\n{2,}/)

  return (
    <div className={className}>
      {blocks.map((block, bi) => {
        const lines = block.split('\n').filter((l) => l.trim() !== '')
        if (lines.length === 0) return null

        if (lines.every((l) => l.trimStart().startsWith('- '))) {
          return (
            <ul key={bi} className="list-disc pl-6 space-y-1.5 my-4">
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.trimStart().slice(2), `b${bi}-li${li}`)}</li>
              ))}
            </ul>
          )
        }

        if (lines[0].startsWith('## ')) {
          return (
            <Fragment key={bi}>
              <h2 className="text-xl md:text-2xl font-bold mt-8 mb-3 text-foreground">
                {renderInline(lines[0].slice(3), `b${bi}-h`)}
              </h2>
              {lines.length > 1 && (
                <p className="leading-relaxed my-4">{renderLines(lines.slice(1), `b${bi}`)}</p>
              )}
            </Fragment>
          )
        }

        return (
          <p key={bi} className="leading-relaxed my-4">
            {renderLines(lines, `b${bi}`)}
          </p>
        )
      })}
    </div>
  )
}
