import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { useMemo, useState } from 'react'
import {
  FileDown, Printer, CheckCircle2, AlertTriangle, XCircle, ExternalLink,
  MinusCircle, ChevronDown, ChevronUp, Sparkles, Gem, Save, Filter,
  Clock, Database, ArrowUpRight, ListChecks, TrendingUp, RotateCcw, ShieldAlert,
} from 'lucide-react'
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  EmptyState,
  Field,
  Input,
  PageHeader,
  Select,
  type BadgeTone,
} from '~/components/admin/ui'

type StatusValue = 'atendido' | 'parcial' | 'pendente' | 'externo' | 'nao_se_aplica'
type AutoVerdict = 'ok' | 'parcial' | 'falha'
type Source = 'auto' | 'manual' | 'padrao'
type Classification = 'essencial' | 'obrigatoria' | 'recomendada'
type Freshness = 'em_dia' | 'desatualizado' | 'vazio'

interface Criterion {
  code: string
  dimension: string
  title: string
  classification: Classification
  verification: string[]
  hint: string
  route?: string
  external?: boolean
  status: StatusValue
  source: Source
  autoStatus: StatusValue | null
  divergent: boolean
  evidenceUrl: string | null
  notes: string | null
  lastUpdate: string | null
  auto: { status: AutoVerdict; detail: string; checkedAt: string } | null
  autoLinks: Array<{ title: string; url: string }>
  actionHref: string | null
}

interface DimensionScore {
  key: string
  label: string
  weight: number
  total: number
  met: number
  partial: number
  pending: number
  notApplicable: number
  pct: number
}

interface ContentModule {
  key: string
  label: string
  adminHref: string
  total: number
  latest: string | null
  freshness: Freshness
  detail: string
}

interface Snapshot {
  date: string | null
  index: number
  level: string
}

interface Props {
  matrix: Criterion[]
  scores: {
    dimensions: DimensionScore[]
    index: number
    level: string
    allEssentialsMet: boolean
    essentials: Array<{
      code: string
      title: string
      status: StatusValue
      source: Source
      actionHref: string | null
    }>
    totals: {
      criteria: number
      met: number
      external: number
      partial: number
      pending: number
      notApplicable: number
      autoChecked: number
      manualOverrides: number
      divergent: number
    }
  }
  contentMap: ContentModule[]
  snapshots: Snapshot[]
  fortnight: { label: string; start: string; end: string }
  checkedAt: string
  atriconLogoUrl?: string | null
}

const STATUS_META: Record<StatusValue, { label: string; tone: BadgeTone; dot: string }> = {
  atendido: { label: 'Atendido', tone: 'success', dot: 'bg-emerald-500' },
  parcial: { label: 'Parcial', tone: 'warning', dot: 'bg-amber-500' },
  pendente: { label: 'Pendente', tone: 'danger', dot: 'bg-destructive' },
  externo: { label: 'Sistema externo', tone: 'info', dot: 'bg-sky' },
  nao_se_aplica: { label: 'Não se aplica', tone: 'neutral', dot: 'bg-muted-foreground/40' },
}

const CLASS_TONE: Record<Classification, BadgeTone> = {
  essencial: 'gold',
  obrigatoria: 'navy',
  recomendada: 'neutral',
}

const CLASS_LABEL: Record<Classification, string> = {
  essencial: 'Essencial',
  obrigatoria: 'Obrigatória',
  recomendada: 'Recomendada',
}

const CLASS_ORDER: Record<Classification, number> = { essencial: 0, obrigatoria: 1, recomendada: 2 }

const SOURCE_META: Record<Source, { label: string; tone: BadgeTone }> = {
  auto: { label: 'Automático', tone: 'info' },
  manual: { label: 'Manual', tone: 'navy' },
  padrao: { label: 'Padrão', tone: 'neutral' },
}

