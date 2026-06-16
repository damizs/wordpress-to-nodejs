/** Remove tags HTML e normaliza espaços. */
export function stripHtml(html: string): string {
  return (html || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Gera ementa/resumo curto a partir de HTML ou texto. */
export function excerptFromText(text: string, maxLen = 220): string {
  const plain = /<[a-z]/i.test(text) ? stripHtml(text) : text.trim()
  if (!plain) return ''
  if (plain.length <= maxLen) return plain
  const cut = plain.slice(0, maxLen)
  const lastSpace = cut.lastIndexOf(' ')
  return `${lastSpace > 80 ? cut.slice(0, lastSpace) : cut}…`
}

/** Preferência: ementa explícita → 1º parágrafo útil do conteúdo. */
export function buildActivitySummary(
  ementa: string | null | undefined,
  content: string | null | undefined,
  title: string | null | undefined,
  maxLen = 220
): string {
  const fromEmenta = ementa ? excerptFromText(ementa, maxLen) : ''
  if (fromEmenta && fromEmenta.toLowerCase() !== (title || '').toLowerCase()) return fromEmenta

  const fromContent = content ? excerptFromText(content, maxLen) : ''
  if (fromContent) return fromContent

  return fromEmenta || ''
}
