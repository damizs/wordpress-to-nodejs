import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CircleDashed,
  ExternalLink,
  FileText,
  FolderOpen,
  Info,
  Link2,
  Paperclip,
  Save,
  Upload,
} from 'lucide-react'
import { useRef } from 'react'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  FormGrid,
  Input,
  PageHeader,
  Select,
} from '~/components/admin/ui'
import RichTextEditor from '~/components/admin/RichTextEditor'

interface Props {
  record: any | null
  categories: any[]
  defaultCategory?: string | null
}

function fileNameFromUrl(url?: string | null) {
  if (!url) return null
  try {
    const pathname = url.startsWith('/') ? url : new URL(url).pathname
    return pathname.split('/').filter(Boolean).pop() || url
  } catch {
    return url.split('/').filter(Boolean).pop() || url
  }
}

export default function InformationRecordForm({ record, categories = [], defaultCategory }: Props) {
  const isEditing = !!record
  const fileRef = useRef<HTMLInputElement>(null)
  const backCategory = record?.category || defaultCategory || ''
  const backUrl = backCategory
    ? `/painel/acesso-informacao?category=${encodeURIComponent(backCategory)}`
    : '/painel/acesso-informacao'

  const { data, setData, post, processing } = useForm({
    title: record?.title || '',
    category: record?.category || defaultCategory || categories[0]?.slug || '',
    year: record?.year || new Date().getFullYear(),
    content: record?.content || '',
    reference_date: record?.reference_date || '',
    file_url: record?.file_url || '',
    is_active: record?.is_active ?? true,
    open_mode: record?.open_mode || 'nova_aba',
    hide_chrome: record?.hide_chrome ?? true,
    file: null as File | null,
  })

  const selectedCategory = categories.find((category: any) => category.slug === data.category)
  const currentFileName = fileNameFromUrl(data.file_url)

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
          description="Cadastre documentos PNTP/LAI por categoria, ano, descrição e anexo."
          icon={FolderOpen}
          eyebrow="Acesso à Informação"
          actions={
            <Link
              href={backUrl}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Link>
          }
        />

        <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-sky/30 bg-sky/10 p-3 text-sm text-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky" aria-hidden="true" />
          <p>
            <strong>Acesso à Informação (LAI/PNTP)</strong> organiza documentos próprios
            por categoria e ano. Links de sistemas externos continuam no módulo{' '}
            <strong>Transparência</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-5">
            <Card>
              <CardHeader
                title="Dados do Registro"
                description="Classifique o documento na seção PNTP correta e informe o exercício."
                icon={FileText}
              />
              <div className="space-y-5">
                <Field label="Título" required>
                  <Input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder={`${selectedCategory?.name || 'Registro'} - ${data.year || new Date().getFullYear()}`}
                    required
                  />
                </Field>

                <FormGrid cols={3}>
                  <Field label="Categoria" required>
                    <Select
                      value={data.category}
                      onChange={(e) => setData('category', e.target.value)}
                      required
                    >
                      {categories.map((category: any) => (
                        <option key={category.slug} value={category.slug}>
                          {category.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Ano" required hint="Exercício do documento">
                    <Input
                      type="number"
                      min="1900"
                      max="2200"
                      value={data.year}
                      onChange={(e) => setData('year', parseInt(e.target.value) || 0)}
                      required
                    />
                  </Field>
                  <Field label="Data de referência" hint="Opcional">
                    <Input
                      type="date"
                      value={data.reference_date}
                      onChange={(e) => setData('reference_date', e.target.value)}
                    />
                  </Field>
                </FormGrid>
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Descrição / Observações"
                description="Texto complementar que aparece junto do registro quando não houver apenas PDF."
                icon={FileText}
              />
              <Field label="Conteúdo">
                <RichTextEditor
                  value={data.content || ''}
                  onChange={(html) => setData('content', html)}
                  minHeight={280}
                />
              </Field>
            </Card>

            <Card>
              <CardHeader
                title="Documento"
                description="Envie o PDF pelo painel ou informe uma URL segura como fallback."
                icon={Paperclip}
              />
              <div className="space-y-5">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">Upload do PDF</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        O arquivo enviado substitui a URL abaixo ao salvar.
                      </p>
                      {currentFileName && !data.file && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Paperclip className="h-3.5 w-3.5" />
                          Atual:{' '}
                          <a
                            href={data.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate text-navy underline dark:text-sky"
                          >
                            {currentFileName}
                          </a>
                        </p>
                      )}
                    </div>
                    <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
                      <Upload className="h-4 w-4" />
                      {data.file ? data.file.name : 'Selecionar PDF'}
                    </Button>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setData('file', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </div>

                <Field
                  label="URL do documento/link"
                  hint="Opcional. Use quando o PDF estiver em sistema externo; deixe vazio para remover o link."
                >
                  <Input
                    type="text"
                    value={data.file_url}
                    onChange={(e) => setData('file_url', e.target.value)}
                    placeholder="https://... ou /uploads/..."
                  />
                </Field>
              </div>
            </Card>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
            <Card>
              <CardHeader title="Publicação" icon={CheckCircle2} />
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={data.is_active ? 'success' : 'neutral'}>
                    {data.is_active ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" /> Visível
                      </>
                    ) : (
                      <>
                        <CircleDashed className="h-3 w-3" /> Rascunho
                      </>
                    )}
                  </Badge>
                  <Badge tone="navy">
                    <Calendar className="h-3 w-3" />
                    {data.year || new Date().getFullYear()}
                  </Badge>
                </div>

                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={data.is_active}
                    onChange={(e) => setData('is_active', e.target.checked)}
                    className="rounded border-border text-navy"
                  />
                  Visível no portal
                </label>

                <Field label="Abertura no site">
                  <Select value={data.open_mode} onChange={(e) => setData('open_mode', e.target.value)}>
                    <option value="nova_aba">Nova aba</option>
                    <option value="modal">Modal popup</option>
                  </Select>
                </Field>

                {data.open_mode === 'modal' && (
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={data.hide_chrome === true}
                      onChange={(e) => setData('hide_chrome', e.target.checked)}
                      className="rounded border-border text-navy"
                    />
                    Ocultar cabeçalho e rodapé em links internos
                  </label>
                )}

                {data.file_url && (
                  <a
                    href={data.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground no-underline transition-colors hover:border-navy/40 hover:text-navy dark:hover:text-navy-light"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir documento atual
                  </a>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="Salvar" icon={Save} />
              <div className="space-y-3">
                <Button type="submit" loading={processing} className="w-full">
                  {!processing && <Save className="h-4 w-4" />}
                  {processing ? 'Salvando...' : 'Salvar registro'}
                </Button>
                <Link
                  href={backUrl}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground no-underline transition-colors hover:bg-muted"
                >
                  Cancelar
                </Link>
              </div>
            </Card>

            <Card>
              <CardHeader title="Resumo" icon={Link2} />
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">Categoria</dt>
                  <dd className="mt-1 text-foreground">{selectedCategory?.name || 'Não selecionada'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-muted-foreground">Documento</dt>
                  <dd className="mt-1 text-foreground">
                    {data.file ? data.file.name : currentFileName || 'Sem arquivo/link'}
                  </dd>
                </div>
              </dl>
            </Card>
          </aside>
        </div>
      </form>
    </AdminLayout>
  )
}
