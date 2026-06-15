/**
 * Catálogo de estilos de layout selecionáveis no painel.
 *
 * O estilo é aplicado como atributo `data-layout` no <html> e sobrescreve, via
 * CSS (inertia/css/app.css), apenas tokens de FORMA/TIPOGRAFIA/DENSIDADE
 * (--radius, sombras, font-family de headings...). É ORTOGONAL ao tema de cores
 * (theme_preset / campanhas): não altera a paleta.
 *
 * Consumido por:
 *  - DynamicTheme.tsx (aplica data-layout no <html> + persiste em localStorage)
 *  - admin/settings/appearance.tsx (seletor de Estilo de Layout)
 */
export interface LayoutStyle {
  key: string
  label: string
  description: string
}

export const LAYOUT_STYLES: LayoutStyle[] = [
  {
    key: 'institucional',
    label: 'Institucional',
    description: 'Estilo padrão da Câmara: cantos suaves, sombras equilibradas e header em gradiente.',
  },
  {
    key: 'clean',
    label: 'Minimalista',
    description: 'Visual flat com bastante respiro, bordas finas, cantos discretos e header sólido.',
  },
  {
    key: 'moderno',
    label: 'Moderno',
    description: 'Cantos bem arredondados (pill), sombras marcantes e títulos mais expressivos.',
  },
  {
    key: 'classico',
    label: 'Clássico',
    description: 'Aparência governamental formal: cantos retos, títulos em serifa e filete dourado nos cartões.',
  },
]

export const DEFAULT_LAYOUT_STYLE = 'institucional'

export function getLayoutStyle(key: string | null | undefined): LayoutStyle {
  return LAYOUT_STYLES.find((l) => l.key === key) ?? LAYOUT_STYLES[0]
}
