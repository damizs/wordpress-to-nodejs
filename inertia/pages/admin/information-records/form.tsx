import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Upload } from 'lucide-react'
import { useRef } from 'react'
import { Button, Card, Field, Input, Select, Textarea } from '~/components/admin/ui'

interface Props {
  record: any | null
  categories: any[]
}

export default function InformationRecordForm({ record, categories = [] }: Props) {
  const isEditing = !!record
  const fileRef = useRef<HTMLInputElement>(null)

  const { data, setData, post, processing } = useForm({
    title: record?.title || '',
    category: record?.category || (categories[0]?.slug || ''),
    year: record?.year || new Date().getFullYear(),
    content: record?.content || '',
    reference_date: record?.reference_date || '',
    is_active: record?.is_active ?? true,
    open_mode: record?.open_mode || 'nova_aba',
    hide_chrome: record?.hide_chrome ?? true,
    file: null as File | null,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      post(`/painel/acesso-informacao/${record.id}?_method=PUT`, { forceFormData: true })
    } else {
      post('/painel/acesso-informacao', { forceFormData: true })
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Registro' : 'Novo Registro'}>
      <Head title={`${isEditing ? 'Editar' : 'Novo'} Registro - Painel`} />
      <Link href="/painel/acesso-informacao" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <form onSubmit={handleSubmit} className="admin-form">
        <Card className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Categoria" required>
              <Select value={data.category} onChange={(e) => setData('category', e.target.value)} required>
                {categories.map((c: any) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Ano" required>
              <Input type="number" value={data.year} onChange={(e) => setData('year', parseInt(e.target.value) || 0)} required />
            </Field>
          </div>
          <Field label="Título" required>
            <Input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
          </Field>
          <Field label="Conteúdo / Descrição">
            <Textarea value={data.content} onChange={(e) => setData('content', e.target.value)} rows={4} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Data de Referência">
              <Input type="date" value={data.reference_date} onChange={(e) => setData('reference_date', e.target.value)} />
            </Field>
            <Field label="Abertura do link" hint="Como o arquivo abre no site público">
              <Select value={data.open_mode} onChange={(e) => setData('open_mode', e.target.value)}>
                <option value="nova_aba">Nova aba</option>
                <option value="modal">Modal popup</option>
              </Select>
            </Field>
            {data.open_mode === 'modal' && (
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={data.hide_chrome === true} onChange={(e) => setData('hide_chrome', e.target.checked)}
                    className="rounded border-border text-navy" />
                  <span className="text-sm text-muted-foreground">Ocultar cabeçalho e rodapé (links do portal)</span>
                </label>
              </div>
            )}
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)}
                  className="rounded border-border text-navy" />
                <span className="text-sm text-muted-foreground">Ativo</span>
              </label>
            </div>
          </div>
          <Field label="Arquivo PDF">
            <div>
              {record?.file_url && (
                <p className="text-xs text-muted-foreground mb-1.5">
                  Arquivo atual: <a href={record.file_url} target="_blank" className="text-navy underline">Ver PDF</a>
                </p>
              )}
              <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
                <Upload className="w-4 h-4" /> {data.file ? data.file.name : 'Selecionar PDF'}
              </Button>
              <input ref={fileRef} type="file" accept=".pdf" onChange={(e) => setData('file', e.target.files?.[0] || null)} className="hidden" />
            </div>
          </Field>
        </Card>
        <Button type="submit" loading={processing}>
          {!processing && <Save className="w-4 h-4" />}
          {processing ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </AdminLayout>
  )
}
