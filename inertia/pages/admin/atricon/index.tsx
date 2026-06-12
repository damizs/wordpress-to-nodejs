import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { useMemo, useState } from 'react'
import {
  FileDown, Printer, CheckCircle2, AlertTriangle, XCircle, ExternalLink,
  MinusCircle, ChevronDown, ChevronUp, Sparkles, Gem, Save, Filter,
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

interface Criterion {
  code: string
  dimension: string
  title: string
  classification: 'essencial' | 'obrigatoria' | 'recomendada'
  verification: string[]
  hint: string
  route?: string
  external?: boolean
  status: StatusValue
  evidenceUrl: string | null
  notes: string | null
  lastUpdate: string | null
  auto: { ok: boolean; detail: string } | null
  autoLinks: Array<{ title: string; url: string }>
}

interface DimensionScore {
  key: string
  label: string
  weight: number
  total: number
  met: number
  partial: number
  pending: number
  pct: number
}

interface Props {
  matrix: Criterion[]
  scores: {
    dimensions: DimensionScore[]
    index: number
    level: string
    allEssentialsMet: boolean
    essentials: Array<{ code: string; title: string; status: StatusValue }>
    totals: {
      criteria: number
      met: number
      external: number
      partial: number
      pending: number
      notApplicable: number
    }
  }
  fortnight: { label: string; start: string; end: string }
}

const STATUS_META: Record<StatusValue, { label: string; tone: BadgeTone; dot: string }> = {
  atendido: { label: 'Atendido', tone: 'success', dot: 'bg-emerald-500' },
  parcial: { label: 'Parcial', tone: 'warning', dot: 'bg-amber-500' },
  pendente: { label: 'Pendente', tone: 'danger', dot: 'bg-destructive' },
  externo: { label: 'Sistema externo', tone: 'info', dot: 'bg-sky' },
  nao_se_aplica: { label: 'Não se aplica', tone: 'neutral', dot: 'bg-muted-foreground/40' },
}

const CLASS_TONE: Record<Criterion['classification'], BadgeTone> = {
  essencial: 'gold',
  obrigatoria: 'navy',
  recomendada: 'neutral',
}

const CLASS_LABEL = { essencial: 'Essencial', obrigatoria: 'Obrigatória', recomendada: 'Recomendada' }

const LEVEL_META: Record<string, { color: string; ring: string }> = {
  'Diamante': { color: 'text-cyan-600', ring: '#0891b2' },
  'Ouro': { color: 'text-yellow-600', ring: '#ca8a04' },
  'Prata': { color: 'text-muted-foreground', ring: '#6b7280' },
  'Elevado': { color: 'text-emerald-600', ring: '#059669' },
  'Intermediário': { color: 'text-amber-600', ring: '#d97706' },
  'Básico': { color: 'text-orange-600', ring: '#ea580c' },
  'Inicial': { color: 'text-destructive', ring: '#e11d48' },
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

function CriterionRow({ criterion }: { criterion: Criterion }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<StatusValue>(criterion.status)
  const [evidence, setEvidence] = useState(criterion.evidenceUrl ?? '')
  const [notes, setNotes] = useState(criterion.notes ?? '')
  const [saving, setSaving] = useState(false)
  const meta = STATUS_META[criterion.status]

  const save = () => {
    setSaving(true)
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
            {criterion.auto && (
              <Badge
                tone={criterion.auto.ok ? 'success' : 'warning'}
                className="text-[11px] px-2 py-0.5"
              >
                <span title={criterion.auto.detail} className="inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {criterion.auto.ok ? 'Detectado no portal' : 'Sem dados no portal'}
                </span>
              </Badge>
            )}
          </div>
          <p className="text-sm font-medium text-foreground mt-1">{criterion.title}</p>
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

          {criterion.auto && (
            <p className={`text-xs ${criterion.auto.ok ? 'text-emerald-600' : 'text-amber-600'}`}>
              <Sparkles className="w-3 h-3 inline mr-1" />
              Auto-verificação: {criterion.auto.detail}
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
              <Select value={status} onChange={(e) => setStatus(e.target.value as StatusValue)}>
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

          <div className="flex items-center justify-between">
            {criterion.lastUpdate && (
              <span className="text-[11px] text-muted-foreground">
                Última avaliação: {new Date(criterion.lastUpdate).toLocaleDateString('pt-BR')}
              </span>
            )}
            <Button type="button" size="sm" onClick={save} loading={saving} className="ml-auto">
              {!saving && <Save className="w-3.5 h-3.5" />}
              {saving ? 'Salvando…' : 'Salvar avaliação'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AtriconIndex({ matrix, scores, fortnight }: Props) {
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

      {/* Painel superior: índice + essenciais + resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Índice geral */}
        <Card className="flex items-center gap-6">
          <Gauge value={scores.index} level={scores.level} />
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
                <span className="text-foreground text-xs truncate" title={e.title}>{e.title}</span>
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
