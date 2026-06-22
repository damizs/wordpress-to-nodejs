import { Link, usePage, router } from '@inertiajs/react'
import { FlashMessages } from '~/components/FlashMessages'
import { ErrorSummary } from '~/components/admin/ui'
import {
  LayoutDashboard, Newspaper, Palette, ChevronLeft, ChevronRight, ChevronDown,
  LogOut, Menu, User, Home, Users, FileText, Link2, Shield, UserCog,
  ScrollText, Settings, Monitor, HelpCircle, Info, Tags, Calendar, Users2,
  Gavel, ClipboardCheck, Image, Radar, Vote, ExternalLink, Award, Files,
  BookOpen, FolderOpen, Coins, FileSignature, FileBarChart, Search, X, HardDrive,
} from 'lucide-react'
import { useState, useEffect, type ReactNode } from 'react'

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

interface NavGroup {
  label: string | null
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: null,
    items: [{ label: 'Dashboard', href: '/painel', icon: LayoutDashboard }],
  },
  {
    label: 'Conteúdo',
    items: [
      {
        label: 'Notícias',
        icon: Newspaper,
        permissions: ['noticia.criar', 'noticia.editar', 'instagram.gerenciar'],
        children: [
          { label: 'Todas as Notícias', href: '/painel/noticias', permissions: ['noticia.criar', 'noticia.editar'] },
          { label: 'Automação Instagram', href: '/painel/noticias/instagram', permissions: ['instagram.gerenciar'] },
        ],
      },
      { label: 'Publicações', href: '/painel/publicacoes', icon: FileText, permissions: ['publicacao.gerenciar'] },
      { label: 'FAQ', href: '/painel/faq', icon: HelpCircle, permissions: ['faq.gerenciar'] },
    ],
  },
  {
    label: 'Legislativo',
    items: [
      { label: 'Vereadores', href: '/painel/vereadores', icon: Users, permissions: ['legislativo.gerenciar'] },
      { label: 'Comissões', href: '/painel/comissoes', icon: Users2, permissions: ['legislativo.gerenciar'] },
      { label: 'Legislaturas', href: '/painel/legislaturas', icon: Settings, permissions: ['legislativo.gerenciar'] },
      { label: 'Biênios', href: '/painel/bienios', icon: Calendar, permissions: ['legislativo.gerenciar'] },
      { label: 'Sessões', href: '/painel/sessoes', icon: FileText, permissions: ['sessao.gerenciar'] },
      { label: 'Atas', href: '/painel/atas', icon: FileText, permissions: ['sessao.gerenciar'] },
      { label: 'Pautas', href: '/painel/pautas', icon: ScrollText, permissions: ['sessao.gerenciar'] },
      { label: 'Ativ. Legislativas', href: '/painel/atividades', icon: ScrollText, permissions: ['atividade.gerenciar'] },
      { label: 'Votações Nominais', href: '/painel/votacoes', icon: Vote, permissions: ['votacao.gerenciar'] },
    ],
  },
  {
    label: 'Transparência',
    items: [
      { label: 'Transparência', href: '/painel/transparencia', icon: Shield, permissions: ['transparencia.gerenciar'] },
      { label: 'Duodécimos', href: '/painel/duodecimos', icon: Coins, permissions: ['transparencia.gerenciar'] },
      { label: 'Relatórios Fiscais', href: '/painel/relatorios-fiscais', icon: FileBarChart, permissions: ['transparencia.gerenciar'] },
      { label: 'Licitações', href: '/painel/licitacoes', icon: Gavel, permissions: ['licitacao.gerenciar'] },
      { label: 'Contratos', href: '/painel/contratos', icon: FileSignature, permissions: ['licitacao.gerenciar'] },
      { label: 'Acesso à Informação', href: '/painel/acesso-informacao', icon: Info, permissions: ['pntp.gerenciar'] },
      { label: 'Radar ATRICON', href: '/painel/atricon', icon: Radar, permissions: ['pntp.gerenciar'] },
      { label: 'Pesquisa Satisfação', href: '/painel/pesquisa-satisfacao', icon: ClipboardCheck, permissions: ['pesquisa.gerenciar'] },
    ],
  },
  {
    label: 'Site',
    items: [
      { label: 'Homepage', href: '/painel/homepage', icon: Monitor, permissions: ['site.gerenciar'] },
      { label: 'Páginas', href: '/painel/paginas', icon: Files, permissions: ['site.gerenciar'] },
      { label: 'Conteúdo Institucional', href: '/painel/institucional', icon: BookOpen, permissions: ['site.gerenciar'] },
      { label: 'Biblioteca de Mídia', href: '/painel/midia', icon: FolderOpen, permissions: ['site.gerenciar'] },
      { label: 'Aparência', href: '/painel/aparencia', icon: Palette, permissions: ['site.gerenciar'] },
      { label: 'Menus do Site', href: '/painel/menus', icon: Menu, permissions: ['site.gerenciar'] },
      { label: 'Feriados', href: '/painel/feriados', icon: Calendar, permissions: ['site.gerenciar'] },
      { label: 'Selos', href: '/painel/selos', icon: Award, permissions: ['site.gerenciar'] },
      { label: 'Links Rápidos', href: '/painel/links-rapidos', icon: Link2, permissions: ['site.gerenciar'] },
      { label: 'Categorias', href: '/painel/categorias', icon: Tags, permissions: ['site.gerenciar'] },
      { label: 'Fotos da Cidade', href: '/painel/configuracoes/fotos-cidade', icon: Image, permissions: ['site.gerenciar'] },
    ],
  },
  {
    label: 'Sistema',
    items: [
      {
        label: 'Usuários',
        icon: UserCog,
        permissions: ['usuario.gerenciar'],
        children: [
          { label: 'Todos os Usuários', href: '/painel/usuarios' },
          { label: 'Papéis e Permissões', href: '/painel/papeis' },
        ],
      },
      {
        label: 'Seguranca e Backups',
        href: '/painel/seguranca',
        icon: HardDrive,
        permissions: ['usuario.gerenciar'],
      },
    ],
  },
]

