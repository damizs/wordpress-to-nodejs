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

export function DynamicTheme() {
  const { siteSettings } = usePage<{ props: SharedProps }>().props as SharedProps

  useEffect(() => {
    if (!siteSettings) return

    const root = document.documentElement

    // Cor Principal (Navy) - usa color_navy do banco
    if (siteSettings.color_navy) {
      const hsl = hexToHSL(siteSettings.color_navy)
      root.style.setProperty('--navy', hsl)
    }

    // Cor Destaque (Gold) - usa color_gold do banco
    if (siteSettings.color_gold) {
      const hsl = hexToHSL(siteSettings.color_gold)
      root.style.setProperty('--gold', hsl)
    }

    // Cor Secundária (Sky) - usa color_sky do banco
    if (siteSettings.color_sky) {
      const hsl = hexToHSL(siteSettings.color_sky)
      root.style.setProperty('--sky', hsl)
    }
  }, [siteSettings])

  return null
}
