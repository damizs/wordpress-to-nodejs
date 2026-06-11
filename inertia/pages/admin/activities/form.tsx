import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Users } from 'lucide-react'

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
}

const TYPES = ['Projeto de Lei', 'Requerimento', 'Projeto de Resolução', 'Indicação', 'Veto', 'Portaria', 'Moção', 'Emenda']
const STATUSES = ['Em tramitação', 'Aprovado', 'Rejeitado', 'Arquivado', 'Sancionado', 'Vetado']

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

export default function ActivityForm({ activity, councilors = [], authorIds = [] }: Props) {
  const isEditing = !!activity
  const { data, setData, post, put, processing } = useForm({
    type: activity?.type || 'Projeto de Lei',
    number: activity?.number || '',
    year: activity?.year || new Date().getFullYear(),
    summary: activity?.summary || '',
    content: activity?.content || '',
    status: activity?.status || 'Em tramitação',
    author: extraAuthorText(activity?.author || '', councilors, authorIds),
    author_ids: authorIds,
    file_url: activity?.file_url || '',
    session_date: activity?.session_date || '',
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

      <Link href="/painel/atividades" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 mb-2">Dados da Atividade</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo *</label>
              <select value={data.type} onChange={(e) => setData('type', e.target.value)} required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Número *</label>
              <input type="text" value={data.number} onChange={(e) => setData('number', e.target.value)} required
                placeholder="001" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Ano *</label>
              <input type="number" value={data.year} onChange={(e) => setData('year', parseInt(e.target.value))} required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Ementa *</label>
            <textarea value={data.summary} onChange={(e) => setData('summary', e.target.value)} rows={3} required
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Conteúdo / Inteiro Teor</label>
            <textarea value={data.content} onChange={(e) => setData('content', e.target.value)} rows={6}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Situação</label>
              <select value={data.status} onChange={(e) => setData('status', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data da Sessão</label>
              <input type="date" value={data.session_date} onChange={(e) => setData('session_date', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">URL do Arquivo (PDF)</label>
            <input type="text" value={data.file_url} onChange={(e) => setData('file_url', e.target.value)}
              placeholder="https://..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>
        </div>

        {/* Autores */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-navy" />
            <h2 className="font-semibold text-gray-800">Autores</h2>
          </div>
          <p className="text-xs text-gray-500 -mt-2">
            Selecione os vereadores autores. As matérias aparecem automaticamente na página individual de cada um.
          </p>

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
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {c.photo ? (
                      <img src={c.photo} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                        {c.name.charAt(0)}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className={`block text-sm font-medium truncate ${selected ? 'text-navy' : 'text-gray-700'}`}>
                        {c.name}
                      </span>
                      {c.party && <span className="block text-[11px] text-gray-400">{c.party}</span>}
                    </span>
                    <span
                      className={`ml-auto w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        selected ? 'bg-navy border-navy' : 'border-gray-300'
                      }`}
                    >
                      {selected && <span className="text-white text-[10px] leading-none">✓</span>}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Outros autores (texto livre)</label>
            <input type="text" value={data.author} onChange={(e) => setData('author', e.target.value)}
              placeholder="Ex.: Poder Executivo, Mesa Diretora..." className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={processing}
            className="flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors disabled:opacity-50 font-medium">
            <Save className="w-4 h-4" />
            {processing ? 'Salvando...' : isEditing ? 'Atualizar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}
