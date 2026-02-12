import { Link, usePage, router } from '@inertiajs/react'
import { FlashMessages } from '~/components/FlashMessages'
import {
  LayoutDashboard, Newspaper, Palette, ChevronLeft, ChevronRight,
  LogOut, Menu, X, User, Home, Users, FileText, Link2, Shield,
  ScrollText, Settings, Monitor, HelpCircle, BookOpen, Info, Tags, Calendar, Users2, Gavel, ClipboardCheck,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'

interface AdminLayoutProps {
  children: ReactNode
  title: string
}

const navItems = [
  { label: 'Dashboard', href: '/painel', icon: LayoutDashboard },
  { label: 'Homepage', href: '/painel/homepage', icon: Monitor },
  { label: 'Notícias', href: '/painel/noticias', icon: Newspaper },
  { label: 'Legislaturas', href: '/painel/legislaturas', icon: Settings },
  { label: 'Biênios', href: '/painel/bienios', icon: Calendar },
  { label: 'Vereadores', href: '/painel/vereadores', icon: Users },
  { label: 'Comissões', href: '/painel/comissoes', icon: Users2 },
  { label: 'Ativ. Legislativas', href: '/painel/atividades', icon: ScrollText },
  { label: 'Sessões / Atas', href: '/painel/sessoes', icon: FileText },
  { label: 'Publicações', href: '/painel/publicacoes', icon: FileText },
  { label: 'FAQ', href: '/painel/faq', icon: HelpCircle },
  { label: 'Pesquisa Satisfação', href: '/painel/pesquisa-satisfacao', icon: ClipboardCheck },
  { label: 'Transparência', href: '/painel/transparencia', icon: Shield },
  { label: 'Licitações', href: '/painel/licitacoes', icon: Gavel },
  { label: 'Acesso à Informação', href: '/painel/acesso-informacao', icon: Info },
  { label: 'Links Rápidos', href: '/painel/links-rapidos', icon: Link2 },
  { label: 'Categorias', href: '/painel/categorias', icon: Tags },
  { label: 'Aparência', href: '/painel/aparencia', icon: Palette },
]

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { auth } = usePage().props as any
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const currentUrl = usePage().url

  function isActive(href: string) {
    if (href === '/painel') return currentUrl === '/painel'
    return currentUrl.startsWith(href)
  }

  function handleLogout() {
    router.post('/logout')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FlashMessages />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-50 bg-navy-dark text-white transition-all duration-300 flex flex-col ${
        collapsed ? 'w-[72px]' : 'w-64'
      } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-white/10 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-lg bg-gold/20 flex items-center justify-center flex-shrink-0">
            <span className="text-gold font-serif font-bold text-lg">C</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">Câmara de Sumé</p>
              <p className="text-[10px] text-white/50">Painel Admin</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-gold/20 text-gold'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-3 space-y-2">
          <Link
            href="/"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors ${collapsed ? 'justify-center' : ''}`}
            target="_blank"
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Ver Site</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>

          {/* Collapse toggle (desktop) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-full py-2 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 hidden sm:inline">{auth?.user?.fullName}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
