import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Users, ScrollText } from 'lucide-react'
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
} from '~/components/admin/ui'
import FileField from '~/components/admin/FileField'
import RichTextEditor from '~/components/admin/RichTextEditor'

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

const TYPES = [
  'Projeto de Lei',
  'Requerimento',
  'Projeto de Resolução',
  'Indicação',
  'Veto',
  'Portaria',
  'Moção',
  'Emenda',
]
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

export default function ActivityForm({
  activity,
  councilors = [],
  authorIds = [],
  origins = [],
}: Props) {
  const isEditing = !!activity
  const { data, setData, post, processing } = useForm({
    type: activity?.type || 'Projeto de Lei',
    origin: activity?.origin || 'nao_informado',
    number: activity?.number || '',
    year: activity?.year || new Date().getFullYear(),
    summary: activity?.summary || '',
    content: activity?.content || '',
    status: activity?.status || 'tramitando',
    author: extraAuthorText(activity?.author || '', councilors, authorIds),
    author_ids: authorIds,
    session_date: activity?.session_date || '',
    file: null as File | null,
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
      post(`/painel/atividades/${activity.id}?_method=PUT`, { forceFormData: true })
    } else {
      post('/painel/atividades', { forceFormData: true })
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

      <PageHeader
        title={isEditing ? 'Editar Atividade Legislativa' : 'Nova Atividade Legislativa'}
        description={
          isEditing
            ? 'Atualize os dados e a tramitação da matéria.'
            : 'Preencha os campos abaixo para cadastrar uma matéria legislativa.'
        }
        icon={ScrollText}
        eyebrow="Atividades Legislativas"
      />

      <form onSubmit={handleSubmit} className="admin-form">
        <Card>
          <CardHeader title="Dados da Atividade" icon={ScrollText} />

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Field label="Tipo" required>
                <Select value={data.type} onChange={(e) => setData('type', e.target.value)} required>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Origem">
                <Select value={data.origin} onChange={(e) => setData('origin', e.target.value)}>
                  {(origins.length > 0
                    ? origins
                    : [
                        { value: 'nao_informado', label: 'Origem não informada' },
                        { value: 'legislativo', label: 'Poder Legislativo' },
                        { value: 'executivo', label: 'Poder Executivo' },
                      ]
                  ).map((origin) => (
                    <option key={origin.value} value={origin.value}>
                      {origin.label}
                    </option>
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
              <RichTextEditor
                value={data.content || ''}
                onChange={(html) => setData('content', html)}
                minHeight={260}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Situação">
                <Select value={data.status} onChange={(e) => setData('status', e.target.value)}>
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
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

            <FileField
              label="Arquivo (PDF/DOC)"
              name="file"
              accept=".pdf,.doc,.docx"
              currentUrl={activity?.file_url}
              hint="PDF, DOC ou DOCX (máx. 15 MB)."
              onChange={(file) => setData('file', file)}
            />
          </div>
        </Card>

        {/* Autores */}
        <Card>
          <CardHeader
            title="Autores"
            description="Selecione os vereadores autores. As matérias aparecem automaticamente na página individual de cada um."
            icon={Users}
          />

          <div className="space-y-5">
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
                        <img
                          src={c.photo}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                          {c.name.charAt(0)}
                        </span>
                      )}
                      <span className="min-w-0">
                        <span
                          className={`block text-sm font-medium truncate ${selected ? 'text-navy' : 'text-foreground'}`}
                        >
                          {c.name}
                        </span>
                        {c.party && (
                          <span className="block text-[11px] text-muted-foreground">{c.party}</span>
                        )}
                      </span>
                      <span
                        className={`ml-auto w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          selected ? 'bg-navy border-navy' : 'border-border'
                        }`}
                      >
                        {selected && (
                          <span className="text-white text-[10px] leading-none">✓</span>
                        )}
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
