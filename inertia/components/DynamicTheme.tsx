import { useEffect } from 'react'
import { usePage } from '@inertiajs/react'

interface SharedProps {
  siteSettings?: Record<string, string | null>
}

function hexToHslParts(hex: string): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null

  const r = Number.parseInt(result[1], 16) / 255
  const g = Number.parseInt(result[2], 16) / 255
  const b = Number.parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

const hsl = (p: { h: number; s: number; l: number }, deltaL = 0) =>
  `${p.h} ${p.s}% ${Math.min(100, Math.max(0, p.l + deltaL))}%`

/**
 * Aplica as cores configuradas no painel (Aparência) sobre os tokens
 * HSL do design system (--primary, --navy, --gold, --sky e variantes).
 */
export function DynamicTheme() {
  const { siteSettings } = usePage<{ props: SharedProps }>().props as SharedProps

  useEffect(() => {
    if (!siteSettings) return

    const root = document.documentElement

    if (siteSettings.color_navy) {
      const p = hexToHslParts(siteSettings.color_navy)
      if (p) {
        root.style.setProperty('--navy', hsl(p))
        root.style.setProperty('--navy-dark', hsl(p, -9))
        root.style.setProperty('--navy-light', hsl(p, +14))
        root.style.setProperty('--primary', hsl(p))
      }
    }

    if (siteSettings.color_gold) {
      const p = hexToHslParts(siteSettings.color_gold)
      if (p) {
        root.style.setProperty('--gold', hsl(p))
        root.style.setProperty('--gold-light', hsl(p, +13))
      }
    }

    if (siteSettings.color_sky) {
      const p = hexToHslParts(siteSettings.color_sky)
      if (p) {
        root.style.setProperty('--sky', hsl(p))
      }
    }
  }, [siteSettings])

  return null
}
