/**
 * Catálogo de MODELOS DE SITE (templates estruturais) selecionáveis no painel.
 *
 * Diferente de:
 *  - `layout_style` (lib/layouts.ts) → muda só FORMA/tipografia/densidade via CSS.
 *  - `theme_preset` / cores (lib/campaigns.tsx) → muda só a PALETA.
 *
 * O template muda a ESTRUTURA visível do front: arranjo do Header (posição da
 * logo, da navegação e da busca) e o "hero"/abertura da Home. É ortogonal aos
 * outros dois eixos — pode combinar qualquer template com qualquer cor/forma.
 *
 * Aplicado como atributo `data-template` no <html> (para hooks de CSS) e lido
 * pelos componentes Header/Home para escolher o arranjo.
 *
 * Consumido por:
 *  - DynamicTheme.tsx (aplica data-template no <html> + persiste em localStorage)
 *  - Header.tsx (arranjo do cabeçalho)
 *  - pages/home.tsx + components/HomeHero.tsx (abertura da home)
 *  - admin/settings/appearance.tsx (seletor de Modelo do Site)
 */
export type SiteTemplateKey = 'institucional' | 'classico' | 'moderno' | 'compacto'

/**
 * Chaves das seções da home (ver pages/home.tsx). A ordem é definida por modelo
 * em `homeOrder`. Seções escondidas no painel (section_*_visible=false) somem
 * independentemente da ordem.
 */
export type HomeSectionKey =
  | 'news'
  | 'quickaccess'
  | 'esic'
  | 'transparency'
  | 'vereadores'
  | 'mesa'
  | 'legislativo'
  | 'diario'
  | 'instagram'
  | 'reels'
  | 'conheca'
  | 'seals'
  | 'survey'

/** Ordem padrão (modelo Institucional) — não alterar sem motivo. */
export const DEFAULT_HOME_ORDER: HomeSectionKey[] = [
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

export interface SiteTemplate {
  key: SiteTemplateKey
  label: string
  description: string
  /** Mostra um hero de abertura na home (faixa com título + chamada + CTAs). */
  homeHero: boolean
  /** Ordem das seções internas da home para este modelo. */
  homeOrder: HomeSectionKey[]
}

export const SITE_TEMPLATES: SiteTemplate[] = [
  {
    key: 'institucional',
    label: 'Institucional (padrão)',
    description:
      'Cabeçalho em gradiente com logo central grande e menu em destaque. Home começa pelas notícias. Modelo atual da Câmara.',
    homeHero: false,
    homeOrder: DEFAULT_HOME_ORDER,
  },
  {
    key: 'classico',
    label: 'Clássico / Governamental',
    description:
      'Faixa navy com busca centralizada (estilo gov.br). Atalhos vêm na seção Acesso Rápido — sem duplicar cards no hero.',
    homeHero: true,
    // Foco em serviço ao cidadão: acesso rápido, e-SIC e transparência vêm antes.
    homeOrder: [
      'quickaccess',
      'esic',
      'transparency',
      'news',
      'legislativo',
      'vereadores',
      'mesa',
      'diario',
      'seals',
      'conheca',
      'instagram',
      'reels',
      'survey',
    ],
  },
  {
    key: 'moderno',
    label: 'Moderno / Destaque',
    description:
      'Hero navy com notícias em destaque integradas. Demais notícias e seções seguem em fundo claro.',
    homeHero: true,
    homeOrder: [
      'news',
      'vereadores',
      'mesa',
      'legislativo',
      'transparency',
      'quickaccess',
      'esic',
      'diario',
      'instagram',
      'reels',
      'conheca',
      'seals',
      'survey',
    ],
  },
  {
    key: 'compacto',
    label: 'Compacto / Notícias',
    description:
      'Cabeçalho slim sticky + abertura curta com busca e atalhos densos. Home prioriza notícias e conteúdo.',
    homeHero: true,
    homeOrder: [
      'news',
      'quickaccess',
      'legislativo',
      'diario',
      'transparency',
      'esic',
      'vereadores',
      'mesa',
      'instagram',
      'reels',
      'conheca',
      'seals',
      'survey',
    ],
  },
]

export const DEFAULT_SITE_TEMPLATE: SiteTemplateKey = 'institucional'

export function getSiteTemplate(key: string | null | undefined): SiteTemplate {
  return SITE_TEMPLATES.find((t) => t.key === key) ?? SITE_TEMPLATES[0]
}
