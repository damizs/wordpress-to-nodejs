import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Upload, FolderOpen, Info } from 'lucide-react'
import { useRef } from 'react'
import { Button, Field, Input, Select, PageHeader, FormSection } from '~/components/admin/ui'
import RichTextEditor from '~/components/admin/RichTextEditor'

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
      <form onSubmit={handleSubmit}>
        <PageHeader
          title={isEditing ? 'Editar Registro' : 'Novo Registro'}
          description="Acesso à Informação — gerencie PDFs, links e conteúdos das páginas de transparência."
          icon={FolderOpen}
          eyebrow="Acesso à Informação"
          actions={
            <Link
              href="/painel/acesso-informacao"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
          }
        />

        <div className="flex items-start gap-2.5 mb-5 rounded-lg border border-sky/30 bg-sky/10 p-3 text-sm text-foreground">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-sky" aria-hidden="true" />
          <p>
            <strong>Acesso à Informação (LAI/PNTP)</strong> = documentos internos organizados
            por categoria e ano. Aparecem nas páginas <strong>/:categoria</strong> do site. Para
            links de sistemas externos, use o módulo <strong>Transparência</strong>.
          </p>
        </div>

        <div className="space-y-5">
          <FormSection
            title="Classificação"
            description="Categoria e ano de referência do registro."
            columns={2}
          >
            <Field label="Categoria" required>
              <Select
                value={data.category}
                onChange={(e) => setData('category', e.target.value)}
                required
              >
                {categories.map((c: any) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Ano" required>
              <Input
                type="number"
                value={data.year}
                onChange={(e) => setData('year', parseInt(e.target.value) || 0)}
                required
              />
            </Field>
          </FormSection>

          <FormSection
            title="Conteúdo"
            description="Título e corpo do registro de transparência."
          >
            <Field label="Título" required>
              <Input
                type="text"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                required
              />
            </Field>
            <Field label="Conteúdo / Descrição">
              <RichTextEditor
                value={data.content || ''}
                onChange={(html) => setData('content', html)}
                minHeight={260}
              />
            </Field>
          </FormSection>

          <FormSection
            title="Configurações"
            description="Data de referência e modo de abertura do link no portal público."
            columns={2}
          >
            <Field label="Data de Referência">
              <Input
                type="date"
                value={data.reference_date}
                onChange={(e) => setData('reference_date', e.target.value)}
              />
            </Field>
            <Field label="Abertura do link" hint="Como o arquivo abre no site público">
              <Select value={data.open_mode} onChange={(e) => setData('open_mode', e.target.value)}>
                <option value="nova_aba">Nova aba</option>
                <option value="modal">Modal popup</option>
              </Select>
            </Field>
            {data.open_mode === 'modal' && (
              <div className="flex items-center pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.hide_chrome === true}
                    onChange={(e) => setData('hide_chrome', e.target.checked)}
                    className="rounded border-border text-navy"
                  />
                  <span className="text-sm text-muted-foreground">
                    Ocultar cabeçalho e rodapé (links do portal)
                  </span>
                </label>
              </div>
            )}
            <div className="flex items-center pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.is_active}
                  onChange={(e) => setData('is_active', e.target.checked)}
                  className="rounded border-border text-navy"
                />
                <span className="text-sm text-muted-foreground">Ativo</span>
              </label>
            </div>
          </FormSection>

          <FormSection
            title="Documento"
            description="Arquivo PDF vinculado ao registro de transparência."
          >
            <Field label="Arquivo PDF">
              <div>
                {record?.file_url && (
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Arquivo atual:{' '}
                    <a href={record.file_url} target="_blank" className="text-navy underline">
                      Ver PDF
                    </a>
                  </p>
                )}
                <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
                  <Upload className="w-4 h-4" /> {data.file ? data.file.name : 'Selecionar PDF'}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setData('file', e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>
            </Field>
          </FormSection>
        </div>

        <div className="flex justify-end mt-5">
          <Button type="submit" loading={processing}>
            {!processing && <Save className="w-4 h-4" />}
            {processing ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
