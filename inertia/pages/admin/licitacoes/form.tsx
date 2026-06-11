import { Head, useForm, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Upload, Plus, Trash2, FileText, CheckCircle2, Circle } from 'lucide-react'
import { useState } from 'react'

interface LicitacaoDoc {
  id: number
  document_type: string
  title: string
  file_url: string
}

interface Props {
  licitacao: any | null
  documents: LicitacaoDoc[]
  documentTypes: Record<string, string>
  modalityChecklist: Record<string, string[]>
}

interface NewDocRow {
  type: string
  title: string
  file: File | null
}

export default function LicitacaoForm({ licitacao, documents, documentTypes, modalityChecklist }: Props) {
  const isEditing = !!licitacao
  const [newDocs, setNewDocs] = useState<NewDocRow[]>([])
  const [submitting, setSubmitting] = useState(false)

  const { data, setData } = useForm({
    title: licitacao?.title || '',
    number: licitacao?.number || '',
    modality: licitacao?.modality || 'pregao',
    status: licitacao?.status || 'aberta',
    object: licitacao?.object || '',
    content: licitacao?.content || '',
    estimated_value: licitacao?.estimated_value || '',
    opening_date: licitacao?.opening_date || '',
    closing_date: licitacao?.closing_date || '',
    year: licitacao?.year || new Date().getFullYear(),
    is_active: licitacao?.is_active ?? true,
  })

  const checklist = modalityChecklist[data.modality] || Object.keys(documentTypes).filter((t) => t !== 'outros')
  const typesWithFiles = new Set(documents.map((d) => d.document_type))

  function addRow(type?: string) {
    setNewDocs([...newDocs, { type: type || checklist[0] || 'outros', title: '', file: null }])
  }

  function updateRow(index: number, patch: Partial<NewDocRow>) {
    setNewDocs(newDocs.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  function removeRow(index: number) {
    setNewDocs(newDocs.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const rows = newDocs.filter((r) => r.file)
    const payload: Record<string, any> = {
      ...data,
      doc_types: rows.map((r) => r.type),
      doc_titles: rows.map((r) => r.title),
      doc_files: rows.map((r) => r.file),
    }
    const options = {
      forceFormData: true,
      onStart: () => setSubmitting(true),
      onFinish: () => setSubmitting(false),
      onSuccess: () => setNewDocs([]),
    }
    if (isEditing) {
      router.post(`/painel/licitacoes/${licitacao.id}?_method=PUT`, payload, options)
    } else {
      router.post('/painel/licitacoes', payload, options)
    }
  }

  function deleteDocument(id: number) {
    if (confirm('Remover este documento?')) {
      router.delete(`/painel/licitacoes/documentos/${id}`, { preserveScroll: true })
    }
  }

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none'

  return (
    <AdminLayout title={isEditing ? 'Editar Licitação' : 'Nova Licitação'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Licitação - Painel`} />
      <Link href="/painel/licitacoes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Título *</label>
            <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} required className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Número</label>
              <input type="text" value={data.number} onChange={(e) => setData('number', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Modalidade</label>
              <select value={data.modality} onChange={(e) => setData('modality', e.target.value)} className={inputClass}>
                <option value="pregao">Pregão</option>
                <option value="concorrencia">Concorrência</option>
                <option value="dispensa">Dispensa</option>
                <option value="inexigibilidade">Inexigibilidade</option>
                <option value="tomada_precos">Tomada de Preços</option>
                <option value="convite">Convite</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
              <select value={data.status} onChange={(e) => setData('status', e.target.value)} className={inputClass}>
                <option value="aberta">Aberta</option>
                <option value="em_andamento">Em andamento</option>
                <option value="encerrada">Encerrada</option>
                <option value="deserta">Deserta</option>
                <option value="revogada">Revogada</option>
                <option value="suspensa">Suspensa</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Objeto da Licitação</label>
            <textarea value={data.object} onChange={(e) => setData('object', e.target.value)} rows={3} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Valor Estimado (R$)</label>
              <input type="number" step="0.01" value={data.estimated_value} onChange={(e) => setData('estimated_value', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data Abertura</label>
              <input type="date" value={data.opening_date} onChange={(e) => setData('opening_date', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data Encerramento</label>
              <input type="date" value={data.closing_date} onChange={(e) => setData('closing_date', e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Conteúdo / Detalhes</label>
            <textarea value={data.content} onChange={(e) => setData('content', e.target.value)} rows={4} className={inputClass} />
          </div>
        </div>

        {/* ===== Documentos do Processo ===== */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
          <div>
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-navy" /> Documentos do Processo
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Sem limite de arquivos. O checklist abaixo mostra as fases sugeridas para a modalidade selecionada.
            </p>
          </div>

          {/* Checklist da modalidade */}
          <div className="flex flex-wrap gap-2">
            {checklist.map((type) => {
              const done = typesWithFiles.has(type) || newDocs.some((r) => r.type === type && r.file)
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => addRow(type)}
                  title={`Adicionar arquivo em ${documentTypes[type]}`}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    done
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-navy/40 hover:text-navy'
                  }`}
                >
                  {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                  {documentTypes[type]?.split(' — ')[0] || type}
                </button>
              )
            })}
          </div>

          {/* Documentos já enviados */}
          {documents.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Enviados ({documents.length})</h3>
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="px-2 py-1 bg-navy/10 text-navy text-xs font-semibold rounded shrink-0">
                    {documentTypes[doc.document_type]?.split(' — ')[0] || doc.document_type}
                  </span>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-gray-700 hover:text-navy truncate underline-offset-2 hover:underline">
                    {doc.title}
                  </a>
                  <button type="button" onClick={() => deleteDocument(doc.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Remover">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Novos uploads */}
          {newDocs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">Novos arquivos</h3>
              {newDocs.map((row, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-[180px_1fr_auto_auto] gap-2 items-center p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                  <select value={row.type} onChange={(e) => updateRow(index, { type: e.target.value })} className="px-2 py-2 border border-gray-200 rounded-lg text-xs bg-white outline-none">
                    {Object.entries(documentTypes).map(([value, label]) => (
                      <option key={value} value={value}>{label.split(' — ')[0]}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Título (opcional — usa o nome do arquivo)"
                    value={row.title}
                    onChange={(e) => updateRow(index, { title: e.target.value })}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white outline-none"
                  />
                  <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white cursor-pointer hover:bg-gray-50 max-w-[200px]">
                    <Upload className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{row.file ? row.file.name : 'Escolher arquivo'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.odt,.ods,.zip,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => updateRow(index, { file: e.target.files?.[0] || null })}
                    />
                  </label>
                  <button type="button" onClick={() => removeRow(index)} className="p-1.5 text-gray-400 hover:text-red-500" title="Remover linha">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="button" onClick={() => addRow()} className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-navy/50 hover:text-navy transition-colors">
            <Plus className="w-4 h-4" /> Adicionar arquivo
          </button>

          {licitacao?.file_url && (
            <p className="text-xs text-gray-400">
              PDF antigo (campo único):{' '}
              <a href={licitacao.file_url} target="_blank" rel="noopener noreferrer" className="text-navy underline">ver arquivo</a>
              {' '}— continua visível no site como "Edital (PDF)".
            </p>
          )}
        </div>

        <button type="submit" disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium disabled:opacity-50">
          <Save className="w-4 h-4" /> {submitting ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </AdminLayout>
  )
}
