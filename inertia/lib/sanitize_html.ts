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

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html || typeof window === 'undefined' || typeof DOMParser === 'undefined') return html || ''

  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html')
  const root = doc.body.firstElementChild
  if (!root) return ''

  const walk = doc.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT)
  const nodes: Node[] = []
  while (walk.nextNode()) nodes.push(walk.currentNode)
  nodes.forEach(cleanNode)

  return root.innerHTML
}
