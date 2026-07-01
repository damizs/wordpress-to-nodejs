import { useEffect } from 'react'
import { usePage } from '@inertiajs/react'
import {
  CUSTOM_THEME_PRESET_KEY,
  getThemePreset,
  resolveActiveCampaign,
  type Campaign,
} from '~/lib/campaigns'
import { getLayoutStyle } from '~/lib/layouts'
import { getSiteTemplate } from '~/lib/templates'

interface SharedProps {
  siteSettings?: Record<string, string | null>
}

/**
 * Campanha sazonal ativa segundo o setting `campaign_mode`:
 * 'auto' (padrão) ativa no mês correspondente, 'off' desativa,
 * ou uma chave de campanha força a campanha o ano todo.
 */
export function useActiveCampaign(): Campaign | null {
  const { siteSettings } = usePage<{ props: SharedProps }>().props as SharedProps
  return resolveActiveCampaign(siteSettings?.campaign_mode, new Date().getMonth() + 1)
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
 * Vars que a campanha sazonal sobrescreve no <html> (escopo restrito a
 * "cantos estratégicos": header e footer via gradientes, botões/links via --primary).
 * Qualquer alteração aqui deve manter set e remove simétricos.
 */
const CAMPAIGN_VARS = ['--gradient-hero', '--gradient-navy', '--primary'] as const

function clearCampaignVars(root: HTMLElement) {
  for (const v of CAMPAIGN_VARS) root.style.removeProperty(v)
}

/**
 * Aplica as cores do tema sobre os tokens HSL do design system.
 *
 * Tema institucional (preset/custom) — injetado em uma <style> (e não como style
 * inline no <html>) para que os tokens do modo escuro / alto contraste
 * (html.dark / html.high-contrast, em app.css) consigam sobrescrevê-los:
 *  1. Preset de tema (theme_preset diferente de "custom")
 *  2. Cores customizadas do painel (color_navy / color_gold / color_sky)
 *
 * Campanha sazonal ativa — NÃO recolore o site inteiro: sobrescreve apenas
 * --gradient-hero (header), --gradient-navy (footer) e --primary (botões/links)
 * via style inline no <html>. --navy, --gold, --sky, fundos, badges e chips
 * permanecem na paleta institucional. Quando a campanha deixa de estar ativa
 * (campaign_mode 'off', mês sem campanha ou navegação SPA), as vars são
 * explicitamente removidas (removeProperty) e o tema normal volta a valer.
 */
export function DynamicTheme() {
  const { siteSettings } = usePage<{ props: SharedProps }>().props as SharedProps
  const campaign = useActiveCampaign()

  useEffect(() => {
    const root = document.documentElement

    /* ---- Estilo de layout (data-layout): forma/tipografia/densidade ----
       Ortogonal às cores. Aplicado sempre no efeito (consistência em
       navegação SPA) e persistido em localStorage para o script anti-flash
       do inertia_layout.edge reaplicar antes do paint na próxima visita. */
    const layout = getLayoutStyle(siteSettings?.layout_style).key
    root.dataset.layout = layout
    try {
      localStorage.setItem('layoutStyle', layout)
    } catch {
      /* ignore (modo privado / storage indisponível) */
    }

    /* ---- Modelo do site (data-template): estrutura do header/home ----
       Ortogonal a cores e ao layout_style. Persistido para o script
       anti-flash reaplicar antes do paint na próxima visita.
       Override explícito via query `?template=` (auditoria/preview): só vale
       quando a chave é um modelo conhecido; senão usa o setting do servidor. */
    const templateOverride = (() => {
      if (typeof window === 'undefined') return null
      const q = new URLSearchParams(window.location.search).get('template')
      return q && getSiteTemplate(q).key === q ? q : null
    })()
    const template = templateOverride ?? getSiteTemplate(siteSettings?.site_template).key
    root.dataset.template = template
    try {
      localStorage.setItem('siteTemplate', template)
    } catch {
      /* ignore */
    }

    /* ---- Campanha sazonal: apenas header, footer e botões ---- */
    const campaignBase = campaign ? hexToHslParts(campaign.colors.navy) : null
    if (campaignBase) {
      const p = campaignBase
      root.style.setProperty(
        '--gradient-navy',
        `linear-gradient(135deg, hsl(${hsl(p, -9)}) 0%, hsl(${hsl(p)}) 50%, hsl(${hsl(p, +14)}) 100%)`
      )
      root.style.setProperty(
        '--gradient-hero',
        `linear-gradient(180deg, hsl(${hsl(p, -9)}) 0%, hsl(${hsl(p)}) 60%, hsl(${hsl(p, +14)}) 100%)`
      )
      root.style.setProperty('--primary', hsl(p))
    } else {
      // Sem campanha ativa: remove explicitamente tudo que a campanha seta,
      // devolvendo header/footer/botões ao tema normal (preset/custom abaixo).
      clearCampaignVars(root)
    }

    /* ---- Tema institucional (preset/custom), independente da campanha ---- */
    if (siteSettings) {
      // "custom" usa as cores cadastradas. "navy" é legado de bancos antigos e
      // também preserva as cores cadastradas para não trocar a paleta no deploy.
      const preset = (() => {
        const key = siteSettings.theme_preset?.trim()
        if (!key || key === CUSTOM_THEME_PRESET_KEY || key === 'navy') return null
        return getThemePreset(key)
      })()

      const navyHex = preset?.navy ?? siteSettings.color_navy
      const goldHex = preset?.gold ?? siteSettings.color_gold
      const skyHex = preset?.sky ?? siteSettings.color_sky

      const rootVars: string[] = []
      const lightVars: string[] = []
      const darkVars: string[] = []

      if (navyHex) {
        const p = hexToHslParts(navyHex)
        if (p) {
          rootVars.push(`--navy: ${hsl(p)}`, `--navy-dark: ${hsl(p, -9)}`, `--navy-light: ${hsl(p, +14)}`)
          lightVars.push(`--primary: ${hsl(p)}`)
          // No modo escuro o primary precisa ser claro o suficiente para manter contraste
          darkVars.push(`--primary: ${p.h} ${Math.min(80, Math.max(p.s, 50))}% ${Math.max(p.l, 45)}%`)
        }
      }

      if (goldHex) {
        const p = hexToHslParts(goldHex)
        if (p) {
          rootVars.push(`--gold: ${hsl(p)}`, `--gold-light: ${hsl(p, +13)}`)
        }
      }

      if (skyHex) {
        const p = hexToHslParts(skyHex)
        if (p) {
          rootVars.push(`--sky: ${hsl(p)}`)
        }
      }

      const css = [
        rootVars.length ? `html:not(.high-contrast) { ${rootVars.join('; ')} }` : '',
        lightVars.length ? `html:not(.dark):not(.high-contrast) { ${lightVars.join('; ')} }` : '',
        darkVars.length ? `html.dark:not(.high-contrast) { ${darkVars.join('; ')} }` : '',
      ]
        .filter(Boolean)
        .join('\n')

      let styleEl = document.getElementById('dynamic-theme-style') as HTMLStyleElement | null
      if (!css) {
        styleEl?.remove()
      } else {
        if (!styleEl) {
          styleEl = document.createElement('style')
          styleEl.id = 'dynamic-theme-style'
          document.head.appendChild(styleEl)
        }
        styleEl.textContent = css
      }
    }

    // Cleanup: ao desmontar (ou antes de reaplicar) remove as vars da campanha,
    // para que nada fique "pintado" em navegações SPA fora do layout público.
    return () => clearCampaignVars(root)
  }, [siteSettings, campaign])

  return null
}
