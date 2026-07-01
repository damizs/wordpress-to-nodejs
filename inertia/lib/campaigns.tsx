/**
 * Catálogo de temas institucionais (presets de cor) e campanhas sazonais
 * de conscientização (Outubro Rosa, Novembro Azul, etc.).
 *
 * Consumido por:
 *  - DynamicTheme.tsx (aplica as cores sobre os tokens CSS)
 *  - CampaignBanner.tsx (faixa de divulgação da campanha ativa)
 *  - admin/settings/appearance.tsx (seção "Tema & Campanhas")
 */
import type { ReactNode } from 'react'

/* ============================== Temas (presets) ============================== */

export interface ThemePreset {
  key: string
  label: string
  navy: string
  gold: string
  sky: string
}

export const CUSTOM_THEME_PRESET_KEY = 'custom'

export const THEME_PRESETS: ThemePreset[] = [
  { key: 'navy', label: 'Navy (padrão)', navy: '#0a3d62', gold: '#d4a017', sky: '#2e86de' },
  { key: 'verde', label: 'Verde Bandeira', navy: '#0b5e34', gold: '#f4c20d', sky: '#2f9e44' },
  { key: 'vinho', label: 'Vinho', navy: '#641220', gold: '#c9a227', sky: '#ad2e4c' },
  { key: 'roxo', label: 'Roxo', navy: '#4c2a85', gold: '#d4a017', sky: '#845ef7' },
  { key: 'grafite', label: 'Grafite', navy: '#343a40', gold: '#d4a017', sky: '#868e96' },
]

export function getThemePreset(key: string | null | undefined): ThemePreset | null {
  if (!key || key === CUSTOM_THEME_PRESET_KEY) return null
  return THEME_PRESETS.find((p) => p.key === key) ?? null
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
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

/**
 * Converte um preset de tema nas CSS custom properties (HSL) dos tokens, para
 * aplicar uma paleta de forma escopada (ex.: só no painel admin, via style inline
 * no container — sem afetar o site público).
 */
export function presetToCssVars(preset: ThemePreset): Record<string, string> {
  const navy = hexToHslParts(preset.navy)
  if (!navy) return {}
  const gold = hexToHslParts(preset.gold)
  const sky = hexToHslParts(preset.sky)
  const fmt = (p: { h: number; s: number; l: number }, dl = 0) =>
    `${p.h} ${p.s}% ${Math.min(100, Math.max(0, p.l + dl))}%`
  const vars: Record<string, string> = {
    '--navy': fmt(navy),
    '--navy-dark': fmt(navy, -9),
    '--navy-light': fmt(navy, 14),
    '--primary': fmt(navy),
  }
  if (gold) {
    vars['--gold'] = fmt(gold)
    vars['--gold-light'] = fmt(gold, 12)
  }
  if (sky) vars['--sky'] = fmt(sky)
  return vars
}

/* ============================== Laço (ribbon) ============================== */

/**
 * Laço de conscientização: alça (loop) no topo e duas fitas cruzadas.
 * Mesmo desenho para todas as campanhas, mudando apenas a cor (fill).
 */
export function CampaignRibbon({
  color,
  className = 'w-5 h-5',
}: {
  color: string
  className?: string
}) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      {/* alça (loop) */}
      <path
        d="M16 2.5c-4.1 0-6.9 2.7-6.9 5.9 0 2.3 1.3 4.2 3.3 6.2l3.6 3.6 3.6-3.6c2-2 3.3-3.9 3.3-6.2 0-3.2-2.8-5.9-6.9-5.9Zm0 3.2c2.3 0 3.7 1.3 3.7 2.7 0 1.3-.9 2.5-2.4 4L16 13.7l-1.3-1.3c-1.5-1.5-2.4-2.7-2.4-4 0-1.4 1.4-2.7 3.7-2.7Z"
        fill={color}
      />
      {/* fita esquerda (desce cruzando para a direita) */}
      <path
        d="M12.2 13.9 21 26.6c.7 1 2 1.3 3 .6 1-.7 1.2-2 .6-3l-8.7-12c-.9.7-2.2 1.3-3.7 1.7Z"
        fill={color}
      />
      {/* fita direita (desce cruzando para a esquerda) */}
      <path
        d="M19.8 13.9 11 26.6c-.7 1-2 1.3-3 .6-1-.7-1.2-2-.6-3l8.7-12c.9.7 2.2 1.3 3.7 1.7Z"
        fill={color}
        opacity=".72"
      />
    </svg>
  )
}

