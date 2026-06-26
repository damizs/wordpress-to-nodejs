const ALLOWED_TAGS = new Set([
  'a',
  'abbr',
  'b',
  'blockquote',
  'br',
  'caption',
  'code',
  'col',
  'colgroup',
  'div',
  'em',
  'figcaption',
  'figure',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  's',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'u',
  'ul',
])

const GLOBAL_ATTRIBUTES = new Set(['class', 'title'])
const URL_ATTRIBUTES = new Set(['href', 'src'])

/**
 * Caracteres que contam como "vazio" num parágrafo. O `\s` do JS já cobre
 * espaço/tab/quebra de linha, o NBSP ( ) e o BOM/ZWNBSP (﻿); somamos
 * os zero-width (ZWSP/ZWNJ/ZWJ) que o `\s` não inclui.
 */
const BLANK_CHARS = /[\s\u200B\u200C\u200D]+/g

function isSafeUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return false
  if (trimmed.startsWith('/') || trimmed.startsWith('#') || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return true
  }
  try {
    const url = new URL(trimmed)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

/**
 * Um parágrafo é "vazio" quando, removidas as tags e os &nbsp;/espaços/
 * zero-width, não sobra texto — E ele não embute mídia (img/iframe/etc.).
 * Cobre os casos clássicos do WordPress: <p> </p>, <p>&nbsp;</p>,
 * <p><strong>&nbsp;</strong></p>, <p><span>&nbsp;</span></p>.
 */
function paragraphInnerIsBlank(inner: string) {
  if (/<(img|iframe|video|audio|svg|embed|object|picture|source|hr|input)\b/i.test(inner)) {
    return false
  }
  const text = inner
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|&#0*160;|&#x0*a0;/gi, ' ')
    .replace(BLANK_CHARS, '')
  return text.length === 0
}

/**
 * Limpeza por STRING (regex) — roda em qualquer ambiente, inclusive no SSR onde
 * não há DOM. Não substitui a sanitização robusta por DOM (allowlist) do
 * cliente, mas garante que o servidor NUNCA emita HTML cru/perigoso e produza um
 * resultado equivalente, em conteúdo, ao do cliente:
 *   - remove comentários, <script>/<style> (com conteúdo) e tags soltas deles;
 *   - remove atributos de evento on* (onclick, onerror, ...);
 *   - neutraliza URLs javascript: em href/src;
 *   - remove atributos style (mantém o tema/dark-safe, igual ao passo de DOM);
 *   - colapsa parágrafos vazios/whitespace-only (os "buracos verticais" do WP).
 */
export function sanitizeHtmlString(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style\s*>/gi, '')
    .replace(/<\/?(?:script|style)\b[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/(\s(?:href|src)\s*=\s*)("|')\s*javascript:[^"']*\2/gi, '$1$2#$2')
    .replace(/\sstyle\s*=\s*"[^"]*"/gi, '')
    .replace(/\sstyle\s*=\s*'[^']*'/gi, '')
    .replace(/\sstyle\s*=\s*[^\s>]+/gi, '')
    .replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (match, inner) =>
      paragraphInnerIsBlank(inner) ? '' : match
    )
}

function cleanNode(node: Node) {
  if (node.nodeType === Node.COMMENT_NODE) {
    node.parentNode?.removeChild(node)
    return
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return
  }

  const element = node as HTMLElement
  const tag = element.tagName.toLowerCase()

  if (!ALLOWED_TAGS.has(tag)) {
    const text = document.createTextNode(element.textContent || '')
    element.parentNode?.replaceChild(text, element)
    return
  }

  for (const attr of Array.from(element.attributes)) {
    const name = attr.name.toLowerCase()
    const value = attr.value
    const isDataAttr = name.startsWith('data-')
    const allowed =
      GLOBAL_ATTRIBUTES.has(name) ||
      isDataAttr ||
      (tag === 'a' && ['href', 'target', 'rel'].includes(name)) ||
      (tag === 'img' && ['src', 'alt', 'width', 'height', 'loading'].includes(name)) ||
      (['td', 'th'].includes(tag) && ['colspan', 'rowspan', 'scope'].includes(name))

    if (!allowed || name.startsWith('on')) {
      element.removeAttribute(attr.name)
      continue
    }

    if (URL_ATTRIBUTES.has(name) && !isSafeUrl(value)) {
      element.removeAttribute(attr.name)
    }
  }

  if (tag === 'a') {
    element.setAttribute('rel', 'noopener noreferrer')
    if (element.getAttribute('target') && element.getAttribute('target') !== '_blank') {
      element.removeAttribute('target')
    }
  }

  if (tag === 'img') {
    element.setAttribute('loading', 'lazy')
  }
}

/** Remove no DOM os parágrafos vazios remanescentes (mesma regra do string). */
function removeEmptyParagraphs(root: Element) {
  for (const p of Array.from(root.querySelectorAll('p'))) {
    if (p.querySelector('img, iframe, video, audio, svg, embed, object, picture, hr, input')) {
      continue
    }
    const text = (p.textContent || '').replace(BLANK_CHARS, '')
    if (text.length === 0) {
      p.parentNode?.removeChild(p)
    }
  }
}

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return ''

  // 1) Limpeza por string — SEMPRE (servidor e cliente). Garante SSR seguro
  //    (nunca devolve HTML cru) e já entrega uma base limpa para o passo de DOM.
  const pre = sanitizeHtmlString(html)

  // 2) No servidor (sem DOM) paramos aqui: o resultado já está saneado e é
  //    equivalente, em conteúdo, ao que o cliente produzirá — sem mismatch de
  //    hydration nem risco de XSS.
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return pre
  }

  // 3) No cliente, sanitização robusta por DOM (allowlist de tags/atributos).
  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div>${pre}</div>`, 'text/html')
  const root = doc.body.firstElementChild
  if (!root) return ''

  const walk = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT)
  const nodes: Node[] = []
  while (walk.nextNode()) nodes.push(walk.currentNode)
  nodes.forEach(cleanNode)

  removeEmptyParagraphs(root)

  return root.innerHTML
}
