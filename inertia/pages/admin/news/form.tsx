import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Upload, Image, X, Newspaper, Eye } from 'lucide-react'
import { useState, useRef } from 'react'
import {
  Button,
  ButtonLink,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  Textarea,
} from '~/components/admin/ui'
import RichTextEditor from '~/components/admin/RichTextEditor'
import { useUnsavedChanges } from '~/hooks/use_unsaved_changes'

interface NewsItem {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  status: string
  cover_image_url: string | null
  category_id: number | null
  published_at: string | null
}

interface Props {
  news: NewsItem | null
  categories: Array<{ id: number; name: string; slug: string }>
}

export default function NewsForm({ news: existing, categories }: Props) {
  const isEditing = !!existing

  // Format date for datetime-local input
  const formatDateForInput = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toISOString().slice(0, 16)
  }

  const { data, setData, processing } = useForm({
    title: existing?.title || '',
    excerpt: existing?.excerpt || '',
    content: existing?.content || '',
    status: existing?.status || 'draft',
    category_id: existing?.category_id?.toString() || '',
    published_at: formatDateForInput(existing?.published_at),
    cover_image: null as File | null,
  })

  const [coverPreview, setCoverPreview] = useState<string | null>(existing?.cover_image_url || null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Alterações não salvas: campos (sem o arquivo) + imagem de capa selecionada.
  const snapshot = () => JSON.stringify({ ...data, cover_image: null })
  const initialSnapshot = useRef(snapshot())
  const dirty = (snapshot() !== initialSnapshot.current || data.cover_image !== null) && !processing
  useUnsavedChanges(dirty)

  function handleCoverChange(file: File | null) {
    setData('cover_image', file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setCoverPreview(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('excerpt', data.excerpt)
    formData.append('content', data.content)
    formData.append('status', data.status)
    formData.append('category_id', data.category_id)
    formData.append('published_at', data.published_at)
    if (data.cover_image) {
      formData.append('cover_image', data.cover_image)
    }

    if (isEditing) {
      // Method spoofing do AdonisJS lê `_method` da QUERY STRING (antes do
      // bodyparser) — `_method` no corpo do FormData NÃO funciona e cai como
      // POST /painel/noticias/:id (rota inexistente) → 404. Padrão dos demais forms.
      router.post(`/painel/noticias/${existing!.id}?_method=PUT`, formData, {
        forceFormData: true,
      })
    } else {
      router.post('/painel/noticias', formData, {
        forceFormData: true,
      })
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Notícia' : 'Nova Notícia'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Notícia - Painel`} />

      <div className="w-full min-w-0 space-y-6">
        <PageHeader
          eyebrow="Conteúdo"
          icon={Newspaper}
          title={isEditing ? 'Editar Notícia' : 'Nova Notícia'}
          description={isEditing ? `Editando: ${existing?.title}` : 'Preencha os dados para criar uma nova notícia'}
          actions={
            <>
              <ButtonLink href="/painel/noticias" variant="secondary">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </ButtonLink>
              {isEditing && existing?.slug && (
                <ButtonLink
                  href={`/noticias/${existing.slug}`}
                  target="_blank"
                  variant="secondary"
                >
                  <Eye className="w-4 h-4" />
                  Pré-visualizar
                </ButtonLink>
              )}
              <Button type="submit" form="news-form" loading={processing}>
                {!processing && <Save className="w-4 h-4" />}
                {processing ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar Notícia'}
              </Button>
            </>
          }
        />

        <form id="news-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Layout estilo editor: conteúdo à esquerda, meta numa
              barra lateral sticky à direita (empilha no mobile/tablet). */}
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
            {/* Coluna principal — conteúdo */}
            <div className="space-y-6 min-w-0">
              <Card className="space-y-5">
                <Field label="Título" required>
                  <Input
                    type="text"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="Título da notícia"
                    required
                  />
                </Field>

                <Field label="Resumo">
                  <Textarea
                    value={data.excerpt}
                    onChange={(e) => setData('excerpt', e.target.value)}
                    rows={2}
                    className="resize-none min-h-0"
                    placeholder="Resumo curto da notícia (aparece na listagem)"
                  />
                </Field>

                <Field label="Conteúdo" hint="Editor visual — formatação, links e imagens (upload pela biblioteca de mídia).">
                  <RichTextEditor
                    value={data.content}
                    onChange={(html) => setData('content', html)}
                    minHeight={420}
                  />
                </Field>
              </Card>
            </div>

            {/* Barra lateral de meta (sticky) */}
            <aside className="space-y-6 min-w-0 xl:sticky xl:top-20">
              {/* Imagem de capa */}
              <Card>
                <Field label="Imagem de Capa">
                  {coverPreview ? (
                    <div className="relative rounded-lg overflow-hidden mb-3 mt-1.5">
                      <img src={coverPreview} alt="Preview" className="w-full h-40 object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverPreview(null)
                          setData('cover_image', null)
                        }}
                        className="absolute top-2 right-2 p-1 bg-navy-dark/50 rounded-full text-white hover:bg-navy-dark/70 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-navy/30 transition-colors mb-3 mt-1.5"
                    >
                      <Image className="w-8 h-8 text-muted-foreground/50 mb-2" />
                      <span className="text-sm text-muted-foreground">Clique para enviar</span>
                      <span className="text-xs text-muted-foreground/60 mt-1">JPG, PNG ou WebP até 5MB</span>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => handleCoverChange(e.target.files?.[0] || null)}
                  />
                  {!coverPreview && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" />
                      Selecionar imagem
                    </Button>
                  )}
                </Field>
              </Card>

              {/* Status, categoria e data num único card */}
              <Card className="space-y-5">
                <Field label="Status">
                  <Select value={data.status} onChange={(e) => setData('status', e.target.value)}>
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicada</option>
                    <option value="archived">Arquivada</option>
                  </Select>
                </Field>

                <Field label="Categoria">
                  <Select
                    value={data.category_id}
                    onChange={(e) => setData('category_id', e.target.value)}
                  >
                    <option value="">Sem categoria</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Data de Publicação"
                  hint="Deixe em branco para usar a data atual ao publicar"
                >
                  <Input
                    type="datetime-local"
                    value={data.published_at}
                    onChange={(e) => setData('published_at', e.target.value)}
                  />
                </Field>
              </Card>
            </aside>
          </div>

          {/* Barra de ações sticky no rodapé — sempre acessível em forms longos
              (antes ficava só no fim, obrigando a rolar tudo). */}
          <div className="sticky bottom-4 z-20 flex flex-col sm:flex-row items-center justify-end gap-3 rounded-xl border border-border bg-card/95 backdrop-blur shadow-lg px-4 py-3">
            <ButtonLink href="/painel/noticias" variant="secondary" className="w-full sm:w-auto">
              Cancelar
            </ButtonLink>
            <Button type="submit" loading={processing} className="w-full sm:w-auto">
              {!processing && <Save className="w-4 h-4" />}
              {processing ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar Notícia'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
