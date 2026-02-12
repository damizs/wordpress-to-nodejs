import { useState } from 'react'
import { Menu, X, Search, ChevronDown } from 'lucide-react'

const navItems = [
  { label: 'Início', href: '/' },
  { label: 'A Câmara', href: '/a-camara', hasDropdown: true },
  { label: 'Transparência', href: '/transparencia' },
  { label: 'Licitações', href: '/licitacoes' },
  { label: 'Servidor', href: '/servidor', hasDropdown: true },
  { label: 'Ouvidoria', href: '/ouvidoria' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  return (
    <header className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-sky-400/5 rounded-full blur-3xl" />
      </div>
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-5 mb-8">
          <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-gold-400/20 blur-xl" />
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full glass flex items-center justify-center border-2 border-white/20 group-hover:border-gold-400/50 transition-all duration-500 group-hover:scale-105">
              <div className="text-3xl md:text-4xl font-heading font-bold text-gold-400">C</div>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-heading font-bold tracking-tight">CÂMARA</h1>
            <p className="text-2xl md:text-4xl font-heading text-gold-400">DE SUMÉ</p>
            <p className="text-xs md:text-sm opacity-60 mt-2 tracking-wider uppercase">Casa Manoel Felipe dos Santos</p>
          </div>
        </div>

        <nav className="hidden md:block">
          <div className="glass rounded-2xl px-6 py-3 mx-auto max-w-3xl">
            <ul className="flex items-center justify-center gap-1">
              {navItems.map((item, i) => (
                <li key={i}>
                  <a href={item.href} className="relative flex items-center gap-1 px-4 py-2.5 text-sm font-medium tracking-wide rounded-xl hover:bg-white/10 transition-all duration-300 group">
                    {item.label}
                    {item.hasDropdown && <ChevronDown className="w-4 h-4 opacity-60" />}
                    <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-gold-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
                  </a>
                </li>
              ))}
              <li className="ml-2">
                <button className="p-2.5 hover:bg-white/10 rounded-xl transition-all"><Search className="w-5 h-5" /></button>
              </li>
            </ul>
          </div>
        </nav>

        <div className="md:hidden flex justify-center">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-3 glass rounded-xl">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <nav className="md:hidden mt-6 glass rounded-2xl p-4">
            <ul className="flex flex-col gap-1">
              {navItems.map((item, i) => (
                <li key={i}>
                  <a href={item.href} className="flex items-center justify-between py-3 px-4 text-sm font-medium hover:bg-white/10 rounded-xl" onClick={() => setMobileMenuOpen(false)}>
                    {item.label}
                    {item.hasDropdown && <ChevronDown className="w-4 h-4 opacity-60" />}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-navy-700 via-gold-400 to-sky-400" />
    </header>
  )
}
