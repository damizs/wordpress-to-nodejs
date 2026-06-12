import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { ArrowLeft, Sparkles, FileText, Trash2, Save, AlertCircle, CheckCircle2, Plus } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Field,
  IconButton,
  Input,
  Select,
} from '~/components/admin/ui'

interface SessionItem {
  id: number
  title: string
  date: string
  has_minutes: boolean
  has_file: boolean
  already_imported: boolean
}

interface CouncilorOption { id: number; name: string; party: string | null }

interface ReviewEntry {
  councilor_id: number | null
  councilor_name: string
  party: string | null
  vote: string
}

interface ReviewVoting {
  title: string
  description: string
  result: string
  is_unanimous: boolean
  is_published: boolean
  entries: ReviewEntry[]
}

interface Props {
  sessions: SessionItem[]
  councilors: CouncilorOption[]
}

const VOTE_OPTIONS = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
  { value: 'abstencao', label: 'Abstenção' },
  { value: 'ausente', label: 'Ausente' },
  { value: 'nao_votou', label: 'Não votou' },
]

/** Cores semânticas do voto (sim/não/abstenção) aplicadas ao select da linha */
function voteSelectClass(vote: string) {
  const base =
    'px-2.5 py-2 border rounded-lg text-sm font-medium outline-none transition-shadow focus:ring-2 focus:ring-navy/25'
  if (vote === 'sim') return `${base} border-emerald-300 bg-emerald-600/10 text-emerald-700`
  if (vote === 'nao') return `${base} border-destructive/40 bg-destructive/10 text-destructive`
  if (vote === 'abstencao') return `${base} border-amber-300 bg-amber-500/10 text-amber-700`
  return `${base} border-border bg-muted text-muted-foreground`
}

