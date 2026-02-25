import { ChevronRight } from 'lucide-react'
import { type ReactNode } from 'react'

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeroProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  breadcrumbs: Breadcrumb[]
}

export function PageHero({ title, subtitle, icon, breadcrumbs }: PageHeroProps) {
  return (
    <>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3 border-b border-border">
        <nav className="flex items-center gap-2 text-sm flex-wrap">
          <a href="/" className="text-primary hover:underline">Página Inicial</a>
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              {b.href ? (
                <a href={b.href} className="text-primary hover:underline">{b.label}</a>
              ) : (
                <span className="text-foreground font-medium">{b.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Hero banner */}
      <section className="bg-gradient-hero py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            {icon && <span className="text-primary-foreground">{icon}</span>}
            <h1 className="text-2xl md:text-4xl font-bold text-primary-foreground text-center tracking-wide">
              {title.toUpperCase()}
            </h1>
          </div>
          {subtitle && (
            <p className="text-primary-foreground/80 max-w-2xl mx-auto text-center mt-2">
              {subtitle}
            </p>
          )}
        </div>
      </section>
    </>
  )
}
