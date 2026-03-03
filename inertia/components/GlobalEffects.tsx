import { useEffect } from 'react'
import { usePage } from '@inertiajs/react'

interface SharedProps {
  siteSettings?: Record<string, string | null>
}

function hexToHSL(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '207 78% 21%'

  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return Math.round(h * 360) + ' ' + Math.round(s * 100) + '% ' + Math.round(l * 100) + '%'
}

export function GlobalEffects() {
  const { siteSettings } = usePage().props as SharedProps

  useEffect(() => {
    if (!siteSettings) return

    const root = document.documentElement

    // Dynamic Colors
    if (siteSettings.color_navy) {
      root.style.setProperty('--navy', hexToHSL(siteSettings.color_navy))
    }
    if (siteSettings.color_gold) {
      root.style.setProperty('--gold', hexToHSL(siteSettings.color_gold))
    }
    if (siteSettings.color_sky) {
      root.style.setProperty('--sky', hexToHSL(siteSettings.color_sky))
    }

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
