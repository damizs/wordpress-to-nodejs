/**
 * Modelos de exibição da seção de Notícias na home. Escolhido em
 * Aparência → Notícias (setting `news_layout`). Renderizado em
 * `inertia/components/NewsSection.tsx`.
 */
export interface NewsLayoutOption {
  key: string
  label: string
  description: string
}

export const NEWS_LAYOUTS: NewsLayoutOption[] = [
  {
    key: 'mosaico',
    label: 'Mosaico',
    description: '1 destaque grande + 4 menores sobrepostos. Visual de portal, bem cheio.',
  },
  {
    key: 'grade',
    label: 'Grade',
    description: 'Cards iguais em grade, imagem com título sobreposto. Limpo e simétrico.',
  },
  {
    key: 'lista',
    label: 'Lista',
    description: 'Linhas horizontais: miniatura à esquerda, título e resumo à direita.',
  },
  {
    key: 'destaque',
    label: 'Destaque + lista',
    description: '1 destaque grande à esquerda e uma lista compacta ao lado.',
  },
]

export const DEFAULT_NEWS_LAYOUT = 'mosaico'

export function getNewsLayout(key?: string | null): string {
  return NEWS_LAYOUTS.some((l) => l.key === key) ? (key as string) : DEFAULT_NEWS_LAYOUT
}
