import { useEffect } from 'react'
import { usePage } from '@inertiajs/react'

interface SharedProps {
  siteSettings?: Record<string, string | null>
}

/** Hash estável (djb2) — cache-buster determinístico por URL (NÃO usa Date.now,
 *  para não recriar o favicon a cada render/navegação Inertia). */
function stableHash(input: string): string {
  let h = 5381
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h) ^ input.charCodeAt(i)
  }
  return (h >>> 0).toString(36)
}

/** Tipo MIME a partir da extensão (default png; suporta .ico). */
function faviconType(url: string): string {
  const clean = (url.split('?')[0] || '').toLowerCase()
  if (clean.endsWith('.ico')) return 'image/x-icon'
  if (clean.endsWith('.svg')) return 'image/svg+xml'
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg'
  if (clean.endsWith('.gif')) return 'image/gif'
  return 'image/png'
}

export function DynamicFavicon() {
  const { siteSettings } = usePage<{ props: SharedProps }>().props as SharedProps

  useEffect(() => {
    const raw = siteSettings?.favicon_url
    if (!raw || !raw.trim()) return

    const url = raw.trim()
    const type = faviconType(url)
    // Cache-buster ESTÁVEL: muda só quando a URL do favicon muda (NÃO a cada
    // visita), evitando re-download infinito mas garantindo a troca quando o
    // cliente envia um favicon novo.
    const href = url + (url.includes('?') ? '&' : '?') + 'v=' + stableHash(url)

    // Remove TODOS os <link rel*="icon"> (favicon estático + apple-touch + o
    // já renderizado pelo servidor) para o favicon enviado ser a única fonte.
    // rel="manifest" NÃO contém "icon", então é preservado.
    document.querySelectorAll('link[rel*="icon"]').forEach((el) => el.remove())

    const link = document.createElement('link')
    link.rel = 'icon'
    link.type = type
    link.href = href
    document.head.appendChild(link)

    const appleLink = document.createElement('link')
    appleLink.rel = 'apple-touch-icon'
    appleLink.href = href
    document.head.appendChild(appleLink)
  }, [siteSettings?.favicon_url])

  return null
}