function getCsrfToken() {
  return document.cookie.split('; ').find((row) => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''
}

export default function ImportVotings({ sessions = [], councilors = [] }: Props) {
  const [selectedSession, setSelectedSession] = useState<number | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [votings, setVotings] = useState<ReviewVoting[] | null>(null)

  const session = sessions.find((s) => s.id === selectedSession)

  async function extract() {
    if (!selectedSession) return
    setExtracting(true)
    setError(null)
    setVotings(null)
    try {
      const response = await fetch('/painel/votacoes/importar/extrair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': decodeURIComponent(getCsrfToken()) },
        body: JSON.stringify({ session_id: selectedSession }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Falha ao extrair votações da ata.')
        return
      }
      setVotings(
        (data.votings || []).map((v: any): ReviewVoting => ({
          title: v.materia,
          description: v.descricao || '',
          result: v.resultado || 'aprovado',
          is_unanimous: Boolean(v.unanime),
          is_published: true,
          entries: (v.votos || []).map((voto: any): ReviewEntry => ({
            councilor_id: voto.councilor_id ?? null,
            councilor_name: voto.councilor_name || voto.vereador,
            party: voto.party ?? null,
            vote: voto.voto,
          })),
        }))
      )
    } catch (e: any) {
      setError(e.message || 'Erro de conexão ao extrair votações.')
    } finally {
      setExtracting(false)
    }
  }

  function updateVoting(index: number, patch: Partial<ReviewVoting>) {
    if (!votings) return
    const next = [...votings]
    next[index] = { ...next[index], ...patch }
    setVotings(next)
  }

  function updateEntry(vIndex: number, eIndex: number, patch: Partial<ReviewEntry>) {
    if (!votings) return
    const next = [...votings]
    const entries = [...next[vIndex].entries]
    entries[eIndex] = { ...entries[eIndex], ...patch }
    next[vIndex] = { ...next[vIndex], entries }
    setVotings(next)
  }

  function save() {
    if (!votings || votings.length === 0 || !selectedSession) return
    setSaving(true)
    router.post(
      '/painel/votacoes/importar/salvar',
      { session_id: selectedSession, votings: votings as any },
      { onFinish: () => setSaving(false) }
    )
  }

  return (
    <AdminLayout title="Importar Votações da Ata">
      <Head title="Importar Votações - Painel" />

      <Link
        href="/painel/votacoes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar para Votações
      </Link>

      {/* Passo 1: escolher a sessão */}
      <Card className="mb-6">
        <CardHeader
          title="1. Escolha a sessão"
          description="A IA lê a ata (texto ou PDF) e identifica as matérias votadas e o voto de cada vereador. Você revisa tudo antes de salvar."
          icon={Sparkles}
        />

        <div className="flex flex-col sm:flex-row gap-3">
          <Select
            value={selectedSession ?? ''}
            onChange={(e) => { setSelectedSession(e.target.value ? Number(e.target.value) : null); setVotings(null); setError(null) }}
            className="flex-1"
          >
            <option value="">Selecione uma sessão com ata...</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {new Date(s.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} — {s.title}
                {s.already_imported ? ' (já importada)' : ''}
              </option>
            ))}
          </Select>
          <Button onClick={extract} disabled={!selectedSession} loading={extracting} className="shrink-0">
            {!extracting && <Sparkles className="w-4 h-4" />}
            {extracting ? 'Lendo a ata...' : 'Extrair votações com IA'}
          </Button>
        </div>

        {session && (
          <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Fonte: {session.has_minutes ? 'texto da ata' : ''}{session.has_minutes && session.has_file ? ' + ' : ''}{session.has_file ? 'arquivo PDF' : ''}
            {session.already_imported && ' · Atenção: esta sessão já teve votações importadas antes'}
          </p>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </Card>

      {/* Passo 2: revisão */}
      {votings !== null && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">
              2. Revise as votações encontradas ({votings.length})
            </h2>
            {votings.length > 0 && (
              <Button onClick={save} loading={saving}>
                {!saving && <Save className="w-4 h-4" />}
                Salvar {votings.length} votação(ões)
              </Button>
            )}
          </div>

          {votings.length === 0 && (
            <EmptyState
              icon={CheckCircle2}
              title="A IA não encontrou votações nesta ata."
              description="Se houver votações, cadastre manualmente ou verifique o conteúdo da ata."
            />
          )}

          {votings.map((v, vi) => (
            <Card key={vi} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <Badge tone="navy">Votação {vi + 1}</Badge>
                <IconButton
                  tone="delete"
                  onClick={() => setVotings(votings.filter((_, i) => i !== vi))}
                  title="Descartar esta votação"
                >
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              </div>

              <Field label="Matéria" required>
                <Input
                  type="text"
                  value={v.title}
                  onChange={(e) => updateVoting(vi, { title: e.target.value })}
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Resultado">
                  <Select value={v.result} onChange={(e) => updateVoting(vi, { result: e.target.value })}>
                    <option value="aprovado">Aprovado</option>
                    <option value="rejeitado">Rejeitado</option>
                    <option value="retirado">Retirado</option>
                    <option value="adiado">Adiado</option>
                    <option value="outro">Outro</option>
                  </Select>
                </Field>
                <label className="flex items-end gap-2 text-sm text-muted-foreground cursor-pointer pb-2.5">
                  <input
                    type="checkbox"
                    checked={v.is_unanimous}
                    onChange={(e) => updateVoting(vi, { is_unanimous: e.target.checked })}
                    className="rounded border-border accent-navy"
                  />
                  Unânime
                </label>
                <label className="flex items-end gap-2 text-sm text-muted-foreground cursor-pointer pb-2.5">
                  <input
                    type="checkbox"
                    checked={v.is_published}
                    onChange={(e) => updateVoting(vi, { is_published: e.target.checked })}
                    className="rounded border-border accent-navy"
                  />
                  Publicar no site
                </label>
              </div>

              {v.entries.length > 0 && (
                <div>
                  <p className="text-[13px] font-semibold text-foreground mb-2">Votos ({v.entries.length})</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {v.entries.map((entry, ei) => (
                      <div key={ei} className="flex items-center gap-2">
                        <select
                          value={entry.councilor_id?.toString() || ''}
                          onChange={(e) => {
                            const c = councilors.find((x) => x.id === Number(e.target.value))
                            updateEntry(vi, ei, {
                              councilor_id: c?.id ?? null,
                              councilor_name: c?.name ?? entry.councilor_name,
                              party: c?.party ?? entry.party,
                            })
                          }}
                          className={`flex-1 min-w-0 px-2.5 py-2 border rounded-lg text-sm text-foreground outline-none transition-shadow focus:ring-2 focus:ring-navy/25 ${
                            entry.councilor_id ? 'border-border bg-card' : 'border-amber-300 bg-amber-500/10'
                          }`}
                          title={entry.councilor_id ? entry.councilor_name : `"${entry.councilor_name}" não casou com o cadastro — selecione o vereador`}
                        >
                          <option value="">{entry.councilor_name} (?)</option>
                          {councilors.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}{c.party ? ` (${c.party})` : ''}</option>
                          ))}
                        </select>
                        <select
                          value={entry.vote}
                          onChange={(e) => updateEntry(vi, ei, { vote: e.target.value })}
                          className={`w-32 shrink-0 ${voteSelectClass(entry.vote)}`}
                        >
                          {VOTE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <IconButton
                          tone="delete"
                          onClick={() => updateVoting(vi, { entries: v.entries.filter((_, i) => i !== ei) })}
                          title="Remover voto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </IconButton>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => updateVoting(vi, {
                  entries: [...v.entries, { councilor_id: null, councilor_name: '', party: null, vote: 'sim' }],
                })}
                className="flex items-center gap-1.5 text-sm text-navy hover:text-navy-dark font-medium"
              >
                <Plus className="w-4 h-4" /> Adicionar voto
              </button>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
