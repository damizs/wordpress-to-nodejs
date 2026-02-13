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
      <div className="bg-gray-100 py-3 border-b">
        <div className="max-w-6xl mx-auto px-4 text-sm text-gray-500 flex items-center gap-2 flex-wrap">
          <a href="/" className="hover:text-navy">Início</a>
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-2">
              <ChevronRight className="w-3 h-3" />
              {b.href ? (
                <a href={b.href} className="hover:text-navy">{b.label}</a>
              ) : (
                <span className="text-gray-700">{b.label}</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Hero banner */}
      <div className="bg-gradient-hero text-white py-14 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          {icon}
          <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
        </div>
        {subtitle && <p className="text-white/80 max-w-2xl mx-auto">{subtitle}</p>}
      </div>
    </>
  )
}
