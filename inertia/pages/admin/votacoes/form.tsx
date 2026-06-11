import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Plus, Trash2, Users } from 'lucide-react'

interface Entry {
  councilor_id: number | null
  councilor_name: string
  party: string | null
  vote: string
}

interface Props {
  voting: any | null
  sessions: { id: number; title: string; date: string }[]
  activities: { id: number; label: string }[]
  councilors: { id: number; name: string; party: string | null }[]
}

const VOTE_OPTIONS = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
  { value: 'abstencao', label: 'Abstenção' },
  { value: 'ausente', label: 'Ausente' },
  { value: 'nao_votou', label: 'Não votou' },
]

export default function VotingForm({ voting, sessions = [], activities = [], councilors = [] }: Props) {
  const isEditing = !!voting
  const { data, setData, post, put, processing } = useForm({
    title: voting?.title || '',
    description: voting?.description || '',
    plenary_session_id: voting?.plenary_session_id?.toString() || '',
    legislative_activity_id: voting?.legislative_activity_id?.toString() || '',
    voting_date: voting?.voting_date || '',
    result: voting?.result || 'aprovado',
    is_unanimous: voting?.is_unanimous || false,
    is_published: voting?.is_published ?? false,
    entries: (voting?.entries || []) as Entry[],
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      put(`/painel/votacoes/${voting.id}`)
    } else {
      post('/painel/votacoes')
    }
  }

  function fillWithCouncilors() {
    setData('entries', councilors.map((c) => ({
      councilor_id: c.id,
      councilor_name: c.name,
      party: c.party,
      vote: 'sim',
    })))
  }

  function updateEntry(index: number, patch: Partial<Entry>) {
    const next = [...data.entries]
    next[index] = { ...next[index], ...patch }
    setData('entries', next)
  }

  function removeEntry(index: number) {
    setData('entries', data.entries.filter((_, i) => i !== index))
  }

  function addEntry() {
    setData('entries', [...data.entries, { councilor_id: null, councilor_name: '', party: null, vote: 'sim' }])
  }

  function setAllVotes(vote: string) {
    setData('entries', data.entries.map((e) => ({ ...e, vote })))
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Votação' : 'Nova Votação'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Votação - Painel`} />

      <Link href="/painel/votacoes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 mb-2">Matéria Votada</h2>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Matéria / Título *</label>
            <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)}
              required placeholder="Ex.: Projeto de Lei nº 12/2026 - Dispõe sobre..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descrição / Resumo</label>
            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)}
              rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data da Votação *</label>
              <input type="date" value={data.voting_date} onChange={(e) => setData('voting_date', e.target.value)}
                required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Resultado</label>
              <select value={data.result} onChange={(e) => setData('result', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                <option value="aprovado">Aprovado</option>
                <option value="rejeitado">Rejeitado</option>
                <option value="retirado">Retirado</option>
                <option value="adiado">Adiado</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Sessão Plenária</label>
              <select value={data.plenary_session_id} onChange={(e) => setData('plenary_session_id', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                <option value="">Nenhuma</option>
                {sessions.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Atividade Legislativa</label>
              <select value={data.legislative_activity_id} onChange={(e) => setData('legislative_activity_id', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                <option value="">Nenhuma</option>
                {activities.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={data.is_unanimous} onChange={(e) => setData('is_unanimous', e.target.checked)}
                className="rounded border-gray-300" />
              Votação unânime
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={data.is_published} onChange={(e) => setData('is_published', e.target.checked)}
                className="rounded border-gray-300" />
              Publicar no site
            </label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-semibold text-gray-800">Votos por Vereador</h2>
            <div className="flex items-center gap-2">
              {data.entries.length > 0 && (
                <select onChange={(e) => { if (e.target.value) { setAllVotes(e.target.value); e.target.value = '' } }}
                  defaultValue="" className="text-sm border border-gray-200 rounded-lg px-2 py-1.5">
                  <option value="" disabled>Marcar todos como...</option>
                  {VOTE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              )}
              <button type="button" onClick={fillWithCouncilors}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                <Users className="w-4 h-4" /> Preencher vereadores
              </button>
            </div>
          </div>

          {data.entries.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              Nenhum voto registrado. Use "Preencher vereadores" para listar todos os vereadores ativos.
            </p>
          ) : (
            <div className="space-y-2">
              {data.entries.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={entry.councilor_id?.toString() || ''}
                    onChange={(e) => {
                      const c = councilors.find((x) => x.id === Number(e.target.value))
                      updateEntry(i, {
                        councilor_id: c?.id ?? null,
                        councilor_name: c?.name ?? entry.councilor_name,
                        party: c?.party ?? entry.party,
                      })
                    }}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 outline-none">
                    <option value="">{entry.councilor_name || 'Selecione o vereador'}</option>
                    {councilors.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}{c.party ? ` (${c.party})` : ''}</option>
                    ))}
                  </select>
                  <select value={entry.vote} onChange={(e) => updateEntry(i, { vote: e.target.value })}
                    className={`w-36 px-3 py-2 border rounded-lg text-sm font-medium outline-none ${
                      entry.vote === 'sim' ? 'border-green-200 bg-green-50 text-green-700' :
                      entry.vote === 'nao' ? 'border-red-200 bg-red-50 text-red-700' :
                      entry.vote === 'abstencao' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                      'border-gray-200 bg-gray-50 text-gray-600'
                    }`}>
                    {VOTE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <button type="button" onClick={() => removeEntry(i)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="button" onClick={addEntry}
            className="mt-3 flex items-center gap-1.5 text-sm text-navy hover:text-navy-dark font-medium">
            <Plus className="w-4 h-4" /> Adicionar voto
          </button>
        </div>

        <button type="submit" disabled={processing}
          className="flex items-center gap-2 px-6 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium disabled:opacity-50">
          <Save className="w-4 h-4" />
          {processing ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </AdminLayout>
  )
}
