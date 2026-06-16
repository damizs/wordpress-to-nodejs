import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Plus, Trash2, Users, Vote } from 'lucide-react'
import {
  Button,
  Card,
  CardHeader,
  Field,
  IconButton,
  Input,
  Select,
  Textarea,
} from '~/components/admin/ui'

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

/** Cores semânticas do voto (sim/não/abstenção) aplicadas ao select da linha */
function voteSelectClass(vote: string) {
  const base =
    'px-3 py-2 border rounded-lg text-sm font-medium outline-none transition-shadow focus:ring-2 focus:ring-navy/25'
  if (vote === 'sim') return `${base} border-emerald-300 bg-emerald-600/10 text-emerald-700`
  if (vote === 'nao') return `${base} border-destructive/40 bg-destructive/10 text-destructive`
  if (vote === 'abstencao') return `${base} border-amber-300 bg-amber-500/10 text-amber-700`
  return `${base} border-border bg-muted text-muted-foreground`
}

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

      <Link
        href="/painel/votacoes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="admin-form">
        <Card>
          <CardHeader title="Matéria Votada" icon={Vote} />

          <div className="space-y-4">
            <Field label="Matéria / Título" required>
              <Input
                type="text"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                required
                placeholder="Ex.: Projeto de Lei nº 12/2026 - Dispõe sobre..."
              />
            </Field>

            <Field label="Descrição / Resumo">
              <Textarea
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                rows={2}
                className="min-h-[60px]"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Data da Votação" required>
                <Input
                  type="date"
                  value={data.voting_date}
                  onChange={(e) => setData('voting_date', e.target.value)}
                  required
                />
              </Field>
              <Field label="Resultado">
                <Select value={data.result} onChange={(e) => setData('result', e.target.value)}>
                  <option value="aprovado">Aprovado</option>
                  <option value="rejeitado">Rejeitado</option>
                  <option value="retirado">Retirado</option>
                  <option value="adiado">Adiado</option>
                  <option value="outro">Outro</option>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Sessão Plenária">
                <Select
                  value={data.plenary_session_id}
                  onChange={(e) => setData('plenary_session_id', e.target.value)}
                >
                  <option value="">Nenhuma</option>
                  {sessions.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </Select>
              </Field>
              <Field label="Atividade Legislativa">
                <Select
                  value={data.legislative_activity_id}
                  onChange={(e) => setData('legislative_activity_id', e.target.value)}
                >
                  <option value="">Nenhuma</option>
                  {activities.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
                </Select>
              </Field>
            </div>

            <div className="flex flex-wrap gap-6 pt-1">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.is_unanimous}
                  onChange={(e) => setData('is_unanimous', e.target.checked)}
                  className="rounded border-border accent-navy"
                />
                Votação unânime
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.is_published}
                  onChange={(e) => setData('is_published', e.target.checked)}
                  className="rounded border-border accent-navy"
                />
                Publicar no site
              </label>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Votos por Vereador"
            icon={Users}
            actions={
              <div className="flex items-center gap-2">
                {data.entries.length > 0 && (
                  <div className="w-44">
                    <Select
                      onChange={(e) => { if (e.target.value) { setAllVotes(e.target.value); e.target.value = '' } }}
                      defaultValue=""
                    >
                      <option value="" disabled>Marcar todos como...</option>
                      {VOTE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Select>
                  </div>
                )}
                <Button type="button" variant="secondary" size="sm" onClick={fillWithCouncilors}>
                  <Users className="w-4 h-4" /> Preencher vereadores
                </Button>
              </div>
            }
          />

          {data.entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum voto registrado. Use "Preencher vereadores" para listar todos os vereadores ativos.
            </p>
          ) : (
            <div className="space-y-2">
              {data.entries.map((entry, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Select
                    value={entry.councilor_id?.toString() || ''}
                    onChange={(e) => {
                      const c = councilors.find((x) => x.id === Number(e.target.value))
                      updateEntry(i, {
                        councilor_id: c?.id ?? null,
                        councilor_name: c?.name ?? entry.councilor_name,
                        party: c?.party ?? entry.party,
                      })
                    }}
                    className="flex-1"
                  >
                    <option value="">{entry.councilor_name || 'Selecione o vereador'}</option>
                    {councilors.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}{c.party ? ` (${c.party})` : ''}</option>
                    ))}
                  </Select>
                  <select
                    value={entry.vote}
                    onChange={(e) => updateEntry(i, { vote: e.target.value })}
                    className={`w-36 shrink-0 ${voteSelectClass(entry.vote)}`}
                  >
                    {VOTE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <IconButton type="button" tone="delete" onClick={() => removeEntry(i)} title="Remover voto">
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={addEntry}
            className="mt-3 flex items-center gap-1.5 text-sm text-navy hover:text-navy-dark font-medium"
          >
            <Plus className="w-4 h-4" /> Adicionar voto
          </button>
        </Card>

        <Button type="submit" loading={processing}>
          {!processing && <Save className="w-4 h-4" />}
          {processing ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </AdminLayout>
  )
}
