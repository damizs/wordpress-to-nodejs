/**
 * Catálogo de MODELOS DE SITE (templates estruturais) selecionáveis no painel.
 *
 * Diferente de:
 *  - `layout_style` (lib/layouts.ts) → muda só FORMA/tipografia/densidade via CSS.
 *  - `theme_preset` / cores (lib/campaigns.tsx) → muda só a PALETA.
 *
 * O template muda a ESTRUTURA visível do front: arranjo do Header (posição da
 * logo, da navegação e da busca) e a ordem das seções na Home. É ortogonal aos
 * outros dois eixos — pode combinar qualquer template com qualquer cor/forma.
 *
 * As seções (notícias, acesso rápido, etc.) usam os MESMOS componentes do modelo
 * Institucional — só mudam cabeçalho, ordem e (no Compacto) a faixa inicial.
 */
export type SiteTemplateKey = 'institucional' | 'classico' | 'moderno' | 'compacto'

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
  /** Abertura nobre no topo da home (Compacto e Moderno têm hero próprio). */
  homeHero: boolean
  homeOrder: HomeSectionKey[]
  /**
   * Modelo de card de notícias padrão do template (chave de `news-layouts.ts`).
   * Só usado quando não há override salvo no painel nem `news_layout` global.
   */
  newsLayout?: string
  /** Quantidade padrão de notícias na home para este template. */
  newsCount?: number
}

export const SITE_TEMPLATES: SiteTemplate[] = [
  {
    key: 'institucional',
    label: 'Institucional (padrão)',
    description:
      'Cabeçalho em gradiente com logo central grande e menu em destaque. Home começa pelas notícias.',
    homeHero: false,
    homeOrder: DEFAULT_HOME_ORDER,
  },
  {
    key: 'classico',
    label: 'Clássico / Governamental',
    description:
      'Cabeçalho gov.br (identidade clara + menu navy). Mesmas seções do institucional, priorizando serviços ao cidadão.',
    homeHero: false,
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
      'Cabeçalho compacto sticky (logo menor). Abertura nobre (atalhos + indicadores do Legislativo); notícias logo abaixo.',
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
      'Cabeçalho slim + faixa de atalhos no topo. Cara de portal de notícias: ' +
      'notícias em lista densa logo no topo, seguidas de Diário, Instagram e Reels; ' +
      'serviços, vereadores e institucional abaixo.',
    homeHero: true,
    // Bloco editorial primeiro (notícias + feeds dinâmicos), depois serviços,
    // pessoas e institucional. Lista densa de manchetes para dar peso de portal.
    newsLayout: 'lista',
    newsCount: 6,
    homeOrder: [
      'news',
      'diario',
      'instagram',
      'reels',
      'legislativo',
      'transparency',
      'esic',
      'vereadores',
      'mesa',
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
