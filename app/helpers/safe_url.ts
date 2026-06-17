const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])

export function normalizeSafeUrl(value: unknown, options: { allowRelative?: boolean } = {}) {
  const input = String(value ?? '').trim()
  if (!input) return null

  if (input.startsWith('/')) {
    if (input.startsWith('//')) return null
    return options.allowRelative === false ? null : input
  }

  try {
    const url = new URL(input)
    return ALLOWED_PROTOCOLS.has(url.protocol) ? url.toString() : null
  } catch {
    return null
  }
}

export function normalizeSafeWebUrl(value: unknown, options: { allowRelative?: boolean } = {}) {
  const url = normalizeSafeUrl(value, options)
  if (!url) return null
  if (url.startsWith('/')) return url
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : null
  } catch {
    return null
  }
}
