import sanitizeHtmlLibrary from 'sanitize-html'

const ALLOWED_TAGS = [
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
]

function isSvgUrl(value: string | undefined) {
  if (!value) return false
  try {
    const url = new URL(value, 'https://local.invalid')
    return url.pathname.toLowerCase().endsWith('.svg')
  } catch {
    return value.toLowerCase().split('?')[0].endsWith('.svg')
  }
}

export function sanitizeRichHtml(value: unknown): string {
  const html = String(value ?? '')
  if (!html.trim()) return ''

  return sanitizeHtmlLibrary(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      '*': ['class', 'title', 'data-*'],
      a: ['href', 'target', 'rel', 'aria-label'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan', 'scope'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['http', 'https'],
    },
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: 'a',
        attribs: {
          ...attribs,
          rel: 'noopener noreferrer',
          ...(attribs.target === '_blank' ? { target: '_blank' } : {}),
        },
      }),
      img: (_tagName, attribs) => ({
        tagName: 'img',
        attribs: {
          ...attribs,
          loading: 'lazy',
        },
      }),
    },
    exclusiveFilter(frame) {
      return frame.tag === 'img' && isSvgUrl(frame.attribs.src)
    },
  }).trim()
}

export function sanitizePlainText(value: unknown): string {
  return sanitizeHtmlLibrary(String(value ?? ''), {
    allowedTags: [],
    allowedAttributes: {},
  }).trim()
}
