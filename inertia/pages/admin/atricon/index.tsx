import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { useMemo, useState } from 'react'
import {
  FileDown, Printer, CheckCircle2, XCircle, ExternalLink,
  ChevronDown, ChevronUp, Sparkles, Gem, Save, Filter,
  Clock, Database, ArrowUpRight, ArrowDownRight, ListChecks, TrendingUp, RotateCcw,
  ShieldAlert, PieChart, Radar as RadarIcon, Link2, AlertTriangle, Bot, FileJson,
  ClipboardCheck, RefreshCw, type LucideIcon,
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

type StatusValue = 'atendido' | 'parcial' | 'pendente' | 'externo' | 'nao_se_aplica' | 'nao_ocorre'
type AutoVerdict = 'ok' | 'parcial' | 'falha'
type SubdimStatus = AutoVerdict | 'manual'
interface SubdimensionView {
  key: 'D' | 'A' | 'H' | 'G' | 'F'
  label: string
  status: SubdimStatus
}
type Source = 'auto' | 'manual' | 'padrao'
type CriterionPlace =
  | 'sistema_externo'
  | 'pagina_acesso_informacao'
  | 'transparencia_ou_link_externo'
  | 'modulo_nativo'
  | 'pagina_publica'
  | 'avaliacao_manual'
interface CriterionGap {
  /** O que a ATRICON exige (texto da matriz). */
  exigencia: string
  /** O que foi detectado / por que está pendente. */
  motivo: string
  /** Ação concreta derivada do local de resolução. */
  acao: string
  /** Orientação de como atender (hint da matriz). */
  comoResolver: string
  /** Deep-link do módulo/atalho que resolve, com rótulo. */
  moduloLink: { href: string; label: string } | null
  place: CriterionPlace
}
type Classification = 'essencial' | 'obrigatoria' | 'recomendada'
type Freshness = 'em_dia' | 'desatualizado' | 'vazio'
type TabKey = 'visao' | 'falta' | 'matriz' | 'auditoria' | 'ia'

interface Criterion {
  code: string
  dimension: string
  title: string
  classification: Classification
  verification: string[]
  subdimensions?: SubdimensionView[]
  hint: string
  legalObligation?: boolean
  route?: string
  external?: boolean
  status: StatusValue
  source: Source
  autoCheck?: string
  keywords?: string[]
  autoStatus: StatusValue | null
  divergent: boolean
  evidenceUrl: string | null
  notes: string | null
  lastUpdate: string | null
  auto: { status: AutoVerdict; detail: string; checkedAt: string } | null
  autoLinks: Array<{ title: string; url: string }>
  actionHref: string | null
  /** Crédito (0..1) do critério no índice; null = excluído (não se aplica). */
  credit: number | null
  /** Ganho real em pontos do índice ao concluir o critério. */
  indexGain: number
  /** Explicação "o que falta": exigência, motivo, como resolver e link do módulo. */
  gap: CriterionGap
}

interface DimensionScore {
  key: string
  label: string
  weight: number
  totalWeight?: number
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

type LinkHealth = 'ok' | 'parcial' | 'falha' | 'externo_ok' | 'externo_falha' | 'invalido'

interface LinkAuditItem {
  id: number
  title: string
  url: string
  sectionTitle: string
  isExternal: boolean
  openMode: string
  health: LinkHealth
  detail: string
  matchedModule: string | null
  contentTotal: number | null
  contentLatest: string | null
  httpStatus: number | null
  adminHref: string | null
}

interface LinkAuditReport {
  links: LinkAuditItem[]
  summary: { total: number; ok: number; parcial: number; falha: number; externo: number }
  contentGaps: LinkAuditItem[]
  checkedAt: string
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
  linkAudit: LinkAuditReport
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
  nao_ocorre: { label: 'Não ocorre (declarado)', tone: 'neutral', dot: 'bg-muted-foreground/60' },
}

/** Cor do indicador de cada subdimensão (D/A/H/G/F). */
const SUBDIM_META: Record<SubdimStatus, { tone: string; title: string }> = {
  ok: { tone: 'bg-emerald-500 text-white', title: 'Atende (verificação automática)' },
  parcial: { tone: 'bg-amber-500 text-navy-dark', title: 'Parcial — revisar' },
  falha: { tone: 'bg-destructive text-destructive-foreground', title: 'Não atende' },
  manual: { tone: 'bg-muted text-muted-foreground', title: 'Conferência manual (não auto-detectável)' },
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

const LINK_HEALTH_META: Record<
  LinkHealth,
  { label: string; tone: BadgeTone; rank: number }
> = {
  invalido: { label: 'URL inválida', tone: 'danger', rank: 0 },
  falha: { label: 'Sem conteúdo', tone: 'danger', rank: 1 },
  externo_falha: { label: 'Link externo quebrado', tone: 'danger', rank: 2 },
  parcial: { label: 'Desatualizado', tone: 'warning', rank: 3 },
  ok: { label: 'OK', tone: 'success', rank: 4 },
  externo_ok: { label: 'Externo OK', tone: 'success', rank: 4 },
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
      <svg
        viewBox="0 0 140 140"
        className="w-full h-full -rotate-90"
        role="img"
        aria-label={`Índice estimado de transparência: ${value}% — selo ${level}`}
      >
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

/* ============================== Donut de distribuição (SVG puro) ============================== */

interface DonutSeg {
  label: string
  value: number
  color: string
}

function DonutChart({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: DonutSeg[]
  centerValue: string | number
  centerLabel: string
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  const size = 168
  const stroke = 24
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" className="stroke-muted" strokeWidth={stroke} />
          {total > 0 &&
            segments.map((seg) => {
              if (seg.value === 0) return null
              const len = (seg.value / total) * circ
              const el = (
                <circle
                  key={seg.label}
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${len} ${circ - len}`}
                  strokeDashoffset={-offset}
                  className="transition-all duration-700"
                />
              )
              offset += len
              return el
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-foreground">{centerValue}</span>
          <span className="text-[11px] text-muted-foreground">{centerLabel}</span>
        </div>
      </div>
      <ul className="space-y-1.5 w-full min-w-0">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: seg.color }} />
            <span className="text-muted-foreground flex-1 truncate">{seg.label}</span>
            <span className="font-bold text-foreground tabular-nums">{seg.value}</span>
            <span className="text-[11px] text-muted-foreground w-9 text-right tabular-nums">
              {total > 0 ? Math.round((seg.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ============================== Radar por dimensão (SVG puro) ============================== */

const DIM_ABBR: Record<string, string> = {
  prioritarias: 'Prioritárias',
  institucionais: 'Institucionais',
  receita: 'Receita',
  despesa: 'Despesa',
  convenios: 'Convênios',
  rh: 'RH',
  diarias: 'Diárias',
  licitacoes: 'Licitações',
  contratos: 'Contratos',
  obras: 'Obras',
  planejamento: 'Planejamento',
  sic: 'SIC',
  acessibilidade: 'Acessib.',
  ouvidoria: 'Ouvidoria',
  lgpd: 'LGPD',
  legislativo: 'Legislativo',
}

function RadarChart({
  axes,
}: {
  axes: Array<{ key: string; label: string; pct: number }>
}) {
  const size = 320
  const cx = size / 2
  const cy = size / 2
  const R = size / 2 - 54
  const n = axes.length
  if (n < 3) return null

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2
  const point = (i: number, radius: number): [number, number] => [
    cx + radius * Math.cos(angle(i)),
    cy + radius * Math.sin(angle(i)),
  ]

  const rings = [0.25, 0.5, 0.75, 1]
  const dataPts = axes.map((a, i) => point(i, (R * Math.min(Math.max(a.pct, 0), 100)) / 100))
  const dataPath =
    dataPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') + ' Z'

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-auto"
      role="img"
      aria-label="Radar de cobertura por dimensão da matriz PNTP"
    >
      {rings.map((rr) => (
        <polygon
          key={rr}
          points={axes.map((_, i) => point(i, R * rr).join(',')).join(' ')}
          className="fill-none stroke-border"
          strokeWidth="1"
        />
      ))}
      {axes.map((a, i) => {
        const [ex, ey] = point(i, R)
        const [lx, ly] = point(i, R + 14)
        const anchor = Math.abs(lx - cx) < 8 ? 'middle' : lx > cx ? 'start' : 'end'
        return (
          <g key={a.key}>
            <line x1={cx} y1={cy} x2={ex} y2={ey} className="stroke-border" strokeWidth="1" />
            <text
              x={lx}
              y={ly}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="fill-muted-foreground"
              fontSize="8.5"
            >
              {DIM_ABBR[a.key] ?? a.label}
            </text>
          </g>
        )
      })}
      <path
        d={dataPath}
        fill="hsl(var(--navy) / 0.18)"
        stroke="hsl(var(--navy))"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {dataPts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill="hsl(var(--navy))" />
      ))}
    </svg>
  )
}

/* ============================== KPI ============================== */

function KpiCard({
  icon: Icon,
  value,
  label,
  sub,
  accent,
  delta,
}: {
  icon: LucideIcon
  value: string | number
  label: string
  sub?: string
  accent: string
  delta?: number | null
}) {
  return (
    <div className="h-full flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${accent}`}>
          <Icon className="w-5 h-5" />
        </span>
        {delta !== undefined && delta !== null && delta !== 0 && (
          <span
            className={`text-[11px] font-bold inline-flex items-center gap-0.5 tabular-nums ${
              delta > 0 ? 'text-emerald-600' : 'text-destructive'
            }`}
          >
            {delta > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(delta).toFixed(1)}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-extrabold leading-none text-foreground tabular-nums">{value}</p>
      <p className="mt-1.5 text-xs font-medium text-foreground/80">{label}</p>
      {sub && <p className="mt-auto pt-1.5 text-[11px] text-muted-foreground">{sub}</p>}
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
        <span
          className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${meta.dot}`}
          role="img"
          aria-label={`Situação: ${meta.label}`}
        />
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

          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Itens de verificação (PNTP 2026)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(criterion.subdimensions?.length
                ? criterion.subdimensions
                : criterion.verification.map((v) => ({
                    key: 'D' as const,
                    label: v,
                    status: 'manual' as SubdimStatus,
                  }))
              ).map((s, i) => {
                const meta = SUBDIM_META[s.status]
                return (
                  <span
                    key={i}
                    title={meta.title}
                    role="img"
                    aria-label={`${s.label}: ${meta.title}`}
                    className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${meta.tone}`}
                  >
                    {s.label}
                  </span>
                )
              })}
            </div>
            {criterion.subdimensions?.length ? (
              <p className="text-[10px] text-muted-foreground">
                Disponibilidade/Atualidade/Série histórica verificados automaticamente; Gravação de
                relatórios e Filtro de pesquisa exigem conferência manual.
              </p>
            ) : null}
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
                {!criterion.legalObligation && (
                  <option value="nao_ocorre">Não ocorre (declarado)</option>
                )}
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

/* ============================== Item de "O que falta" (expansível) ============================== */

function GapItem({ criterion }: { criterion: Criterion }) {
  const [open, setOpen] = useState(false)
  const sm = STATUS_META[criterion.status]
  const gap = criterion.gap
  // Itens de verificação (D/A/H/G/F) ainda não atendidos (falha/parcial) ou para conferência (manual).
  const missingSubs = (criterion.subdimensions ?? []).filter((s) => s.status !== 'ok')

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-start gap-3 p-3 text-left hover:bg-muted/40 transition-colors"
      >
        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${sm.dot}`} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-muted-foreground">{criterion.code}</span>
            <Badge tone={CLASS_TONE[criterion.classification]} className="text-[11px] px-2 py-0.5">
              {CLASS_LABEL[criterion.classification]}
            </Badge>
            <Badge tone={sm.tone} className="text-[11px] px-2 py-0.5">{sm.label}</Badge>
            {criterion.indexGain > 0 && (
              <span
                className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 tabular-nums"
                title="Ganho estimado no índice ao concluir este critério"
              >
                <TrendingUp className="w-3 h-3" aria-hidden="true" />+{criterion.indexGain.toFixed(2)} pts
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-foreground mt-1">{gap.exigencia}</p>
          {!open && (
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{gap.motivo}</p>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground mt-1 shrink-0" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground mt-1 shrink-0" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-border/60 space-y-3">
          {/* Exigência */}
          <div className="flex items-start gap-2">
            <ClipboardCheck className="w-4 h-4 text-navy shrink-0 mt-0.5" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                O que a ATRICON exige
              </p>
              <p className="text-sm text-foreground">{gap.exigencia}</p>
            </div>
          </div>

          {/* Motivo / o que foi detectado */}
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Por que está pendente
              </p>
              <p className="text-sm text-foreground">{gap.motivo}</p>
              {missingSubs.length > 0 && (
                <div className="mt-1.5">
                  <p className="text-[11px] text-muted-foreground mb-1">
                    Itens de verificação (PNTP 2026) a resolver:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {missingSubs.map((s, i) => {
                      const m = SUBDIM_META[s.status]
                      return (
                        <span
                          key={i}
                          title={m.title}
                          aria-label={`${s.label}: ${m.title}`}
                          className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${m.tone}`}
                        >
                          {s.label}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Como resolver */}
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Como resolver
              </p>
              <p className="text-sm text-foreground">{gap.acao}</p>
              <p className="text-sm text-muted-foreground mt-1">{gap.comoResolver}</p>
            </div>
          </div>

          {/* Links da transparência já relacionados */}
          {criterion.autoLinks.length > 0 && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Link2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0">
                <span className="font-semibold">Links já relacionados: </span>
                {criterion.autoLinks.map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-navy hover:underline inline-flex items-center gap-0.5 mr-2"
                  >
                    {l.title} <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {gap.moduloLink && (
              <ButtonLink href={gap.moduloLink.href} variant="secondary" size="sm">
                <ArrowUpRight className="w-3.5 h-3.5" /> {gap.moduloLink.label}
              </ButtonLink>
            )}
            {criterion.route && (
              <a
                href={criterion.route}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-navy hover:underline inline-flex items-center gap-0.5"
              >
                Ver no portal <ExternalLink className="w-3 h-3" />
              </a>
            )}
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
  linkAudit,
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
  const sortedLinkGaps = useMemo(
    () =>
      [...linkAudit.contentGaps].sort(
        (a, b) => LINK_HEALTH_META[a.health].rank - LINK_HEALTH_META[b.health].rank
      ),
    [linkAudit.contentGaps]
  )

  const sortedContent = useMemo(
    () =>
      [...contentMap].sort(
        (a, b) => FRESHNESS_META[a.freshness].rank - FRESHNESS_META[b.freshness].rank
      ),
    [contentMap]
  )

  // "O que falta": pendentes/parciais priorizados pelo GANHO real em pontos do índice
  const todo = useMemo(
    () =>
      matrix
        .filter((c) => c.status === 'pendente' || c.status === 'parcial')
        .sort((a, b) => {
          // 1) maior impacto no índice primeiro
          if (b.indexGain !== a.indexGain) return b.indexGain - a.indexGain
          // 2) classificação (essencial → obrigatória → recomendada)
          const byClass = CLASS_ORDER[a.classification] - CLASS_ORDER[b.classification]
          if (byClass !== 0) return byClass
          // 3) pendente antes de parcial
          if (a.status !== b.status) return a.status === 'pendente' ? -1 : 1
          return 0
        }),
    [matrix]
  )
  const TODO_LIMIT = 12
  const todoShown = todo.slice(0, TODO_LIMIT)
  const todoRest = todo.length - todoShown.length

  const t = scores.totals

  // Distribuição de status para o donut
  const statusSegments: DonutSeg[] = [
    { label: 'Atendidos', value: t.met, color: '#10b981' },
    { label: 'Sistema externo', value: t.external, color: '#0ea5e9' },
    { label: 'Parciais', value: t.partial, color: '#f59e0b' },
    { label: 'Pendentes', value: t.pending, color: '#ef4444' },
    { label: 'Não se aplica', value: t.notApplicable, color: '#9ca3af' },
  ]

  // Variação do índice vs. registro anterior (para a seta de tendência no KPI)
  const validSnaps = snapshots.filter((s) => s.date !== null)
  const indexDelta =
    validSnaps.length >= 2
      ? Math.round((validSnaps[validSnaps.length - 1].index - validSnaps[validSnaps.length - 2].index) * 10) / 10
      : null

  const essTotal = scores.essentials.length
  const essMet = scores.essentials.filter(
    (e) => e.status === 'atendido' || e.status === 'externo' || e.status === 'nao_ocorre'
  ).length

  // Barras: piores dimensões primeiro (evidencia as lacunas)
  const dimsByGap = [...scores.dimensions].sort((a, b) => a.pct - b.pct)

  const aiFlow = useMemo(() => {
    const ownInfoPages = matrix.filter((c) => c.autoCheck?.startsWith('info:'))
    const externalSystems = matrix.filter((c) => c.external || c.status === 'externo')
    const transparencyOrLinks = matrix.filter(
      (c) => c.route?.startsWith('/transparencia') || (!c.autoCheck && (c.keywords?.length ?? 0) > 0)
    )
    const nativeModules = matrix.filter(
      (c) =>
        c.actionHref?.startsWith('/painel/') &&
        !ownInfoPages.includes(c) &&
        !transparencyOrLinks.includes(c) &&
        !externalSystems.includes(c)
    )
    const staleContent = contentMap.filter((m) => m.freshness !== 'em_dia')
    const needsReview = matrix.filter(
      (c) => c.status === 'pendente' || c.status === 'parcial' || c.divergent
    )
    return {
      ownInfoPages,
      externalSystems,
      transparencyOrLinks,
      nativeModules,
      staleContent,
      needsReview,
    }
  }, [matrix, contentMap])

  const feedingModules = useMemo(() => {
    const byKey = new Map(contentMap.map((module) => [module.key, module]))
    const items = [
      {
        key: 'atividades',
        title: 'Matérias legislativas',
        description: 'Projetos, requerimentos, indicações, moções e autoria.',
        href: '/painel/atividades',
      },
      {
        key: 'publicacoes',
        title: 'Publicações oficiais',
        description: 'Portarias, decretos, resoluções e atos institucionais próprios.',
        href: '/painel/publicacoes',
      },
      {
        key: 'atas',
        title: 'Atas',
        description: 'Atas publicadas por data e sessão, com PDF quando houver.',
        href: '/painel/atas',
      },
      {
        key: 'pautas',
        title: 'Pautas',
        description: 'Pautas publicadas por data e sessão, separadas das atas.',
        href: '/painel/pautas',
      },
      {
        key: 'votacoes',
        title: 'Votações nominais',
        description: 'Votos por matéria e vereador, quando houver relatório nominal.',
        href: '/painel/votacoes',
      },
      {
        key: 'acesso-informacao',
        title: 'PNTP / LAI',
        description: 'Registros por categoria e exercício no Acesso à Informação.',
        href: '/painel/acesso-informacao',
      },
    ]

    return items.map((item) => ({ ...item, module: byKey.get(item.key) ?? null }))
  }, [contentMap])

  const [tab, setTab] = useState<TabKey>('visao')

  // Alerta proativo de frescor: atas/pautas/votações que venceram a meta quinzenal.
  const overdueBiweekly = useMemo(
    () =>
      contentMap.filter(
        (m) => ['atas', 'pautas', 'votacoes'].includes(m.key) && m.freshness !== 'em_dia'
      ),
    [contentMap]
  )

  // Divergências auto×manual para destacar no topo.
  const divergentList = useMemo(
    () => matrix.filter((c) => c.divergent && c.autoStatus),
    [matrix]
  )

  // Ao filtrar uma dimensão pela barra, leva o usuário para a aba da matriz.
  const goToDimension = (key: string) => {
    setDimensionFilter(dimensionFilter === key ? '' : key)
    setTab('matriz')
  }

  const revertToAuto = (code: string) => {
    router.put(`/painel/atricon/${code}`, { status: 'auto' }, { preserveScroll: true })
  }

  const TABS: Array<{ key: TabKey; label: string; icon: LucideIcon; badge?: number }> = [
    { key: 'visao', label: 'Visão geral', icon: PieChart },
    { key: 'falta', label: 'O que falta', icon: ListChecks, badge: todo.length },
    { key: 'matriz', label: 'Matriz', icon: Filter },
    { key: 'auditoria', label: 'Auditoria de links', icon: Link2, badge: linkAudit.contentGaps.length },
    { key: 'ia', label: 'Evidências / IA', icon: Bot },
  ]

  return (
    <AdminLayout title="Radar ATRICON">
      <Head title="Radar ATRICON - Painel" />

      {/* Cabeçalho */}
      <PageHeader
        title="Radar ATRICON — PNTP 2026"
        description={`Matriz do Poder Legislativo Municipal: ${t.criteria} critérios monitorados. ${fortnight.label} (${fortnight.start} – ${fortnight.end}).`}
        icon={RadarIcon}
        eyebrow="PNTP 2026"
        variant="hero"
        actions={
          <>
            <ButtonLink href="/painel/atricon/relatorio" variant="gold">
              <Printer className="w-4 h-4" /> Relatório quinzenal
            </ButtonLink>
            <a
              href="/painel/atricon/relatorio?format=csv"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors no-underline"
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
        conteúdo e checks lidos a cada acesso; a auditoria HTTP de links externos é cacheada por até 30 min.
      </p>

      {/* Alerta proativo de frescor — atas/pautas/votações vencidas */}
      {overdueBiweekly.length > 0 && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {overdueBiweekly.length} módulo{overdueBiweekly.length === 1 ? '' : 's'} venceu a meta
                quinzenal de atualização
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Atas, pautas e votações devem ser publicadas em até 15 dias após cada sessão. Atualize
                para não perder pontos de atualidade (A).
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {overdueBiweekly.map((m) => (
                  <a
                    key={m.key}
                    href={m.adminHref}
                    className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-card px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-amber-500/10 no-underline"
                  >
                    {m.label}
                    <span className="text-muted-foreground">· {FRESHNESS_META[m.freshness].label}</span>
                    <ArrowUpRight className="w-3 h-3" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Divergências auto×manual destacadas no topo */}
      {divergentList.length > 0 && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4"
        >
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {divergentList.length} critério{divergentList.length === 1 ? '' : 's'} com divergência
                entre verificação automática e override manual
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Revise: o status manual contradiz o que o portal indica. Reverter ao automático mantém o
                índice fiel à realidade publicada.
              </p>
              <div className="mt-2 space-y-1.5">
                {divergentList.slice(0, 6).map((c) => (
                  <div key={c.code} className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-muted-foreground w-10 shrink-0">{c.code}</span>
                    <span className="text-foreground truncate max-w-[22rem]" title={c.title}>
                      {c.title}
                    </span>
                    <span className="text-muted-foreground">
                      manual <strong className="text-foreground">{STATUS_META[c.status].label}</strong> ×
                      auto <strong className="text-foreground">{STATUS_META[c.autoStatus!].label}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => revertToAuto(c.code)}
                      className="inline-flex items-center gap-1 text-navy hover:underline"
                    >
                      <RotateCcw className="w-3 h-3" aria-hidden="true" /> Reverter ao automático
                    </button>
                  </div>
                ))}
                {divergentList.length > 6 && (
                  <p className="text-[11px] text-muted-foreground">
                    + {divergentList.length - 6} outra(s) divergência(s) na matriz.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
        <KpiCard
          icon={Gem}
          value={`${scores.index}%`}
          label="Índice estimado"
          sub={`Selo ${scores.level}`}
          accent="bg-cyan-600/10 text-cyan-600"
          delta={indexDelta}
        />
        <KpiCard
          icon={CheckCircle2}
          value={`${t.met + t.external}/${t.criteria}`}
          label="Critérios cobertos"
          sub={`${t.met} nativos · ${t.external} externos`}
          accent="bg-emerald-600/10 text-emerald-600"
        />
        <KpiCard
          icon={ListChecks}
          value={`${essMet}/${essTotal}`}
          label="Essenciais (LRF)"
          sub={scores.allEssentialsMet ? 'Todos atendidos' : 'Há essenciais em aberto'}
          accent={scores.allEssentialsMet ? 'bg-emerald-600/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}
        />
        <KpiCard
          icon={XCircle}
          value={t.pending}
          label="Pendentes"
          sub={`${t.partial} parciais`}
          accent="bg-destructive/10 text-destructive"
        />
        <KpiCard
          icon={Sparkles}
          value={t.autoChecked}
          label="Auto-verificados"
          sub={t.divergent > 0 ? `${t.divergent} divergência(s)` : `${t.manualOverrides} overrides`}
          accent="bg-sky/10 text-sky"
        />
      </div>

      {/* Navegação por seções — quebra o scroll único da página */}
      <div className="sticky top-0 z-10 -mx-1 mb-5 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div
          role="tablist"
          aria-label="Seções do Radar ATRICON"
          className="flex gap-1 py-2 overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map((tb) => {
            const active = tab === tb.key
            return (
              <button
                key={tb.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(tb.key)}
                className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <tb.icon className="w-4 h-4" aria-hidden="true" />
                {tb.label}
                {tb.badge !== undefined && tb.badge > 0 && (
                  <span
                    className={`ml-0.5 inline-flex items-center justify-center rounded-full px-1.5 text-[11px] font-bold tabular-nums ${
                      active ? 'bg-white/20 text-white' : 'bg-muted-foreground/15 text-foreground'
                    }`}
                  >
                    {tb.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ===================== Aba: Evidências / IA ===================== */}
      <div role="tabpanel" hidden={tab !== 'ia'}>
      <Card className="border-navy/15">
        <CardHeader
          title="Rotina de verificação periódica com IA"
          description="Use este fluxo para revisar o portal antes e durante o ciclo PNTP: ler evidências, separar links externos, preencher módulos internos e revalidar o Radar."
          icon={Bot}
        />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          <div className="h-full flex flex-col justify-center rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-2xl font-bold text-foreground tabular-nums">{aiFlow.needsReview.length}</p>
            <p className="text-xs text-muted-foreground">Critérios para revisar</p>
          </div>
          <div className="h-full flex flex-col justify-center rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-2xl font-bold text-foreground tabular-nums">{aiFlow.staleContent.length}</p>
            <p className="text-xs text-muted-foreground">Módulos vazios/desatualizados</p>
          </div>
          <div className="h-full flex flex-col justify-center rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-2xl font-bold text-foreground tabular-nums">{linkAudit.contentGaps.length}</p>
            <p className="text-xs text-muted-foreground">Links com atenção</p>
          </div>
          <div className="h-full flex flex-col justify-center rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-2xl font-bold text-foreground tabular-nums">{aiFlow.ownInfoPages.length}</p>
            <p className="text-xs text-muted-foreground">Páginas próprias PNTP</p>
          </div>
          <div className="h-full flex flex-col justify-center rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-2xl font-bold text-foreground tabular-nums">{aiFlow.externalSystems.length}</p>
            <p className="text-xs text-muted-foreground">Sistemas externos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {[
            {
              icon: FileJson,
              title: '1. Ler evidências',
              text: 'A IA usa o JSON do Radar com matriz, links, módulos, pendências, evidências e instruções de leitura.',
            },
            {
              icon: Link2,
              title: '2. Conferir externos',
              text: 'e-SIC, Ouvidoria, folha e remuneração podem ser externos, mas precisam de link visível e válido.',
            },
            {
              icon: ClipboardCheck,
              title: '3. Preencher módulos',
              text: 'O que for interno vai para o módulo correto: Acesso à Informação, Transparência, RGF, Duodécimos, Contratos etc.',
            },
            {
              icon: RefreshCw,
              title: '4. Revalidar',
              text: 'Após corrigir, reabra o Radar para recalcular os checks automáticos e gerar o snapshot do dia.',
            },
          ].map((step) => (
            <div key={step.title} className="rounded-xl border border-border bg-card p-4">
              <step.icon className="w-5 h-5 text-navy mb-3" />
              <p className="text-sm font-semibold text-foreground">{step.title}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-border bg-muted/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Alimentação segmentada</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Escolha o acervo exato para atualizar, sem misturar matérias, atos, atas, pautas e PNTP/LAI.
                O Diário Oficial fica fora desta fila por ser alimentado no portal próprio.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
            {feedingModules.map((item) => {
              const freshness = item.module?.freshness ?? 'vazio'
              const meta = FRESHNESS_META[freshness]
              return (
                <a
                  key={item.key}
                  href={item.href}
                  className="group rounded-lg border border-border bg-card p-3 no-underline transition-colors hover:border-navy/40 hover:bg-navy/5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-navy">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <Badge tone={meta.tone} className="text-[10px] px-2 py-0.5 shrink-0">
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="tabular-nums">{item.module?.total ?? 0} registro(s)</span>
                    <span>último: {fmtDate(item.module?.latest ?? null)}</span>
                    <span className="inline-flex items-center gap-0.5 text-navy">
                      Abrir <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              )
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="/painel/atricon/evidencias.json"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-navy text-white rounded-lg text-sm font-medium hover:bg-navy-dark transition-colors no-underline"
          >
            <FileJson className="w-4 h-4" /> Abrir pacote IA
          </a>
          <ButtonLink href="/painel/transparencia" variant="secondary">
            <Link2 className="w-4 h-4" /> Links da Transparência
          </ButtonLink>
          <ButtonLink href="/painel/acesso-informacao" variant="secondary">
            <Database className="w-4 h-4" /> Acesso à Informação
          </ButtonLink>
        </div>
      </Card>
      </div>

      {/* ===================== Aba: Visão geral ===================== */}
      <div role="tabpanel" hidden={tab !== 'visao'}>
      <div className="space-y-6">
      {/* Painel de gráficos: índice + distribuição + radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Índice / selo */}
        <Card className="h-full flex flex-col items-center text-center justify-center gap-3">
          <LevelMedal value={scores.index} level={scores.level} logoUrl={atriconLogoUrl} />
          <div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              Projeção pela metodologia PNTP (pesos por dimensão e classificação). Selos Prata,
              Ouro e Diamante exigem <strong>100% dos essenciais</strong>.
            </p>
            <p className={`text-xs mt-2 font-semibold ${scores.allEssentialsMet ? 'text-emerald-600' : 'text-destructive'}`}>
              {scores.allEssentialsMet ? '✓ Todos os essenciais atendidos' : '✗ Há essenciais não atendidos'}
            </p>
          </div>
        </Card>

        {/* Donut de distribuição */}
        <Card className="h-full flex flex-col">
          <CardHeader title="Distribuição dos critérios" icon={PieChart} />
          <div className="flex flex-1 flex-col justify-center">
            <DonutChart segments={statusSegments} centerValue={t.criteria} centerLabel="critérios" />
          </div>
        </Card>

        {/* Radar por dimensão */}
        <Card className="h-full flex flex-col">
          <CardHeader
            title="Cobertura por dimensão"
            description="Quanto mais cheio o polígono, melhor a cobertura."
            icon={RadarIcon}
          />
          <div className="flex flex-1 flex-col justify-center">
            <RadarChart axes={scores.dimensions} />
          </div>
        </Card>
      </div>

      {/* Essenciais (LRF) */}
      <Card>
        <CardHeader title="Critérios essenciais (LRF)" description="Obrigatórios para os selos Prata, Ouro e Diamante." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
          {scores.essentials.map((e) => (
            <div key={e.code} className="flex items-center gap-2 text-sm py-0.5">
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

      {/* Barras por dimensão (lacunas primeiro) */}
      <Card>
        <CardHeader
          title="Atendimento por dimensão (ponderado)"
          description="Ordenado pelas maiores lacunas. Clique para filtrar a matriz por dimensão."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {dimsByGap.map((d) => (
            <button
              type="button"
              key={d.key}
              onClick={() => goToDimension(d.key)}
              className={`text-left group ${dimensionFilter === d.key ? 'opacity-100' : dimensionFilter ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-muted-foreground group-hover:text-navy transition-colors">
                  {d.label} <span className="text-muted-foreground/70">(peso {d.weight})</span>
                </span>
                <span className="font-bold text-foreground tabular-nums">{d.pct}%</span>
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Mapa de Conteúdo do Portal */}
        <Card className="h-full">
          <CardHeader
            title="Mapa de Conteúdo do Portal"
            description="Mapeamento em tempo real, módulo a módulo — vazios e desatualizados aparecem primeiro."
            icon={Database}
          />
          <div className="space-y-2">
            {sortedContent.map((m) => {
              const fm = FRESHNESS_META[m.freshness]
              const accent =
                m.freshness === 'vazio'
                  ? 'border-l-destructive'
                  : m.freshness === 'desatualizado'
                    ? 'border-l-amber-500'
                    : 'border-l-emerald-500'
              return (
                <div
                  key={m.key}
                  className={`flex items-start gap-3 rounded-lg border border-border border-l-4 ${accent} p-3 hover:bg-muted/30 transition-colors`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{m.label}</span>
                      <Badge tone={fm.tone} className="text-[11px] px-2 py-0.5">{fm.label}</Badge>
                      <span className="text-[11px] text-muted-foreground tabular-nums">
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
        <Card className="h-full">
          <CardHeader
            title="Evolução do índice"
            description="Série diária do índice estimado de transparência (0 a 100)."
            icon={TrendingUp}
          />
          <EvolutionChart snapshots={snapshots} />
        </Card>
      </div>
      </div>
      </div>

      {/* ===================== Aba: Auditoria de links ===================== */}
      <div role="tabpanel" hidden={tab !== 'auditoria'}>
      {/* Auditoria inteligente — Links da Transparência */}
      <Card>
        <CardHeader
          title="Auditoria inteligente — Links da Transparência"
          description={`Valida cada link: URL preenchida, conteúdo do módulo interno (atas, pautas, licitações…) e acessibilidade de URLs externas. Atas/pautas/votações: meta quinzenal (${fortnight.label}).`}
          icon={Link2}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="h-full flex flex-col justify-center rounded-lg border border-border p-3 text-center">
            <p className="text-2xl font-bold text-foreground tabular-nums">{linkAudit.summary.total}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Links auditados</p>
          </div>
          <div className="h-full flex flex-col justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600 tabular-nums">{linkAudit.summary.ok}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Em dia / acessíveis</p>
          </div>
          <div className="h-full flex flex-col justify-center rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-center">
            <p className="text-2xl font-bold text-amber-600 tabular-nums">{linkAudit.summary.parcial}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Desatualizados</p>
          </div>
          <div className="h-full flex flex-col justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-center">
            <p className="text-2xl font-bold text-destructive tabular-nums">{linkAudit.summary.falha}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Vazios / quebrados</p>
          </div>
        </div>

        {sortedLinkGaps.length === 0 ? (
          <p className="text-sm text-emerald-600 font-medium py-4 text-center">
            Todos os links da transparência passaram na auditoria.
          </p>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto">
            {sortedLinkGaps.map((link) => {
              const hm = LINK_HEALTH_META[link.health]
              return (
                <div
                  key={link.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{link.title}</span>
                      <Badge tone={hm.tone} className="text-[11px] px-2 py-0.5">{hm.label}</Badge>
                      {link.matchedModule && (
                        <span className="text-[11px] text-muted-foreground">{link.matchedModule}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate" title={link.url}>
                      {link.url}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">{link.detail}</p>
                    <p className="text-[10px] text-muted-foreground/80 mt-0.5">
                      Seção: {link.sectionTitle}
                      {link.contentTotal !== null && ` · ${link.contentTotal} registro(s)`}
                      {link.contentLatest && ` · último: ${fmtDate(link.contentLatest)}`}
                      {link.httpStatus && ` · HTTP ${link.httpStatus}`}
                    </p>
                  </div>
                  {link.adminHref && (
                    <a
                      href={link.adminHref}
                      className="text-[11px] text-navy hover:underline shrink-0 inline-flex items-center gap-0.5"
                    >
                      Corrigir <ArrowUpRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Card>
      </div>

      {/* ===================== Aba: O que falta ===================== */}
      <div role="tabpanel" hidden={tab !== 'falta'}>
      {/* O que falta */}
      <Card>
        <CardHeader
          title="O que falta"
          description="Cada pendência explicada: o que a ATRICON exige, por que está pendente e como resolver. Priorizado pelo ganho real em pontos do índice — clique para expandir."
          icon={ListChecks}
        />
        {todo.length === 0 ? (
          <p className="text-sm text-emerald-600 font-semibold py-6 text-center">
            Nenhuma pendência. Toda a matriz está atendida.
          </p>
        ) : (
          <>
            <div className="space-y-2">
              {todoShown.map((c) => (
                <GapItem key={c.code} criterion={c} />
              ))}
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
      </div>

      {/* ===================== Aba: Matriz ===================== */}
      <div role="tabpanel" hidden={tab !== 'matriz'}>
      <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
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
            <option value="nao_ocorre">Não ocorre (declarado)</option>
          </Select>
        </div>
        <span className="text-xs text-muted-foreground ml-auto tabular-nums">{filtered.length} critérios exibidos</span>
      </div>

      {/* Lista por dimensão */}
      <div className="space-y-6">
        {scores.dimensions
          .filter((d) => grouped.has(d.key))
          .map((d) => (
            <div key={d.key}>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-2.5 flex items-center gap-2">
                {d.label}
                <span className="text-[11px] font-medium text-muted-foreground normal-case tabular-nums">
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
      <div className="bg-sky/10 border border-sky/20 rounded-xl p-4 text-xs text-sky flex items-start gap-2">
        <ExternalLink className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          Os critérios de <strong>e-SIC e Ouvidoria</strong> são atendidos pelo sistema externo contratado
          e entram no radar como “Sistema externo” (contam como atendidos no índice). Mantenha os links de
          acesso visíveis no portal — isso é o que o avaliador confere.
        </p>
      </div>
      </div>
      </div>
    </AdminLayout>
  )
}
