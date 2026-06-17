import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Users, ScrollText, Link2 } from 'lucide-react'
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Select,
  Textarea,
} from '~/components/admin/ui'

interface CouncilorOption {
  id: number
  name: string
  party: string | null
  photo: string | null
}

interface Props {
  activity: any | null
  councilors?: CouncilorOption[]
  authorIds?: number[]
  origins?: { value: string; label: string }[]
}

const TYPES = ['Projeto de Lei', 'Requerimento', 'Projeto de Resolução', 'Indicação', 'Veto', 'Portaria', 'Moção', 'Emenda']
const STATUSES = [
  { value: 'tramitando', label: 'Em tramitação' },
  { value: 'aprovado', label: 'Aprovado / sancionado' },
  { value: 'rejeitado', label: 'Rejeitado' },
  { value: 'arquivado', label: 'Arquivado / vetado' },
]

/** Remove os nomes dos vereadores vinculados do texto livre (o backend junta tudo de novo ao salvar) */
function extraAuthorText(author: string, councilors: CouncilorOption[], selectedIds: number[]): string {
  let text = author
  for (const c of councilors) {
    if (selectedIds.includes(c.id)) {
      text = text.replace(c.name, '')
    }
  }
  return text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ')
}

function formatTramitationSteps(steps: any[] | null | undefined): string {
  if (!Array.isArray(steps)) return ''
  return steps
    .map((step) => [step.date, step.title, step.description].filter(Boolean).join(' | '))
    .join('\n')
}

export default function ActivityForm({ activity, councilors = [], authorIds = [], origins = [] }: Props) {
  const isEditing = !!activity
  const { data, setData, post, put, processing } = useForm({
    type: activity?.type || 'Projeto de Lei',
    origin: activity?.origin || 'nao_informado',
    number: activity?.number || '',
    year: activity?.year || new Date().getFullYear(),
    summary: activity?.summary || '',
    content: activity?.content || '',
    status: activity?.status || 'tramitando',
    author: extraAuthorText(activity?.author || '', councilors, authorIds),
    author_ids: authorIds,
    file_url: activity?.file_url || '',
    session_date: activity?.session_date || '',
    voting_system_id: activity?.voting_system_id || activity?.votingSystemId || '',
    voting_system_url: activity?.voting_system_url || activity?.votingSystemUrl || '',
    tramitation_steps_text: formatTramitationSteps(activity?.tramitation_steps || activity?.tramitationSteps),
  })

  const toggleAuthor = (id: number) => {
    setData(
      'author_ids',
      data.author_ids.includes(id)
        ? data.author_ids.filter((a) => a !== id)
        : [...data.author_ids, id]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      put(`/painel/atividades/${activity.id}`)
    } else {
      post('/painel/atividades')
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Atividade' : 'Nova Atividade'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Atividade - Painel`} />

      <Link
        href="/painel/atividades"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="admin-form">
        <Card>
          <CardHeader title="Dados da Atividade" icon={ScrollText} />

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Tipo" required>
                <Select value={data.type} onChange={(e) => setData('type', e.target.value)} required>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="Origem">
                <Select value={data.origin} onChange={(e) => setData('origin', e.target.value)}>
                  {(origins.length > 0 ? origins : [
                    { value: 'nao_informado', label: 'Origem não informada' },
                    { value: 'legislativo', label: 'Poder Legislativo' },
                    { value: 'executivo', label: 'Poder Executivo' },
                  ]).map((origin) => (
                    <option key={origin.value} value={origin.value}>{origin.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Número" required>
                <Input
                  type="text"
                  value={data.number}
                  onChange={(e) => setData('number', e.target.value)}
                  required
                  placeholder="001"
                />
              </Field>
              <Field label="Ano" required>
                <Input
                  type="number"
                  value={data.year}
                  onChange={(e) => setData('year', parseInt(e.target.value))}
                  required
                />
              </Field>
            </div>

            <Field label="Ementa" required>
              <Textarea
                value={data.summary}
                onChange={(e) => setData('summary', e.target.value)}
                rows={3}
                required
                className="resize-none"
              />
            </Field>

            <Field label="Conteúdo / Inteiro Teor">
              <Textarea
                value={data.content}
                onChange={(e) => setData('content', e.target.value)}
                rows={6}
                className="resize-none"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Situação">
                <Select value={data.status} onChange={(e) => setData('status', e.target.value)}>
                  {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
              </Field>
              <Field label="Data da Sessão">
                <Input
                  type="date"
                  value={data.session_date}
                  onChange={(e) => setData('session_date', e.target.value)}
                />
              </Field>
            </div>

            <Field label="URL do Arquivo (PDF)">
              <Input
                type="text"
                value={data.file_url}
                onChange={(e) => setData('file_url', e.target.value)}
                placeholder="https://..."
              />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Tramitação e integração"
            description="Preencha manualmente agora ou use estes campos para mapear a matéria quando a API do sistema de votação estiver disponível."
            icon={Link2}
          />

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="ID no sistema de votação">
                <Input
                  type="text"
                  value={data.voting_system_id}
                  onChange={(e) => setData('voting_system_id', e.target.value)}
                  placeholder="Ex.: 12345"
                />
              </Field>
              <Field label="URL no sistema de votação">
                <Input
                  type="text"
                  value={data.voting_system_url}
                  onChange={(e) => setData('voting_system_url', e.target.value)}
                  placeholder="https://..."
                />
              </Field>
            </div>

            <Field
              label="Linha do tempo de tramitação"
              hint="Uma etapa por linha. Ex.: 2026-06-17 | Enviado à comissão | Aguardando parecer."
            >
              <Textarea
                value={data.tramitation_steps_text}
                onChange={(e) => setData('tramitation_steps_text', e.target.value)}
                rows={5}
                placeholder={'2026-06-17 | Protocolo | Matéria protocolada\n2026-06-18 | Comissão | Encaminhada para análise'}
              />
            </Field>
          </div>
        </Card>

        {/* Autores */}
        <Card>
          <CardHeader
            title="Autores"
            description="Selecione os vereadores autores. As matérias aparecem automaticamente na página individual de cada um."
            icon={Users}
          />

          <div className="space-y-4">
            {councilors.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {councilors.map((c) => {
                  const selected = data.author_ids.includes(c.id)
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => toggleAuthor(c.id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all ${
                        selected
                          ? 'border-navy bg-navy/5 ring-1 ring-navy/30'
                          : 'border-border hover:border-navy/30 hover:bg-muted/40'
                      }`}
                    >
                      {c.photo ? (
                        <img src={c.photo} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                          {c.name.charAt(0)}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className={`block text-sm font-medium truncate ${selected ? 'text-navy' : 'text-foreground'}`}>
                          {c.name}
                        </span>
                        {c.party && <span className="block text-[11px] text-muted-foreground">{c.party}</span>}
                      </span>
                      <span
                        className={`ml-auto w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          selected ? 'bg-navy border-navy' : 'border-border'
                        }`}
                      >
                        {selected && <span className="text-white text-[10px] leading-none">✓</span>}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            <Field label="Outros autores (texto livre)">
              <Input
                type="text"
                value={data.author}
                onChange={(e) => setData('author', e.target.value)}
                placeholder="Ex.: Poder Executivo, Mesa Diretora..."
              />
            </Field>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={processing}>
            {!processing && <Save className="w-4 h-4" />}
            {processing ? 'Salvando...' : isEditing ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