const AUTO_META: Record<AutoVerdict, { label: string; tone: BadgeTone; text: string }> = {
  ok: { label: 'Detectado no portal', tone: 'success', text: 'text-emerald-600' },
  parcial: {
    label: 'Dados desatualizados/incompletos',
    tone: 'warning',
    text: 'text-amber-600',
  },
  falha: { label: 'Sem dados no portal', tone: 'danger', text: 'text-destructive' },
}

const FRESHNESS_META: Record<Freshness, { label: string; tone: BadgeTone; rank: number }> = {
  vazio: { label: 'Vazio', tone: 'danger', rank: 0 },
  desatualizado: { label: 'Desatualizado', tone: 'warning', rank: 1 },
  em_dia: { label: 'Em dia', tone: 'success', rank: 2 },
}

const LEVEL_META: Record<string, { color: string; ring: string }> = {
  'Diamante': { color: 'text-cyan-600', ring: '#0891b2' },
  'Ouro': { color: 'text-yellow-600', ring: '#ca8a04' },
  'Prata': { color: 'text-muted-foreground', ring: '#6b7280' },
  'Elevado': { color: 'text-emerald-600', ring: '#059669' },
  'Intermediário': { color: 'text-amber-600', ring: '#d97706' },
  'Básico': { color: 'text-orange-600', ring: '#ea580c' },
  'Inicial': { color: 'text-destructive', ring: '#e11d48' },
}

/* ============================== Helpers de data ============================== */

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

/* ============================== Medalha / Gauge ============================== */

function LevelMedal({
  value,
  level,
  logoUrl,
}: {
  value: number
  level: string
  logoUrl?: string | null
}) {
  const meta = LEVEL_META[level] ?? LEVEL_META['Inicial']

  if (logoUrl) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-40 h-40 rounded-2xl border border-border bg-white p-4 flex items-center justify-center shadow-sm">
          <img src={logoUrl} alt={`Nível ${level}`} className="w-full h-full object-contain" />
        </div>
        <div className="text-center">
          <span className={`block text-sm font-bold uppercase tracking-wide ${meta.color}`}>{level}</span>
          <span className="block text-xs font-semibold text-muted-foreground">{value}%</span>
        </div>
      </div>
    )
  }

  return <Gauge value={value} level={level} />
}

function Gauge({ value, level }: { value: number; level: string }) {
  const meta = LEVEL_META[level] ?? LEVEL_META['Inicial']
  const r = 56
  const circ = 2 * Math.PI * r
  const filled = (Math.min(value, 100) / 100) * circ
  return (
    <div className="relative w-40 h-40">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" className="stroke-muted" strokeWidth="14" />
        <circle
          cx="70" cy="70" r={r} fill="none" stroke={meta.ring} strokeWidth="14"
          strokeLinecap="round" strokeDasharray={`${filled} ${circ - filled}`}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-foreground">{value}%</span>
        <span className={`text-xs font-semibold uppercase tracking-wide ${meta.color}`}>{level}</span>
      </div>
    </div>
  )
}

/* ============================== Gráfico de evolução (SVG puro) ============================== */