function hasAny(userPermissions: string[], required?: string[]) {
  if (!required || required.length === 0) return true
  if (userPermissions.includes('*')) return true
  return required.some((p) => userPermissions.includes(p))
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { auth, errors } = usePage().props as any
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [commandQuery, setCommandQuery] = useState('')
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(window.localStorage.getItem('admin_collapsed_groups') || '[]')
    } catch {
      return []
    }
  })
  const currentUrl = usePage().url

  const userPermissions: string[] = auth?.permissions ?? []
  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => hasAny(userPermissions, item.permissions))
        .map((item) =>
          item.children
            ? { ...item, children: item.children.filter((c) => hasAny(userPermissions, c.permissions)) }
            : item
        ),
    }))
    .filter((group) => group.items.length > 0)
  const commandItems = visibleGroups.flatMap((group) =>
    group.items.flatMap((item) => {
      const parent = group.label ? `${group.label} / ${item.label}` : item.label
      if (item.children && item.children.length > 0) {
        return item.children.map((child) => ({
          label: child.label,
          context: parent,
          href: child.href,
          icon: item.icon,
        }))
      }
      return item.href
        ? [{ label: item.label, context: group.label || 'Painel', href: item.href, icon: item.icon }]
        : []
    })
  )
  const commandNeedle = commandQuery.trim().toLowerCase()
  const filteredCommands = commandNeedle
    ? commandItems.filter((item) =>
        `${item.label} ${item.context} ${item.href}`.toLowerCase().includes(commandNeedle)
      )
    : commandItems.slice(0, 12)

  function isActive(href: string) {
    if (href === '/painel') return currentUrl === '/painel'
    return currentUrl.startsWith(href)
  }

  function isParentActive(item: NavItem) {
    if (item.children) {
      return item.children.some((child) => currentUrl.startsWith(child.href))
    }
    return item.href ? isActive(item.href) : false
  }

  function toggleMenu(label: string) {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    )
  }

  function toggleGroup(label: string) {
    setCollapsedGroups((prev) => {
      const next = prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
      try {
        window.localStorage.setItem('admin_collapsed_groups', JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  function handleLogout() {
    router.post('/logout')
  }

  function closeMobile() {
    setMobileOpen(false)
  }

  function openCommandPalette() {
    setCommandQuery('')
    setCommandOpen(true)
  }

  function visitCommand(href: string) {
    setCommandOpen(false)
    setCommandQuery('')
    router.visit(href)
  }

  // Bloqueia scroll do body quando o menu mobile está aberto
  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      if ((event.ctrlKey || event.metaKey) && key === 'k') {
        event.preventDefault()
        openCommandPalette()
      }
      if (event.key === 'Escape') {
        setCommandOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Fecha o menu ao navegar (Inertia)
  useEffect(() => {
    setMobileOpen(false)
  }, [currentUrl])

  const userName: string = auth?.user?.fullName || 'Usuário'
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p: string) => p[0])
    .join('')
    .toUpperCase()

  const itemClass = (active: boolean) =>
    `relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
      active
        ? 'bg-white/10 text-white before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-full before:bg-gold'
        : 'text-white/60 hover:text-white hover:bg-white/5'
    } ${collapsed ? 'justify-center px-0' : ''}`

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "'Inter Variable', 'Inter', Verdana, Geneva, sans-serif" }}>
      <FlashMessages />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {commandOpen && (
        <div className="fixed inset-0 z-[80] bg-black/45 p-4 backdrop-blur-sm" onClick={() => setCommandOpen(false)}>
          <div
            className="mx-auto mt-20 w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && filteredCommands[0]) {
                    visitCommand(filteredCommands[0].href)
                  }
                }}
                placeholder="Buscar módulo, ação ou configuração..."
                className="h-10 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
              />
              <button
                type="button"
                onClick={() => setCommandOpen(false)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Fechar busca"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[420px] overflow-y-auto p-2">
              {filteredCommands.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Nenhum atalho encontrado.
                </div>
              ) : (
                filteredCommands.map((item) => {
                  const ItemIcon = item.icon
                  return (
                    <button
                      key={`${item.href}-${item.label}`}
                      type="button"
                      onClick={() => visitCommand(item.href)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-muted"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-navy">
                        <ItemIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{item.label}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.context}</p>
                      </div>
                      <span className="hidden rounded bg-muted px-2 py-1 text-[11px] text-muted-foreground sm:inline">
                        {item.href}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 bg-navy-dark text-white transition-all duration-300 flex flex-col ${
          collapsed ? 'w-[68px]' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-white/10 shrink-0 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-navy-dark font-extrabold text-base">C</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight">Câmara de Sumé</p>
              <p className="text-[10px] text-white/40 tracking-wide uppercase">Painel administrativo</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-3 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
          {visibleGroups.map((group, gi) => {
            const groupCollapsed = !!group.label && collapsedGroups.includes(group.label)
            return (
            <div key={group.label ?? gi} className={gi > 0 ? 'mt-4' : ''}>
              {group.label && !collapsed && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label!)}
                  className="group/gh w-full flex items-center justify-between px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
                >
                  <span>{group.label}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${groupCollapsed ? '-rotate-90' : ''}`}
                  />
                </button>
              )}
              {group.label && collapsed && <div className="mx-3 my-3 border-t border-white/10" />}
              <div className={`space-y-0.5 ${groupCollapsed && !collapsed ? 'hidden' : ''}`}>
                {group.items.map((item) =>
                  item.children ? (
                    <div key={item.label}>
                      <button
                        onClick={() => toggleMenu(item.label)}
                        className={`${itemClass(isParentActive(item))} w-full ${collapsed ? '' : 'justify-between'}`}
                        title={collapsed ? item.label : undefined}
                      >
                        <span className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                          <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                          {!collapsed && <span>{item.label}</span>}
                        </span>
                        {!collapsed && (
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${
                              expandedMenus.includes(item.label) || isParentActive(item) ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </button>
                      {!collapsed && (expandedMenus.includes(item.label) || isParentActive(item)) && (
                        <div className="ml-[21px] mt-0.5 space-y-0.5 border-l border-white/10 pl-3 py-0.5">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={closeMobile}
                              className={`block px-2.5 py-2 rounded-md text-[12.5px] transition-colors ${
                                isActive(child.href)
                                  ? 'text-gold font-medium'
                                  : 'text-white/50 hover:text-white'
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href!}
                      onClick={closeMobile}
                      className={itemClass(isActive(item.href!))}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  )
                )}
              </div>
            </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-3 space-y-0.5 shrink-0">
          <Link
            href="/"
            target="_blank"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-white/50 hover:text-white hover:bg-white/5 transition-colors ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Ver site</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-white/50 hover:text-red-300 hover:bg-red-400/10 transition-colors w-full ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-full py-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main content — fluido (sem max-width); o site público continua com .container 1200px */}
      <div className={`min-w-0 transition-all duration-300 ${collapsed ? 'lg:ml-[68px]' : 'lg:ml-64'}`}>
        {/* Top bar */}
        <header className="h-16 bg-card/90 backdrop-blur border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2.5 min-h-[2.75rem] min-w-[2.75rem] rounded-lg hover:bg-muted text-muted-foreground"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground/70 leading-none mb-0.5">Painel</p>
              <h1 className="text-base font-bold text-foreground truncate leading-tight">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openCommandPalette}
              className="hidden md:inline-flex min-w-[220px] items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-navy/30 hover:bg-muted"
              aria-label="Buscar no painel"
            >
              <span className="inline-flex items-center gap-2">
                <Search className="h-3.5 w-3.5" />
                Buscar no painel
              </span>
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Ctrl K
              </kbd>
            </button>
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-navy hover:bg-muted transition-colors no-underline"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver site
            </Link>
            <div className="flex items-center gap-2.5 pl-2 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-[11px] font-bold ring-2 ring-gold/40">
                {initials || <User className="w-4 h-4" />}
              </div>
              <span className="text-sm font-medium text-foreground hidden md:inline max-w-[160px] truncate">
                {userName}
              </span>
            </div>
          </div>
        </header>

        {/* Page content — ocupa 100% da área útil; padding seguro nas bordas */}
        <main className="w-full min-w-0 px-4 py-4 sm:px-6 lg:px-8 lg:py-8 xl:px-10 2xl:px-12">
          {errors && Object.keys(errors).length > 0 && (
            <ErrorSummary errors={errors} className="mb-6" />
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
