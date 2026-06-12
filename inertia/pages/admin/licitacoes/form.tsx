import { Head, useForm, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Upload, Plus, Trash2, FileText, CheckCircle2, Circle } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  ConfirmDelete,
  Field,
  IconButton,
  Input,
  Select,
  Textarea,
} from '~/components/admin/ui'

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
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; label: string } | null>(null)

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

  return (
    <AdminLayout title={isEditing ? 'Editar Licitação' : 'Nova Licitação'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Licitação - Painel`} />
      <Link href="/painel/licitacoes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        <Card className="space-y-4">
          <Field label="Título" required>
            <Input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Número">
              <Input type="text" value={data.number} onChange={(e) => setData('number', e.target.value)} />
            </Field>
            <Field label="Modalidade">
              <Select value={data.modality} onChange={(e) => setData('modality', e.target.value)}>
                <option value="pregao">Pregão</option>
                <option value="concorrencia">Concorrência</option>
                <option value="dispensa">Dispensa</option>
                <option value="inexigibilidade">Inexigibilidade</option>
                <option value="tomada_precos">Tomada de Preços</option>
                <option value="convite">Convite</option>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={data.status} onChange={(e) => setData('status', e.target.value)}>
                <option value="aberta">Aberta</option>
                <option value="em_andamento">Em andamento</option>
                <option value="encerrada">Encerrada</option>
                <option value="deserta">Deserta</option>
                <option value="revogada">Revogada</option>
                <option value="suspensa">Suspensa</option>
              </Select>
            </Field>
          </div>
          <Field label="Objeto da Licitação">
            <Textarea value={data.object} onChange={(e) => setData('object', e.target.value)} rows={3} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Valor Estimado (R$)">
              <Input type="number" step="0.01" value={data.estimated_value} onChange={(e) => setData('estimated_value', e.target.value)} />
            </Field>
            <Field label="Data Abertura">
              <Input type="date" value={data.opening_date} onChange={(e) => setData('opening_date', e.target.value)} />
            </Field>
            <Field label="Data Encerramento">
              <Input type="date" value={data.closing_date} onChange={(e) => setData('closing_date', e.target.value)} />
            </Field>
          </div>
          <Field label="Conteúdo / Detalhes">
            <Textarea value={data.content} onChange={(e) => setData('content', e.target.value)} rows={4} />
          </Field>
        </Card>

        {/* ===== Documentos do Processo ===== */}
        <Card className="space-y-5">
          <CardHeader
            title="Documentos do Processo"
            description="Sem limite de arquivos. O checklist abaixo mostra as fases sugeridas para a modalidade selecionada."
            icon={FileText}
          />

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
                      ? 'bg-emerald-600/10 border-emerald-600/25 text-emerald-700'
                      : 'bg-muted border-border text-muted-foreground hover:border-navy/40 hover:text-navy'
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
              <h3 className="text-sm font-medium text-muted-foreground">Enviados ({documents.length})</h3>
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
                  <Badge tone="navy" className="shrink-0">
                    {documentTypes[doc.document_type]?.split(' — ')[0] || doc.document_type}
                  </Badge>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-foreground hover:text-navy truncate underline-offset-2 hover:underline">
                    {doc.title}
                  </a>
                  <IconButton
                    type="button"
                    tone="delete"
                    title="Remover"
                    onClick={() => setDeleteTarget({ id: doc.id, label: doc.title })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </div>
              ))}
            </div>
          )}

          {/* Novos uploads */}
          {newDocs.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Novos arquivos</h3>
              {newDocs.map((row, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-[180px_1fr_auto_auto] gap-2 items-center p-3 bg-navy/5 rounded-lg border border-navy/10">
                  <Select value={row.type} onChange={(e) => updateRow(index, { type: e.target.value })}>
                    {Object.entries(documentTypes).map(([value, label]) => (
                      <option key={value} value={value}>{label.split(' — ')[0]}</option>
                    ))}
                  </Select>
                  <Input
                    type="text"
                    placeholder="Título (opcional — usa o nome do arquivo)"
                    value={row.title}
                    onChange={(e) => updateRow(index, { title: e.target.value })}
                  />
                  <label className="flex items-center gap-2 px-3 py-2.5 border border-border rounded-lg text-xs bg-card cursor-pointer hover:bg-muted max-w-[200px]">
                    <Upload className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{row.file ? row.file.name : 'Escolher arquivo'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.odt,.ods,.zip,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => updateRow(index, { file: e.target.files?.[0] || null })}
                    />
                  </label>
                  <IconButton type="button" tone="delete" title="Remover linha" onClick={() => removeRow(index)}>
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                </div>
              ))}
            </div>
          )}

          <button type="button" onClick={() => addRow()} className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-navy/50 hover:text-navy transition-colors">
            <Plus className="w-4 h-4" /> Adicionar arquivo
          </button>

          {licitacao?.file_url && (
            <p className="text-xs text-muted-foreground">
              PDF antigo (campo único):{' '}
              <a href={licitacao.file_url} target="_blank" rel="noopener noreferrer" className="text-navy underline">ver arquivo</a>
              {' '}— continua visível no site como "Edital (PDF)".
            </p>
          )}
        </Card>

        <Button type="submit" loading={submitting}>
          {!submitting && <Save className="w-4 h-4" />}
          {submitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>

      <ConfirmDelete
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        deleteUrl={(id) => `/painel/licitacoes/documentos/${id}`}
        entity="documento"
      />
    </AdminLayout>
  )
}