/* ============================== Campanhas sazonais ============================== */

export interface Campaign {
  key: string
  label: string
  /** Meses (1-12) em que a campanha entra automaticamente */
  months: number[]
  colors: { navy: string; gold: string; sky: string }
  /** Frase curta exibida na faixa do site */
  message: string
  /** Cor-símbolo da campanha (usada no laço e gradientes) */
  color: string
  emblem: ReactNode
}

export const CAMPAIGNS: Campaign[] = [
  {
    key: 'outubro-rosa',
    label: 'Outubro Rosa',
    months: [10],
    color: '#d6336c',
    colors: { navy: '#a61e4d', gold: '#faa2c1', sky: '#d6336c' },
    message: 'Prevenção e diagnóstico precoce do câncer de mama salvam vidas.',
    emblem: <CampaignRibbon color="#d6336c" />,
  },
  {
    key: 'novembro-azul',
    label: 'Novembro Azul',
    months: [11],
    color: '#1971c2',
    colors: { navy: '#155a96', gold: '#74c0fc', sky: '#1971c2' },
    message: 'Mês de conscientização sobre a saúde do homem e o câncer de próstata.',
    emblem: <CampaignRibbon color="#1971c2" />,
  },
  {
    key: 'setembro-amarelo',
    label: 'Setembro Amarelo',
    months: [9],
    color: '#f59f00',
    colors: { navy: '#8a5a00', gold: '#ffd43b', sky: '#f59f00' },
    message: 'Falar é a melhor solução — mês de prevenção ao suicídio. Ligue 188 (CVV).',
    emblem: <CampaignRibbon color="#f59f00" />,
  },
  {
    key: 'maio-amarelo',
    label: 'Maio Amarelo',
    months: [5],
    color: '#fab005',
    colors: { navy: '#9c6a00', gold: '#ffe066', sky: '#fab005' },
    message: 'Atenção pela vida: mês de conscientização para um trânsito mais seguro.',
    emblem: <CampaignRibbon color="#fab005" />,
  },
  {
    key: 'junho-vermelho',
    label: 'Junho Vermelho',
    months: [6],
    color: '#e03131',
    colors: { navy: '#b02525', gold: '#ffa8a8', sky: '#e03131' },
    message: 'Doe sangue, doe vida — mês de incentivo à doação de sangue.',
    emblem: <CampaignRibbon color="#e03131" />,
  },
  {
    key: 'abril-azul',
    label: 'Abril Azul',
    months: [4],
    color: '#1c7ed6',
    colors: { navy: '#1864ab', gold: '#a5d8ff', sky: '#1c7ed6' },
    message: 'Mês de conscientização sobre o autismo: informação, respeito e inclusão.',
    emblem: <CampaignRibbon color="#1c7ed6" />,
  },
]

export function getCampaign(key: string | null | undefined): Campaign | null {
  if (!key) return null
  return CAMPAIGNS.find((c) => c.key === key) ?? null
}

/**
 * Resolve a campanha ativa a partir do modo configurado no painel.
 *  - 'off'  → nenhuma
 *  - 'auto' → a campanha cujo mês inclui o mês informado (1-12)
 *  - <key>  → campanha forçada manualmente
 */
export function resolveActiveCampaign(
  mode: string | null | undefined,
  month: number
): Campaign | null {
  // Sem setting definido → DESATIVADA por padrão (a câmara liga manualmente).
  const value = mode && mode.trim() !== '' ? mode : 'off'
  if (value === 'off') return null
  if (value === 'auto') return CAMPAIGNS.find((c) => c.months.includes(month)) ?? null
  return getCampaign(value)
}
