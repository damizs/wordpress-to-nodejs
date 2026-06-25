import { Head, Link, usePage } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { StatusBadge, Card, StatCard } from '~/components/admin/ui'
import {
  Newspaper, FileText, Users, ArrowUpRight, Clock, Gavel, ScrollText,
  ShoppingCart, FolderOpen, MessageSquare, CalendarDays, Radar,
  BarChart3, PieChart, Activity, CheckCircle2, AlertTriangle, ListChecks,
} from 'lucide-react'

interface Props {
  stats: Record<string, number>
  recentNews: Array<{
    id: number
    title: string
    status: string
    created_at: string
    category?: { name: string } | null
  }>
  upcomingSessions: Array<{ id: number; title: string; date: string }>
  contentHealth: Array<{
    key: string
    label: string
    href: string
    total: number
    latest: string | null
    daysSince: number | null
    status: 'em_dia' | 'desatualizado' | 'vazio'
    detail: string
  }>
  userName: string
}

export default function Dashboard({ stats, recentNews, upcomingSessions, contentHealth, userName }: Props) {
  const { auth } = usePage().props as any
  const permissions: string[] = auth?.permissions || []
  const can = (p: string) => permissions.includes(p) || permissions.includes('*')

  // Cartões de estatística — só aparecem se o backend mandou o número.
  // Paleta restrita: navy (institucional), gold (destaque) e emerald/amber (semântico).
  const statCards = [
    { key: 'publishedNews', label: 'Notícias publicadas', icon: Newspaper, accent: 'text-emerald-700 dark:text-emerald-300 bg-emerald-600/10', href: '/painel/noticias?status=published' },
    { key: 'draftNews', label: 'Rascunhos', icon: FileText, accent: 'text-amber-700 dark:text-amber-300 bg-amber-500/10', href: '/painel/noticias?status=draft' },
    { key: 'scheduledSessions', label: 'Sessões agendadas', icon: Gavel, accent: 'text-navy bg-navy/10', href: '/painel/sessoes' },
    { key: 'councilors', label: 'Vereadores ativos', icon: Users, accent: 'text-navy bg-navy/10', href: '/painel/vereadores' },
    { key: 'openLicitacoes', label: 'Licitações abertas', icon: ShoppingCart, accent: 'text-emerald-700 dark:text-emerald-300 bg-emerald-600/10', href: '/painel/licitacoes' },
    { key: 'pntpRecords', label: 'Registros PNTP', icon: FolderOpen, accent: 'text-navy bg-navy/10', href: '/painel/acesso-informacao' },
    { key: 'atriconPending', label: 'Pendências ATRICON', icon: Radar, accent: 'text-amber-700 dark:text-amber-300 bg-amber-500/10', href: '/painel/atricon' },
    { key: 'publications', label: 'Publicações oficiais', icon: ScrollText, accent: 'text-navy bg-navy/10', href: '/painel/publicacoes' },
    { key: 'surveyResponses', label: 'Respostas da pesquisa', icon: MessageSquare, accent: 'text-navy bg-navy/10', href: '/painel/pesquisa-satisfacao' },
  ].filter((c) => stats[c.key] !== undefined)

  // Ações rápidas conforme o que a pessoa pode fazer
  const quickActions = [
    { label: 'Nova Notícia', href: '/painel/noticias/criar', icon: Newspaper, show: can('noticia.criar') },
    { label: 'Nova Sessão', href: '/painel/sessoes/criar', icon: Gavel, show: can('sessao.gerenciar') },
    { label: 'Nova Licitação', href: '/painel/licitacoes/criar', icon: ShoppingCart, show: can('licitacao.gerenciar') },
    { label: 'Nova Publicação', href: '/painel/publicacoes/criar', icon: ScrollText, show: can('publicacao.gerenciar') },
    { label: 'Novo Registro PNTP', href: '/painel/acesso-informacao/criar', icon: FolderOpen, show: can('pntp.gerenciar') },
  ].filter((a) => a.show)

  const firstName = (userName || '').split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  const statTotal = statCards.reduce((sum, card) => sum + Number(stats[card.key] || 0), 0)
  const chartCards = statCards.filter((card) => Number(stats[card.key] || 0) > 0)
  const maxStat = Math.max(1, ...statCards.map((card) => Number(stats[card.key] || 0)))
  const atriconTotal = Number(stats.atriconPending || 0)
  const pntpTotal = Number(stats.pntpRecords || 0)
  const complianceScore = pntpTotal + atriconTotal > 0
    ? Math.round((pntpTotal / (pntpTotal + atriconTotal)) * 100)
    : null
  // Paleta categórica derivada dos tokens HSL (dark-safe) — nunca hex fixo (§3).
  const donutColors = [
    'hsl(var(--navy))',
    'hsl(var(--gold))',
    'hsl(var(--sky))',
    'hsl(var(--navy-light))',
    'hsl(var(--gold-light))',
    'hsl(var(--primary))',
    'hsl(var(--destructive))',
    'hsl(var(--muted-foreground))',
  ]
  const donutLabel = chartCards
    .slice(0, 7)
    .map((card) => `${card.label}: ${stats[card.key]}`)
    .join(', ')
  const healthMeta = {
    em_dia: {
      label: 'Em dia',
      icon: CheckCircle2,
      badge: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-300',
      iconClass: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-300',
    },
    desatualizado: {
      label: 'Desatualizado',
      icon: AlertTriangle,
      badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
      iconClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    },
    vazio: {
      label: 'Vazio',
      icon: AlertTriangle,
      badge: 'bg-destructive/10 text-destructive',
      iconClass: 'bg-destructive/10 text-destructive',
    },
  } as const
  const needsAttention = contentHealth.filter((item) => item.status !== 'em_dia')

  const formatHealthDate = (iso: string | null) => {
    if (!iso) return 'Sem registro'
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return 'Sem registro'
    return d.toLocaleDateString('pt-BR')
  }

  const StatDonut = () => {
    if (chartCards.length === 0 || statTotal === 0) {
      return (
        <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
          Sem dados suficientes para o gráfico
        </div>
      )
    }

    let donutOffset = 25

    return (
      <div className="grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
        <div className="relative mx-auto h-52 w-52">
          <svg
            viewBox="0 0 120 120"
            className="h-full w-full -rotate-90"
            role="img"
            aria-label={`Distribuição dos módulos: ${statTotal} registros no total. ${donutLabel}`}
          >
            <circle
              cx="60"
              cy="60"
              r="40"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="16"
              aria-hidden="true"
            />
            {chartCards.map((card, index) => {
              const value = Number(stats[card.key] || 0)
              const length = (value / statTotal) * 251.2
              const segment = (
                <circle
                  key={card.key}
                  aria-hidden="true"
                  cx="60"
                  cy="60"
                  r="40"
                  fill="none"
                  stroke={donutColors[index % donutColors.length]}
                  strokeWidth="16"
                  strokeDasharray={`${length} ${251.2 - length}`}
                  strokeDashoffset={-donutOffset}
                  strokeLinecap="round"
                />
              )
              donutOffset += length
              return segment
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold text-foreground tabular-nums">{statTotal}</span>
            <span className="text-xs font-medium text-muted-foreground">registros</span>
          </div>
        </div>
        <div className="space-y-2">
          {chartCards.slice(0, 7).map((card, index) => (
            <div key={card.key} className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: donutColors[index % donutColors.length] }} />
                <span className="truncate text-sm font-medium text-foreground">{card.label}</span>
              </div>
              <span className="text-sm font-bold tabular-nums text-foreground">{stats[card.key]}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <AdminLayout title="Dashboard">
      <Head title="Dashboard - Painel" />

      {/* Hero de boas-vindas — lidera o dashboard */}
      <div className="bg-gradient-hero rounded-2xl px-6 py-7 lg:px-8 mb-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <p className="text-white/75 text-xs capitalize mb-1">{today}</p>
            <h2 className="text-2xl font-bold mb-1">
              {greeting}, {firstName}!
            </h2>
            <p className="text-sm text-white/80">Aqui está o resumo das suas áreas de trabalho.</p>
          </div>
          {quickActions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-gold hover:text-navy-dark border border-white/15 rounded-xl text-[13px] font-semibold transition-colors no-underline"
                >
                  <action.icon className="w-4 h-4" /> {action.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {statCards.length > 0 && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)] mb-8">
          <Card>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-navy/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy">
                  <PieChart className="h-3.5 w-3.5" />
                  Panorama
                </div>
                <h2 className="mt-3 text-xl font-bold text-foreground">Distribuição dos módulos</h2>
                <p className="text-sm text-muted-foreground">Volume geral dos conteúdos e rotinas sob sua permissão.</p>
              </div>
              <div className="rounded-xl bg-muted/60 px-4 py-2 text-right">
                <p className="text-2xl font-bold text-foreground tabular-nums">{statTotal}</p>
                <p className="text-xs font-medium text-muted-foreground">itens monitorados</p>
              </div>
            </div>
            <StatDonut />
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Conformidade</h2>
                <p className="text-xs text-muted-foreground">PNTP e Radar ATRICON</p>
              </div>
            </div>

            {complianceScore === null ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                Sem dados de conformidade para calcular o painel.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="relative mx-auto h-40 w-40">
                  <svg
                    viewBox="0 0 120 120"
                    className="h-full w-full -rotate-90"
                    role="img"
                    aria-label={`Conformidade estimada: ${complianceScore}%. ${pntpTotal} registros PNTP, ${atriconTotal} pendências ATRICON`}
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="42"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="14"
                      aria-hidden="true"
                    />
                    <circle
                      aria-hidden="true"
                      cx="60"
                      cy="60"
                      r="42"
                      fill="none"
                      stroke="hsl(var(--gold))"
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray={`${(complianceScore / 100) * 263.89} 263.89`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-foreground tabular-nums">{complianceScore}%</span>
                    <span className="text-xs font-medium text-muted-foreground">estimado</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link href="/painel/acesso-informacao" className="rounded-xl bg-emerald-600/10 p-3 no-underline">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase">PNTP</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground tabular-nums">{pntpTotal}</p>
                    <p className="text-xs text-muted-foreground">registros</p>
                  </Link>
                  <Link href="/painel/atricon" className="rounded-xl bg-amber-500/10 p-3 no-underline">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase">ATRICON</span>
                    </div>
                    <p className="mt-2 text-2xl font-bold text-foreground tabular-nums">{atriconTotal}</p>
                    <p className="text-xs text-muted-foreground">pendências</p>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {statCards.length > 0 && (
        <Card className="mb-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <BarChart3 className="h-3.5 w-3.5" />
                Indicadores
              </div>
              <h2 className="mt-3 text-xl font-bold text-foreground">Volume por área do painel</h2>
            </div>
            <p className="text-sm text-muted-foreground">Clique nos cards para ir direto ao módulo.</p>
          </div>
          <div className="space-y-3">
            {statCards.map((card, index) => {
              const value = Number(stats[card.key] || 0)
              const width = Math.max(value > 0 ? 8 : 2, (value / maxStat) * 100)
              return (
                <Link
                  key={card.key}
                  href={card.href}
                  className="grid gap-2 rounded-xl border border-border/70 p-3 no-underline transition-colors hover:border-navy/30 hover:bg-muted/30 md:grid-cols-[210px_1fr_70px] md:items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.accent}`}>
                      <card.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{card.label}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${width}%`, backgroundColor: donutColors[index % donutColors.length] }}
                    />
                  </div>
                  <span className="text-right text-lg font-bold text-foreground tabular-nums">{value}</span>
                </Link>
              )
            })}
          </div>
        </Card>
      )}

      {/* Stats — só dos módulos que o usuário acessa */}
      {contentHealth.length > 0 && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] mb-8">
          <Card>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-navy/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy">
                  <Radar className="h-3.5 w-3.5" />
                  Radar de atualização
                </div>
                <h2 className="mt-3 text-xl font-bold text-foreground">O que precisa de ação agora</h2>
                <p className="text-sm text-muted-foreground">
                  Atas, pautas e votações usam meta quinzenal; os demais módulos seguem a janela definida no Radar.
                </p>
              </div>
              <Link
                href="/painel/atricon"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground no-underline transition-colors hover:bg-muted"
              >
                Abrir Radar <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {needsAttention.length === 0 ? (
              <div className="rounded-xl border border-emerald-600/20 bg-emerald-600/5 p-5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Tudo em dia nos módulos que você gerencia.
              </div>
            ) : (
              <div className="space-y-2">
                {needsAttention.slice(0, 6).map((item) => {
                  const meta = healthMeta[item.status]
                  const Icon = meta.icon
                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      className="grid gap-3 rounded-xl border border-border p-3 no-underline transition-colors hover:border-navy/30 hover:bg-muted/30 md:grid-cols-[1fr_auto] md:items-center"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.iconClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-foreground">{item.label}</p>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${meta.badge}`}>
                              {meta.label}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                        </div>
                      </div>
                      <div className="text-left text-xs text-muted-foreground md:text-right">
                        <p className="font-semibold text-foreground tabular-nums">{item.total} registro(s)</p>
                        <p>Último: {formatHealthDate(item.latest)}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold">
                <ListChecks className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Rotina quinzenal</h2>
                <p className="text-xs text-muted-foreground">Fluxo recomendado para fechar avaliação</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              {[
                'Atualizar atas, pautas e votações mais recentes.',
                'Conferir links externos de e-SIC, Ouvidoria, folha e remuneração.',
                'Preencher registros PNTP por ano/período, preferindo dados estruturados.',
                'Abrir o Radar, revisar pendências e exportar o relatório quinzenal.',
              ].map((step, index) => (
                <div key={step} className="flex gap-3 rounded-xl bg-muted/40 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {statCards.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <StatCard
              key={card.key}
              label={card.label}
              value={stats[card.key]}
              icon={card.icon}
              href={card.href}
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas notícias — só para quem mexe com notícia */}
        {recentNews.length > 0 && (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-foreground text-sm">Últimas notícias</h2>
              <Link
                href="/painel/noticias"
                className="text-xs font-semibold text-navy hover:underline no-underline"
              >
                Ver todas
              </Link>
            </div>
            <div className="divide-y divide-border/70">
              {recentNews.map((news) => (
                <Link
                  key={news.id}
                  href={`/painel/noticias/${news.id}/editar`}
                  className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted/40 transition-colors no-underline"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-foreground truncate">{news.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground/50" />
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(news.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      {news.category && (
                        <span className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                          {news.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={news.status} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Próximas sessões — só para gestor de sessões */}
        {upcomingSessions.length > 0 && (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden self-start">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-foreground text-sm">Próximas sessões</h2>
              <Link
                href="/painel/sessoes"
                className="text-xs font-semibold text-navy hover:underline no-underline"
              >
                Ver todas
              </Link>
            </div>
            <div className="divide-y divide-border/70">
              {upcomingSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/painel/sessoes/${session.id}/editar`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors no-underline"
                >
                  <div className="w-9 h-9 rounded-lg bg-navy/10 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-4 h-4 text-navy" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-foreground truncate">{session.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(session.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Estado vazio: usuário sem nenhum módulo */}
      {statCards.length === 0 && recentNews.length === 0 && upcomingSessions.length === 0 && (
        <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">
            Você ainda não tem módulos atribuídos. Fale com o administrador do portal.
          </p>
        </div>
      )}
    </AdminLayout>
  )
}
