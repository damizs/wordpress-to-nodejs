import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Upload, BookOpen, Eye } from 'lucide-react'
import { useRef } from 'react'
import { Button, ButtonLink, Field, Input, Select, PageHeader, FormSection, FormGrid } from '~/components/admin/ui'
import RichTextEditor from '~/components/admin/RichTextEditor'

interface Props {
  publication: any | null
  types: any[]
}

export default function PublicationForm({ publication, types = [] }: Props) {
  const isEditing = !!publication
  const fileRef = useRef<HTMLInputElement>(null)

  const { data, setData, post, processing } = useForm({
    title: publication?.title || '',
    type: publication?.type || (types[0]?.slug || ''),
    number: publication?.number || '',
    publication_date: publication?.publication_date || '',
    description: publication?.description || '',
    file: null as File | null,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      post(`/painel/publicacoes/${publication.id}?_method=PUT`, { forceFormData: true })
    } else {
      post('/painel/publicacoes', { forceFormData: true })
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Publicação' : 'Nova Publicação'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Publicação - Painel`} />
      <form onSubmit={handleSubmit}>
        <PageHeader
          title={isEditing ? 'Editar Publicação' : 'Nova Publicação'}
          description={
            isEditing
              ? `Editando: ${publication?.title}`
              : 'Cadastre uma nova publicação oficial no portal.'
          }
          icon={BookOpen}
          eyebrow="Publicações Oficiais"
          actions={
            <>
              {isEditing && publication?.slug && (
                <ButtonLink
                  href={`/publicacoes-oficiais/${publication.slug}`}
                  target="_blank"
                  variant="secondary"
                  size="sm"
                >
                  <Eye className="w-4 h-4" /> Pré-visualizar
                </ButtonLink>
              )}
              <Link
                href="/painel/publicacoes"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Link>
            </>
          }
        />

        <div className="space-y-5">
          <FormSection
            title="Identificação"
            description="Tipo, número e data de publicação."
          >
            <FormGrid cols={3}>
              <Field label="Tipo" required>
                <Select value={data.type} onChange={(e) => setData('type', e.target.value)} required>
                  {types.map((t: any) => (
                    <option key={t.slug} value={t.slug}>{t.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Número">
                <Input
                  type="text"
                  value={data.number}
                  onChange={(e) => setData('number', e.target.value)}
                />
              </Field>
              <Field label="Data de publicação" required>
                <Input
                  type="date"
                  value={data.publication_date}
                  onChange={(e) => setData('publication_date', e.target.value)}
                  required
                />
              </Field>
            </FormGrid>
          </FormSection>

          <FormSection
            title="Conteúdo"
            description="Título e descrição/ementa da publicação."
          >
            <Field label="Título" required>
              <Input
                type="text"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                required
              />
            </Field>
            <Field
              label="Descrição / ementa"
              hint="Editor visual — texto que aparece na página pública da publicação."
            >
              <RichTextEditor
                value={data.description}
                onChange={(html) => setData('description', html)}
                minHeight={280}
              />
            </Field>
          </FormSection>

          <FormSection
            title="Documento"
            description="Arquivo PDF vinculado à publicação."
          >
            <Field label="Arquivo PDF">
              <div>
                {publication?.file_url && (
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Atual:{' '}
                    <a href={publication.file_url} target="_blank" className="text-navy underline">
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
