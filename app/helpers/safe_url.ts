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
    if (url.username || url.password) return null
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

/**
 * Defesa SSRF: indica se um hostname/IP aponta para faixas internas/privadas
 * (loopback, link-local, redes privadas IPv4/IPv6, metadata). Usado antes de
 * qualquer fetch() server-side de URLs cadastradas no painel.
 */
export function isPrivateHostname(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/^\[|\]$/g, '')
  if (!host) return true

  // Literais sempre bloqueados
  if (host === 'localhost' || host === 'metadata' || host.endsWith('.localhost')) return true
  if (host === 'metadata.google.internal' || host.endsWith('.internal')) return true

  // IPv6 loopback / link-local / unique-local (fc00::/7)
  if (host === '::1' || host === '::') return true
  if (host.startsWith('fe80:') || host.startsWith('fe80::')) return true
  if (/^f[cd][0-9a-f]{2}:/.test(host)) return true
  // IPv4 mapeado em IPv6 (::ffff:127.0.0.1)
  const v4mapped = host.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (v4mapped) return isPrivateIpv4(v4mapped[1])

  // IPv4
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return isPrivateIpv4(host)

  return false
}

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.').map((n) => Number(n))
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return true // malformado → trate como inseguro
  }
  const [a, b] = parts
  if (a === 127) return true // 127.0.0.0/8 loopback
  if (a === 10) return true // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true // 172.16.0.0/12
  if (a === 192 && b === 168) return true // 192.168.0.0/16
  if (a === 169 && b === 254) return true // 169.254.0.0/16 link-local (inclui metadata 169.254.169.254)
  if (a === 0) return true // 0.0.0.0/8
  return false
}

/**
 * Valida uma URL para fetch server-side seguro: aceita apenas http(s) e rejeita
 * destinos que apontem (literalmente) para hosts internos/privados. Não resolve
 * DNS — é defesa em profundidade sobre `normalizeSafeWebUrl`.
 */
export function assertFetchableWebUrl(value: unknown): string | null {
  const url = normalizeSafeWebUrl(value, { allowRelative: false })
  if (!url || url.startsWith('/')) return null
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return null
    if (isPrivateHostname(parsed.hostname)) return null
    return parsed.toString()
  } catch {
    return null
  }
}
