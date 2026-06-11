import { useEffect } from 'react'
import { usePage } from '@inertiajs/react'

interface SharedProps {
  siteSettings?: Record<string, string | null>
}

export function GlobalEffects() {
  const { siteSettings } = usePage().props as SharedProps

  useEffect(() => {
    if (!siteSettings) return

    // Cores ficam por conta do DynamicTheme (no Header), que aplica o conjunto
    // completo de variáveis (--navy, --navy-dark, --primary...). Aplicar só
    // parte aqui causava tema inconsistente entre as seções.

    // Dynamic Favicon
    const faviconUrl = siteSettings.favicon_url
    if (faviconUrl) {
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]')
      existingFavicons.forEach(el => el.remove())

      const link = document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/png'
      link.href = faviconUrl
      document.head.appendChild(link)
    }
  }, [siteSettings])

  return null
}
