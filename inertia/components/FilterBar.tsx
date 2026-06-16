import type { ReactNode } from 'react'

/** Barra de filtros responsiva das listagens públicas (`.filter-bar` em app.css). */
export function FilterBar({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div data-reveal="up" className={`filter-bar mb-8 ${className}`.trim()}>
      {children}
    </div>
  )
}
