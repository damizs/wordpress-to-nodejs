import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { ArrowLeft, Sparkles, FileText, Loader2, Trash2, Save, AlertCircle, CheckCircle2, Plus } from 'lucide-react'
import { useState } from 'react'

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

      <Link href="/painel/votacoes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar para Votações
      </Link>

      {/* Passo 1: escolher a sessão */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-800 mb-1">1. Escolha a sessão</h2>
        <p className="text-sm text-gray-500 mb-4">
          A IA lê a ata (texto ou PDF) e identifica as matérias votadas e o voto de cada vereador.
          Você revisa tudo antes de salvar.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedSession ?? ''}
            onChange={(e) => { setSelectedSession(e.target.value ? Number(e.target.value) : null); setVotings(null); setError(null) }}
            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
            <option value="">Selecione uma sessão com ata...</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {new Date(s.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} — {s.title}
                {s.already_imported ? ' (já importada)' : ''}
              </option>
            ))}
          </select>
          <button onClick={extract} disabled={!selectedSession || extracting}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium disabled:opacity-50">
            {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {extracting ? 'Lendo a ata...' : 'Extrair votações com IA'}
          </button>
        </div>

        {session && (
          <p className="mt-3 text-xs text-gray-400 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Fonte: {session.has_minutes ? 'texto da ata' : ''}{session.has_minutes && session.has_file ? ' + ' : ''}{session.has_file ? 'arquivo PDF' : ''}
            {session.already_imported && ' · Atenção: esta sessão já teve votações importadas antes'}
          </p>
        )}

        {error && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Passo 2: revisão */}
      {votings !== null && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">
              2. Revise as votações encontradas ({votings.length})
            </h2>
            {votings.length > 0 && (
              <button onClick={save} disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar {votings.length} votação(ões)
              </button>
            )}
          </div>

          {votings.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">A IA não encontrou votações nesta ata.</p>
              <p className="text-sm text-gray-400 mt-1">Se houver votações, cadastre manualmente ou verifique o conteúdo da ata.</p>
            </div>
          )}

          {votings.map((v, vi) => (
            <div key={vi} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <span className="px-2.5 py-1 rounded-full bg-navy/5 text-navy text-xs font-semibold shrink-0">Votação {vi + 1}</span>
                <button onClick={() => setVotings(votings.filter((_, i) => i !== vi))}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors" title="Descartar esta votação">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Matéria *</label>
                <input type="text" value={v.title} onChange={(e) => updateVoting(vi, { title: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Resultado</label>
                  <select value={v.result} onChange={(e) => updateVoting(vi, { result: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none">
                    <option value="aprovado">Aprovado</option>
                    <option value="rejeitado">Rejeitado</option>
                    <option value="retirado">Retirado</option>
                    <option value="adiado">Adiado</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <label className="flex items-end gap-2 text-sm text-gray-600 cursor-pointer pb-2.5">
                  <input type="checkbox" checked={v.is_unanimous} onChange={(e) => updateVoting(vi, { is_unanimous: e.target.checked })}
                    className="rounded border-gray-300" />
                  Unânime
                </label>
                <label className="flex items-end gap-2 text-sm text-gray-600 cursor-pointer pb-2.5">
                  <input type="checkbox" checked={v.is_published} onChange={(e) => updateVoting(vi, { is_published: e.target.checked })}
                    className="rounded border-gray-300" />
                  Publicar no site
                </label>
              </div>

              {v.entries.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Votos ({v.entries.length})</p>
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
                          className={`flex-1 px-2.5 py-2 border rounded-lg text-sm outline-none ${entry.councilor_id ? 'border-gray-200' : 'border-amber-300 bg-amber-50'}`}
                          title={entry.councilor_id ? entry.councilor_name : `"${entry.councilor_name}" não casou com o cadastro — selecione o vereador`}>
                          <option value="">{entry.councilor_name} (?)</option>
                          {councilors.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}{c.party ? ` (${c.party})` : ''}</option>
                          ))}
                        </select>
                        <select value={entry.vote} onChange={(e) => updateEntry(vi, ei, { vote: e.target.value })}
                          className={`w-32 px-2.5 py-2 border rounded-lg text-sm font-medium outline-none ${
                            entry.vote === 'sim' ? 'border-green-200 bg-green-50 text-green-700' :
                            entry.vote === 'nao' ? 'border-red-200 bg-red-50 text-red-700' :
                            entry.vote === 'abstencao' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                            'border-gray-200 bg-gray-50 text-gray-600'
                          }`}>
                          {VOTE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <button onClick={() => updateVoting(vi, { entries: v.entries.filter((_, i) => i !== ei) })}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-600 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => updateVoting(vi, {
                  entries: [...v.entries, { councilor_id: null, councilor_name: '', party: null, vote: 'sim' }],
                })}
                className="flex items-center gap-1.5 text-sm text-navy hover:text-navy-dark font-medium">
                <Plus className="w-4 h-4" /> Adicionar voto
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