function EvolutionChart({ snapshots }: { snapshots: Snapshot[] }) {
  const points = snapshots.filter((s) => s.date !== null)

  if (points.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="Sem histórico ainda"
        description="O histórico será construído a cada dia, registrando o índice estimado."
      />
    )
  }

  // Geometria do gráfico (viewBox responsivo)
  const W = 720
  const H = 240
  const padL = 36
  const padR = 16
  const padT = 16
  const padB = 28
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const n = points.length
  const x = (i: number) => (n === 1 ? padL + innerW / 2 : padL + (i / (n - 1)) * innerW)
  const y = (v: number) => padT + (1 - Math.min(Math.max(v, 0), 100) / 100) * innerH

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p.index).toFixed(1)}`)
    .join(' ')

  const areaPath =
    n === 1
      ? ''
      : `${linePath} L ${x(n - 1).toFixed(1)} ${(padT + innerH).toFixed(1)} L ${x(0).toFixed(1)} ${(padT + innerH).toFixed(1)} Z`

  const showLabels = n <= 12
  const gridLines = [0, 50, 100]

  const last = points[points.length - 1]

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        role="img"
        aria-label="Gráfico de evolução do índice de transparência ao longo do tempo"
      >
        <defs>
          <linearGradient id="atricon-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--navy))" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(var(--navy))" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Linhas de grade + eixo Y */}
        {gridLines.map((g) => (
          <g key={g}>
            <line
              x1={padL}
              x2={W - padR}
              y1={y(g)}
              y2={y(g)}
              className="stroke-border"
              strokeWidth="1"
              strokeDasharray={g === 0 ? '0' : '3 3'}
            />
            <text
              x={padL - 8}
              y={y(g)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground"
              fontSize="11"
            >
              {g}
            </text>
          </g>
        ))}

        {/* Área */}
        {areaPath && <path d={areaPath} fill="url(#atricon-area)" />}

        {/* Linha */}
        <path
          d={linePath}
          fill="none"
          className="stroke-navy"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Markers + rótulos */}
        {points.map((p, i) => (
          <g key={`${p.date}-${i}`}>
            <circle cx={x(i)} cy={y(p.index)} r="4" className="fill-card stroke-navy" strokeWidth="2" />
            {showLabels && (
              <>
                <text
                  x={x(i)}
                  y={y(p.index) - 10}
                  textAnchor="middle"
                  className="fill-foreground font-semibold"
                  fontSize="11"
                >
                  {p.index}
                </text>
                <text
                  x={x(i)}
                  y={padT + innerH + 18}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                  fontSize="10"
                >
                  {p.date
                    ? new Date(p.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                    : ''}
                </text>
              </>
            )}
          </g>
        ))}
      </svg>

      {n === 1 && (
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Apenas um registro até agora — o histórico será
          construído a cada dia.
        </p>
      )}
      {n > 1 && (
        <p className="text-xs text-muted-foreground mt-2">
          {n} registros · atual <strong className="text-foreground">{last.index}%</strong> ({last.level})
        </p>
      )}
    </div>
  )
}

/* ============================== Linha de critério (matriz) ============================== */

const AUTO_OVERRIDE = '__auto__'

function CriterionRow({ criterion }: { criterion: Criterion }) {
  const [open, setOpen] = useState(false)
  // valor do select: status manual real OU sentinela para "voltar ao automático"
  const [statusSel, setStatusSel] = useState<string>(criterion.source === 'auto' ? AUTO_OVERRIDE : criterion.status)
  const [evidence, setEvidence] = useState(criterion.evidenceUrl ?? '')
  const [notes, setNotes] = useState(criterion.notes ?? '')
  const [saving, setSaving] = useState(false)
  const meta = STATUS_META[criterion.status]
  const auto = criterion.auto
  const autoMeta = auto ? AUTO_META[auto.status] : null

  const save = () => {
    setSaving(true)
    const status = statusSel === AUTO_OVERRIDE ? 'auto' : statusSel
    router.put(
      `/painel/atricon/${criterion.code}`,
      { status, evidence_url: evidence, notes },
      { preserveScroll: true, onFinish: () => setSaving(false) }
    )
  }

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
      >
        <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${meta.dot}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">{criterion.code}</span>
            <Badge tone={CLASS_TONE[criterion.classification]} className="text-[11px] px-2 py-0.5">
              {CLASS_LABEL[criterion.classification]}
            </Badge>
            <Badge tone={meta.tone} className="text-[11px] px-2 py-0.5">
              {meta.label}
            </Badge>
            <Badge tone={SOURCE_META[criterion.source].tone} className="text-[11px] px-2 py-0.5">
              {SOURCE_META[criterion.source].label}
            </Badge>
            {autoMeta && (
              <Badge tone={autoMeta.tone} className="text-[11px] px-2 py-0.5">
                <span title={auto!.detail} className="inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {autoMeta.label}
                </span>
              </Badge>
            )}
          </div>
          <p className="text-sm font-medium text-foreground mt-1">{criterion.title}</p>
          {criterion.divergent && criterion.autoStatus && (
            <p className="text-[11px] text-amber-600 mt-1 inline-flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Verificação automática indica:{' '}
              <strong>{STATUS_META[criterion.autoStatus].label}</strong>
            </p>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground mt-1 shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-border/60 space-y-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Como atender: </span>
            {criterion.hint}
          </p>

          <div className="flex flex-wrap gap-1.5">
            {criterion.verification.map((v) => (
              <span key={v} className="text-[11px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{v}</span>
            ))}
          </div>

          {auto && autoMeta && (
            <p className={`text-xs ${autoMeta.text}`}>
              <Sparkles className="w-3 h-3 inline mr-1" />
              Verificação automática: {auto.detail}
            </p>
          )}

          {criterion.divergent && criterion.autoStatus && (
            <p className="text-xs text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 inline-flex items-start gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                Alerta de veracidade: você marcou manualmente este critério como{' '}
                <strong>{STATUS_META[criterion.status].label}</strong>, mas a verificação automática
                indica <strong>{STATUS_META[criterion.autoStatus].label}</strong>.
              </span>
            </p>
          )}

          {criterion.autoLinks.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold">Links da transparência relacionados: </span>
              {criterion.autoLinks.map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noreferrer" className="text-navy hover:underline inline-flex items-center gap-0.5 mr-2">
                  {l.title} <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          )}

          {criterion.route && (
            <p className="text-xs text-muted-foreground">
              Seção do portal: <a href={criterion.route} target="_blank" rel="noreferrer" className="text-navy hover:underline">{criterion.route}</a>
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <Field label="Situação">
              <Select value={statusSel} onChange={(e) => setStatusSel(e.target.value)}>
                {auto && <option value={AUTO_OVERRIDE}>Seguir verificação automática</option>}
                <option value="atendido">Atendido</option>
                <option value="parcial">Parcial</option>
                <option value="pendente">Pendente</option>
                <option value="externo">Sistema externo</option>
                <option value="nao_se_aplica">Não se aplica</option>
              </Select>
            </Field>
            <Field label="Link de evidência (para o avaliador)">
              <Input
                type="url"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="https://..."
              />
            </Field>
            <Field label="Observações">
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex.: aguardando contabilidade"
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {criterion.lastUpdate && (
              <span className="text-[11px] text-muted-foreground">
                Última avaliação: {new Date(criterion.lastUpdate).toLocaleDateString('pt-BR')}
              </span>
            )}
            {criterion.actionHref && (
              <ButtonLink href={criterion.actionHref} variant="secondary" size="sm">
                <ArrowUpRight className="w-3.5 h-3.5" /> Abrir módulo
              </ButtonLink>
            )}
            <Button type="button" size="sm" onClick={save} loading={saving} className="ml-auto">
              {!saving && (statusSel === AUTO_OVERRIDE ? <RotateCcw className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />)}
              {saving ? 'Salvando…' : statusSel === AUTO_OVERRIDE ? 'Voltar para automático' : 'Salvar avaliação'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ============================== Página ============================== */

export default function AtriconIndex({
  matrix,
  scores,
  contentMap,
  snapshots,
  fortnight,
  checkedAt,
  atriconLogoUrl,
}: Props) {
  const [dimensionFilter, setDimensionFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const filtered = useMemo(
    () =>
      matrix.filter(
        (c) =>
          (!dimensionFilter || c.dimension === dimensionFilter) &&
          (!statusFilter || c.status === statusFilter)
      ),
    [matrix, dimensionFilter, statusFilter]
  )

  const grouped = useMemo(() => {
    const map = new Map<string, Criterion[]>()
    for (const c of filtered) {
      if (!map.has(c.dimension)) map.set(c.dimension, [])
      map.get(c.dimension)!.push(c)
    }
    return map
  }, [filtered])

  // Mapa de conteúdo: vazios/desatualizados primeiro
  const sortedContent = useMemo(
    () =>
      [...contentMap].sort(
        (a, b) => FRESHNESS_META[a.freshness].rank - FRESHNESS_META[b.freshness].rank
      ),
    [contentMap]
  )

  // "O que falta": pendentes/parciais priorizados por classificação
  const todo = useMemo(
    () =>
      matrix
        .filter((c) => c.status === 'pendente' || c.status === 'parcial')
        .sort((a, b) => {
          const byClass = CLASS_ORDER[a.classification] - CLASS_ORDER[b.classification]
          if (byClass !== 0) return byClass
          // pendente antes de parcial
          if (a.status !== b.status) return a.status === 'pendente' ? -1 : 1
          return 0
        }),
    [matrix]
  )
  const TODO_LIMIT = 12
  const todoShown = todo.slice(0, TODO_LIMIT)
  const todoRest = todo.length - todoShown.length

  const t = scores.totals
  const summaryCards = [
    { label: 'Atendidos', value: t.met, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-600/10' },
    { label: 'Sistema externo', value: t.external, icon: ExternalLink, color: 'text-sky bg-sky/10' },
    { label: 'Parciais', value: t.partial, icon: AlertTriangle, color: 'text-amber-600 bg-amber-500/10' },
    { label: 'Pendentes', value: t.pending, icon: XCircle, color: 'text-destructive bg-destructive/10' },
    { label: 'Não se aplica', value: t.notApplicable, icon: MinusCircle, color: 'text-muted-foreground bg-muted' },
  ]

  return (
    <AdminLayout title="Radar ATRICON">
      <Head title="Radar ATRICON - Painel" />

      {/* Cabeçalho */}
      <PageHeader
        title="Radar ATRICON — PNTP 2026"
        description={`Matriz do Poder Legislativo Municipal: ${t.criteria} critérios monitorados. ${fortnight.label} (${fortnight.start} – ${fortnight.end}).`}
        actions={
          <>
            <ButtonLink href="/painel/atricon/relatorio">
              <Printer className="w-4 h-4" /> Relatório quinzenal
            </ButtonLink>
            <a
              href="/painel/atricon/relatorio?format=csv"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-card border border-border text-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors no-underline"
            >
              <FileDown className="w-4 h-4" /> Exportar CSV
            </a>
          </>
        }
      />

      {/* Aviso de verificação em tempo real */}
      <p className="-mt-2 mb-5 text-xs text-muted-foreground flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-emerald-600" />
        Verificado em tempo real às <strong className="text-foreground">{fmtTime(checkedAt)}</strong> de hoje —
        os dados do portal são lidos a cada acesso a esta página.
      </p>

      {/* Painel superior: índice + essenciais + resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Índice geral */}
        <Card className="flex items-center gap-6">
          <LevelMedal value={scores.index} level={scores.level} logoUrl={atriconLogoUrl} />
          <div>
            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Gem className="w-4 h-4 text-cyan-600" /> Índice estimado
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Projeção pela metodologia PNTP (pesos por dimensão e classificação).
              Selos Prata, Ouro e Diamante exigem <strong>100% dos essenciais</strong>.
            </p>
            <p className={`text-xs mt-2 font-semibold ${scores.allEssentialsMet ? 'text-emerald-600' : 'text-destructive'}`}>
              {scores.allEssentialsMet ? '✓ Todos os critérios essenciais atendidos' : '✗ Há critérios essenciais não atendidos'}
            </p>
          </div>
        </Card>

        {/* Essenciais */}
        <Card>
          <CardHeader title="Critérios essenciais (LRF)" />
          <div className="space-y-2">
            {scores.essentials.map((e) => (
              <div key={e.code} className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_META[e.status].dot}`} />
                <span className="text-xs font-bold text-muted-foreground w-8 shrink-0">{e.code}</span>
                <span className="text-foreground text-xs truncate flex-1" title={e.title}>{e.title}</span>
                {e.actionHref && (e.status === 'pendente' || e.status === 'parcial') && (
                  <a
                    href={e.actionHref}
                    className="text-[11px] text-navy hover:underline shrink-0 inline-flex items-center gap-0.5"
                  >
                    Resolver <ArrowUpRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Totais */}
        <Card>
          <CardHeader title="Resumo da matriz" />
          <div className="grid grid-cols-2 gap-2">
            {summaryCards.map((c) => (
              <div key={c.label} className={`rounded-lg p-3 ${c.color.split(' ')[1]}`}>
                <div className="flex items-center gap-2">
                  <c.icon className={`w-4 h-4 ${c.color.split(' ')[0]}`} />
                  <span className="text-lg font-bold text-foreground">{c.value}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Procedência / veracidade */}
          <div className="mt-3 pt-3 border-t border-border/60 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-base font-bold text-sky">{t.autoChecked}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Auto-verificados</p>
            </div>
            <div>
              <p className="text-base font-bold text-navy">{t.manualOverrides}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Overrides manuais</p>
            </div>
            <div
              className={`rounded-lg ${t.divergent > 0 ? 'bg-destructive/10 -m-0.5 p-0.5' : ''}`}
              title="Casos em que o gestor marcou manualmente algo que a verificação automática contradiz"
            >
              <p className={`text-base font-bold ${t.divergent > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {t.divergent}
              </p>
              <p className={`text-[10px] leading-tight ${t.divergent > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {t.divergent > 0 && <ShieldAlert className="w-3 h-3 inline mr-0.5" />}
                Divergências
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Barras por dimensão */}
      <Card className="mb-6">
        <CardHeader title="Atendimento por dimensão (ponderado)" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {scores.dimensions.map((d) => (
            <button
              type="button"
              key={d.key}
              onClick={() => setDimensionFilter(dimensionFilter === d.key ? '' : d.key)}
              className={`text-left group ${dimensionFilter === d.key ? 'opacity-100' : dimensionFilter ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-muted-foreground group-hover:text-navy transition-colors">
                  {d.label} <span className="text-muted-foreground/70">(peso {d.weight})</span>
                </span>
                <span className="font-bold text-foreground">{d.pct}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    d.pct >= 95 ? 'bg-sky' : d.pct >= 75 ? 'bg-emerald-500' : d.pct >= 50 ? 'bg-amber-500' : 'bg-destructive'
                  }`}
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {d.met} atendidos · {d.partial} parciais · {d.pending} pendentes · {d.total} critérios
              </p>
            </button>
          ))}
        </div>
      </Card>

      {/* Mapa de Conteúdo + Evolução */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        {/* Mapa de Conteúdo do Portal */}
        <Card>
          <CardHeader
            title="Mapa de Conteúdo do Portal"
            description="Mapeamento em tempo real, módulo a módulo — vazios e desatualizados aparecem primeiro."
            icon={Database}
          />
          <div className="space-y-2">
            {sortedContent.map((m) => {
              const fm = FRESHNESS_META[m.freshness]
              return (
                <div
                  key={m.key}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{m.label}</span>
                      <Badge tone={fm.tone} className="text-[11px] px-2 py-0.5">{fm.label}</Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {m.total} registro{m.total === 1 ? '' : 's'}
                      </span>
                      <span className="text-[11px] text-muted-foreground">· último: {fmtDate(m.latest)}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{m.detail}</p>
                  </div>
                  <a
                    href={m.adminHref}
                    className="text-[11px] text-navy hover:underline shrink-0 inline-flex items-center gap-0.5 mt-0.5"
                  >
                    Gerenciar <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              )
            })}
            {sortedContent.length === 0 && (
              <EmptyState icon={Database} title="Nenhum módulo mapeado." />
            )}
          </div>
        </Card>

        {/* Evolução do índice */}
        <Card>
          <CardHeader
            title="Evolução do índice"
            description="Série diária do índice estimado de transparência (0 a 100)."
            icon={TrendingUp}
          />
          <EvolutionChart snapshots={snapshots} />
        </Card>
      </div>

      {/* O que falta */}
      <Card className="mb-6">
        <CardHeader
          title="O que falta"
          description="Critérios pendentes e parciais priorizados — essenciais primeiro."
          icon={ListChecks}
        />
        {todo.length === 0 ? (
          <p className="text-sm text-emerald-600 font-semibold py-6 text-center">
            Nenhuma pendência. Toda a matriz está atendida. 🎉
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {todoShown.map((c) => {
                const sm = STATUS_META[c.status]
                return (
                  <div
                    key={c.code}
                    className="flex items-start gap-3 rounded-lg border border-border p-3"
                  >
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${sm.dot}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-muted-foreground">{c.code}</span>
                        <Badge tone={CLASS_TONE[c.classification]} className="text-[11px] px-2 py-0.5">
                          {CLASS_LABEL[c.classification]}
                        </Badge>
                        <Badge tone={sm.tone} className="text-[11px] px-2 py-0.5">{sm.label}</Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground mt-1">{c.title}</p>
                      {c.auto && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">{c.auto.detail}</p>
                      )}
                    </div>
                    {c.actionHref && (
                      <ButtonLink href={c.actionHref} variant="secondary" size="sm" className="shrink-0">
                        Resolver <ArrowUpRight className="w-3.5 h-3.5" />
                      </ButtonLink>
                    )}
                  </div>
                )
              })}
            </div>
            {todoRest > 0 && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                + {todoRest} outro{todoRest === 1 ? '' : 's'} critério{todoRest === 1 ? '' : 's'} pendente
                {todoRest === 1 ? '' : 's'}/parcia{todoRest === 1 ? 'l' : 'is'} — veja na matriz abaixo ou no
                relatório quinzenal.
              </p>
            )}
          </>
        )}
      </Card>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="w-full sm:w-56">
          <Select value={dimensionFilter} onChange={(e) => setDimensionFilter(e.target.value)}>
            <option value="">Todas as dimensões</option>
            {scores.dimensions.map((d) => (
              <option key={d.key} value={d.key}>{d.label}</option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-56">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todas as situações</option>
            <option value="pendente">Pendentes</option>
            <option value="parcial">Parciais</option>
            <option value="atendido">Atendidos</option>
            <option value="externo">Sistema externo</option>
            <option value="nao_se_aplica">Não se aplica</option>
          </Select>
        </div>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} critérios exibidos</span>
      </div>

      {/* Lista por dimensão */}
      <div className="space-y-6">
        {scores.dimensions
          .filter((d) => grouped.has(d.key))
          .map((d) => (
            <div key={d.key}>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                {d.label}
                <span className="text-[11px] font-medium text-muted-foreground normal-case">
                  {grouped.get(d.key)!.length} critérios
                </span>
              </h3>
              <div className="space-y-2">
                {grouped.get(d.key)!.map((c) => (
                  <CriterionRow key={c.code} criterion={c} />
                ))}
              </div>
            </div>
          ))}
        {filtered.length === 0 && (
          <EmptyState icon={Filter} title="Nenhum critério com os filtros selecionados." />
        )}
      </div>

      {/* Nota e-SIC/Ouvidoria */}
      <div className="mt-6 bg-sky/10 border border-sky/20 rounded-xl p-4 text-xs text-sky flex items-start gap-2">
        <ExternalLink className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          Os critérios de <strong>e-SIC e Ouvidoria</strong> são atendidos pelo sistema externo contratado
          e entram no radar como “Sistema externo” (contam como atendidos no índice). Mantenha os links de
          acesso visíveis no portal — isso é o que o avaliador confere.
        </p>
      </div>
    </AdminLayout>
  )
}
