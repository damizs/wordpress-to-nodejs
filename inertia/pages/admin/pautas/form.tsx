import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Upload, FileText, Paperclip } from 'lucide-react'
import { useRef } from 'react'
import { Button, Card, CardHeader, Field, Input, Select } from '~/components/admin/ui'
import RichTextEditor from '~/components/admin/RichTextEditor'

interface Props {
  pauta: any | null
  sessionTypes: any[]
}

export default function PautaForm({ pauta, sessionTypes = [] }: Props) {
  const isEditing = !!pauta
  const { data, setData, post, processing } = useForm({
    title: pauta?.title || '',
    type: pauta?.type || 'ordinaria',
    document_date: pauta?.document_date ? String(pauta.document_date).substring(0, 10) : '',
    year: pauta?.year || new Date().getFullYear().toString(),
    doc_time: pauta?.doc_time || '',
    content: pauta?.content || '',
    is_published: pauta?.is_published ?? true,
    file: null as File | null,
  })

  const fileRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      post(`/painel/pautas/${pauta.id}?_method=PUT`, { forceFormData: true })
    } else {
      post('/painel/pautas', { forceFormData: true })
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Pauta' : 'Nova Pauta'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Pauta - Painel`} />

      <Link
        href="/painel/pautas"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <Card>
          <CardHeader title="Dados da Pauta" icon={FileText} />

          <div className="space-y-4">
            <Field label="Título" required>
              <Input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Tipo de sessão">
                <Select value={data.type} onChange={(e) => setData('type', e.target.value)}>
                  {sessionTypes.length > 0 ? (
                    sessionTypes.map((t: any) => (
                      <option key={t.slug} value={t.slug}>
                        {t.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="ordinaria">Ordinária</option>
                      <option value="extraordinaria">Extraordinária</option>
                      <option value="solene">Solene</option>
                      <option value="especial">Especial</option>
                    </>
                  )}
                </Select>
              </Field>
              <Field label="Data" required>
                <Input
                  type="date"
                  value={data.document_date}
                  onChange={(e) => {
                    setData('document_date', e.target.value)
                    if (e.target.value) setData('year', new Date(e.target.value).getFullYear().toString())
                  }}
                  required
                />
              </Field>
              <Field label="Horário">
                <Input type="time" value={data.doc_time} onChange={(e) => setData('doc_time', e.target.value)} />
              </Field>
            </div>

            <Field label="Conteúdo (ordem do dia)" hint="Editor visual — formatação, links e imagens.">
              <RichTextEditor value={data.content} onChange={(html) => setData('content', html)} minHeight={360} />
            </Field>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={data.is_published}
                onChange={(e) => setData('is_published', e.target.checked)}
                className="rounded border-border"
              />
              Publicada (visível no site)
            </label>
          </div>
        </Card>

        <Card>
          <CardHeader title="Arquivo PDF (opcional, para download)" icon={Paperclip} />
          {pauta?.file_url && (
            <p className="text-sm text-muted-foreground mb-2">
              Arquivo atual:{' '}
              <a href={pauta.file_url} target="_blank" rel="noopener" className="text-navy hover:underline">
                {pauta.file_url.split('/').pop()}
              </a>
            </p>
          )}
          <div className="flex items-center gap-3">
            <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4" /> Selecionar PDF
            </Button>
            <span className="text-sm text-muted-foreground">{data.file?.name || 'Nenhum arquivo selecionado'}</span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            onChange={(e) => setData('file', e.target.files?.[0] || null)}
            className="hidden"
          />
        </Card>

        <Button type="submit" loading={processing}>
          {!processing && <Save className="w-4 h-4" />}
          {processing ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </AdminLayout>
  )
}
