import type { ReactNode } from 'react'

/** Container padrão do site: MESMA largura/padding do Breadcrumb. Use em todo
 *  conteúdo de página para alinhar a margem esquerda com o caminho de páginas. */
export function PageContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`container ${className}`.trim()}>{children}</div>
}
