import { Link, usePage, router } from '@inertiajs/react'
import { FlashMessages } from '~/components/FlashMessages'
import {
  LayoutDashboard, Newspaper, Palette, ChevronLeft, ChevronRight, ChevronDown,
  LogOut, Menu, X, User, Home, Users, FileText, Link2, Shield, UserCog,
  ScrollText, Settings, Monitor, HelpCircle, BookOpen, Info, Tags, Calendar, Users2, Gavel, ClipboardCheck, Instagram, Image, Award, Radar, Vote,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'

interface AdminLayoutProps {
  children: ReactNode
  title: string
}

interface NavItem {
  label: string
  href?: string
  icon: any
  permissions?: string[] // exibe se o usuário tiver QUALQUER uma destas
  children?: { label: string; href: string; permissions?: string[] }[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/painel', icon: LayoutDashboard },
  { label: 'Homepage', href: '/painel/homepage', icon: Monitor, permissions: ['site.gerenciar'] },
  { 
    label: 'Notícias', 
    icon: Newspaper,
    permissions: ['noticia.criar', 'noticia.editar', 'instagram.gerenciar'],
    children: [
      { label: 'Todas as Notícias', href: '/painel/noticias', permissions: ['noticia.criar', 'noticia.editar'] },
      { label: 'Automação Instagram', href: '/painel/noticias/instagram', permissions: ['instagram.gerenciar'] },
    ]
  },
  { label: 'Legislaturas', href: '/painel/legislaturas', icon: Settings, permissions: ['legislativo.gerenciar'] },
  { label: 'Biênios', href: '/painel/bienios', icon: Calendar, permissions: ['legislativo.gerenciar'] },
  { label: 'Vereadores', href: '/painel/vereadores', icon: Users, permissions: ['legislativo.gerenciar'] },
  { label: 'Comissões', href: '/painel/comissoes', icon: Users2, permissions: ['legislativo.gerenciar'] },
  { label: 'Ativ. Legislativas', href: '/painel/atividades', icon: ScrollText, permissions: ['atividade.gerenciar'] },
  { label: 'Sessões / Atas', href: '/painel/sessoes', icon: FileText, permissions: ['sessao.gerenciar'] },
  { label: 'Votações Nominais', href: '/painel/votacoes', icon: Vote, permissions: ['votacao.gerenciar'] },
  { label: 'Publicações', href: '/painel/publicacoes', icon: FileText, permissions: ['publicacao.gerenciar'] },
  { label: 'FAQ', href: '/painel/faq', icon: HelpCircle, permissions: ['faq.gerenciar'] },
  { label: 'Pesquisa Satisfação', href: '/painel/pesquisa-satisfacao', icon: ClipboardCheck, permissions: ['pesquisa.gerenciar'] },
  { label: 'Transparência', href: '/painel/transparencia', icon: Shield, permissions: ['transparencia.gerenciar'] },
  { label: 'Licitações', href: '/painel/licitacoes', icon: Gavel, permissions: ['licitacao.gerenciar'] },
  { label: 'Acesso à Informação', href: '/painel/acesso-informacao', icon: Info, permissions: ['pntp.gerenciar'] },
  { label: 'Radar ATRICON', href: '/painel/atricon', icon: Radar, permissions: ['pntp.gerenciar'] },
  { label: 'Links Rápidos', href: '/painel/links-rapidos', icon: Link2, permissions: ['site.gerenciar'] },
  { label: 'Categorias', href: '/painel/categorias', icon: Tags, permissions: ['site.gerenciar'] },
  { label: 'Aparência', href: '/painel/aparencia', icon: Palette, permissions: ['site.gerenciar'] },
  { label: 'Fotos da Cidade', href: '/painel/configuracoes/fotos-cidade', icon: Image, permissions: ['site.gerenciar'] },
  {
    label: 'Usuários',
    icon: UserCog,
    permissions: ['usuario.gerenciar'],
    children: [
      { label: 'Todos os Usuários', href: '/painel/usuarios' },
      { label: 'Papéis e Permissões', href: '/painel/papeis' },
    ],
  },
]

function hasAny(userPermissions: string[], required?: string[]) {
  if (!required || required.length === 0) return true
  if (userPermissions.includes('*')) return true
  return required.some((p) => userPermissions.includes(p))
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { auth } = usePage().props as any
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Notícias'])
  const currentUrl = usePage().url

  const userPermissions: string[] = auth?.permissions ?? []
  const visibleNavItems = navItems
    .filter((item) => hasAny(userPermissions, item.permissions))
    .map((item) =>
      item.children
        ? { ...item, children: item.children.filter((c) => hasAny(userPermissions, c.permissions)) }
        : item
    )

  function isActive(href: string) {
    if (href === '/painel') return currentUrl === '/painel'
    return currentUrl.startsWith(href)
  }

  function isParentActive(item: NavItem) {
    if (item.children) {
      return item.children.some(child => currentUrl.startsWith(child.href))
    }
    return item.href ? isActive(item.href) : false
  }

  function toggleMenu(label: string) {
    setExpandedMenus(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label) 
        : [...prev, label]
    )
  }

  function handleLogout() {
    router.post('/logout')
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Verdana', Geneva, Tahoma, sans-serif" }}>
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
            <span className="text-gold font-bold text-lg">C</span>
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
          {visibleNavItems.map((item) => (
            <div key={item.label}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full ${
                      isParentActive(item)
                        ? 'bg-gold/20 text-gold'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    } ${collapsed ? 'justify-center' : 'justify-between'}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </span>
                    {!collapsed && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${expandedMenus.includes(item.label) ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {!collapsed && expandedMenus.includes(item.label) && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive(child.href)
                              ? 'bg-gold/10 text-gold'
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href!}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href!)
                      ? 'bg-gold/20 text-gold'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              )}
            </div>
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
