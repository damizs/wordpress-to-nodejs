import {
  getSiteTemplate,
  SITE_TEMPLATES,
  type HomeSectionKey,
  type SiteTemplateKey,
} from '~/lib/templates'

/** Tom de fundo aplicável a cada bloco da home via painel. */
export type SectionBgTone = 'default' | 'background' | 'muted' | 'navy' | 'secondary' | 'custom'

export interface SectionStyleConfig {
  bgTone: SectionBgTone
  /** Hex quando bgTone === 'custom' */
  bgColor?: string
}

export interface TemplateCustomConfig {
  homeOrder: HomeSectionKey[]
  sections: Partial<Record<HomeSectionKey, SectionStyleConfig>>
  newsLayout?: string
  newsCount?: number
}

export type TemplateConfigStore = Partial<Record<SiteTemplateKey, TemplateCustomConfig>>

export const HOME_SECTION_LABELS: Record<HomeSectionKey, string> = {
  news: 'Notícias',
  quickaccess: 'Acesso Rápido',
  esic: 'E-SIC',
  transparency: 'Transparência',
  vereadores: 'Vereadores',
  legislativo: 'Legislativo em Números',
  diario: 'Diário Oficial',
  instagram: 'Instagram',
  reels: 'Vídeos (Reels)',
  conheca: 'Conheça Sumé',
  seals: 'Selos e Certificações',
  survey: 'Pesquisa de Satisfação',
}

export const SECTION_BG_TONES: { key: SectionBgTone; label: string }[] = [
  { key: 'default', label: 'Padrão da seção' },
  { key: 'background', label: 'Fundo do site' },
  { key: 'muted', label: 'Cinza suave' },
  { key: 'secondary', label: 'Azul claro' },
  { key: 'navy', label: 'Navy (gradiente)' },
  { key: 'custom', label: 'Cor personalizada' },
]

const ALL_KEYS: HomeSectionKey[] = [
  'news',
  'quickaccess',
  'esic',
  'transparency',
  'vereadores',
  'legislativo',
  'diario',
  'instagram',
  'reels',
  'conheca',
  'seals',
  'survey',
]

export function parseTemplateConfig(raw: string | null | undefined): TemplateConfigStore {
  if (!raw?.trim()) return {}
  try {
    const parsed = JSON.parse(raw) as TemplateConfigStore
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

export function serializeTemplateConfig(store: TemplateConfigStore): string {
  return JSON.stringify(store)
}

/** Config efetiva do modelo: defaults do catálogo + overrides salvos. */
export function getTemplateCustomConfig(
  store: TemplateConfigStore,
  templateKey: string | null | undefined
): TemplateCustomConfig {
  const tpl = getSiteTemplate(templateKey)
  const saved = store[tpl.key as SiteTemplateKey]
  const defaultOrder = [...tpl.homeOrder]
  const homeOrder = saved?.homeOrder?.length
    ? normalizeOrder(saved.homeOrder, defaultOrder)
    : defaultOrder

  return {
    homeOrder,
    sections: saved?.sections ?? {},
    newsLayout: saved?.newsLayout,
    newsCount: saved?.newsCount ?? 5,
  }
}

/** Garante que todas as seções existam na ordem (appende as que faltam). */
function normalizeOrder(order: HomeSectionKey[], fallback: HomeSectionKey[]): HomeSectionKey[] {
  const valid = order.filter((k) => ALL_KEYS.includes(k))
  const seen = new Set(valid)
  for (const k of fallback) {
    if (!seen.has(k)) valid.push(k)
  }
  for (const k of ALL_KEYS) {
    if (!seen.has(k)) valid.push(k)
  }
  return valid
}

export function defaultConfigForTemplate(templateKey: SiteTemplateKey): TemplateCustomConfig {
  const tpl = SITE_TEMPLATES.find((t) => t.key === templateKey)!
  return {
    homeOrder: [...tpl.homeOrder],
    sections: {},
    newsCount: 5,
  }
}

export function resolveHomeOrder(
  templateKey: string | null | undefined,
  store: TemplateConfigStore
): HomeSectionKey[] {
  return getTemplateCustomConfig(store, templateKey).homeOrder
}

export function sectionStyle(
  store: TemplateConfigStore,
  templateKey: string | null | undefined,
  section: HomeSectionKey
): SectionStyleConfig | undefined {
  return getTemplateCustomConfig(store, templateKey).sections[section]
}

/** Classes/style para wrapper opcional da seção na home. */
export function sectionShellProps(style?: SectionStyleConfig): {
  className?: string
  style?: { backgroundColor?: string }
} {
  if (!style || style.bgTone === 'default') return {}
  if (style.bgTone === 'custom' && style.bgColor) {
    return { style: { backgroundColor: style.bgColor } }
  }
  const map: Record<Exclude<SectionBgTone, 'default' | 'custom'>, string> = {
    background: 'bg-background',
    muted: 'bg-muted/40',
    secondary: 'bg-secondary/50',
    navy: 'bg-gradient-hero text-primary-foreground',
  }
  return { className: map[style.bgTone as keyof typeof map] }
}
