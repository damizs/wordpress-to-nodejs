import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { ArrowLeft, Save, Upload, Award } from 'lucide-react'
import { useRef, useState } from 'react'
import {
  Button,
  ButtonLink,
  Card,
  CardHeader,
  Field,
  FormSection,
  Input,
  PageHeader,
  Select,
  Textarea,
} from '~/components/admin/ui'

interface Seal {
  id: number
  title: string
  description: string | null
  image_url: string | null
  link_url: string | null
  sort_order: number
  is_active: boolean
}

interface Props {
  seal: Seal | null
}

export default function SealForm({ seal }: Props) {
  const isEditing = !!seal
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(seal?.image_url || null)

  const { data, setData, post, processing } = useForm({
    title: seal?.title || '',
    description: seal?.description || '',
    link_url: seal?.link_url || '',
    sort_order: seal?.sort_order || 0,
    is_active: seal?.is_active === false ? 'false' : 'true',
    image: null as File | null,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setData('image', file)
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const url = isEditing ? '/painel/selos/' + seal.id : '/painel/selos'
    post(url, { forceFormData: true })
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Selo' : 'Novo Selo'}>
      <Head title={(isEditing ? 'Editar' : 'Novo') + ' Selo - Painel'} />

      <PageHeader
        title={isEditing ? 'Editar Selo' : 'Novo Selo'}
        eyebrow="Selos e Certificações"
        icon={Award}
        actions={
          <ButtonLink href="/painel/selos" variant="secondary" size="sm">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </ButtonLink>
        }
      />

      <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-6">
        <FormSection title="Dados do selo" icon={Award} columns={2}>
          <Field label="Título" required className="md:col-span-2">
            <Input
              type="text"
              value={data.title}
              onChange={(e) => setData('title', e.target.value)}
              placeholder="Ex: Qualidade em Transparência"
              required
            />
          </Field>

          <Field label="Descrição" className="md:col-span-2">
            <Textarea
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              rows={3}
              placeholder="Ex: Selo concedido pela Atricon"
            />
          </Field>

          <Field label="Link (opcional)" className="md:col-span-2">
            <Input
              type="url"
              value={data.link_url}
              onChange={(e) => setData('link_url', e.target.value)}
              placeholder="https://..."
            />
          </Field>

          <Field label="Ordem">
            <Input
              type="number"
              value={data.sort_order}
              onChange={(e) => setData('sort_order', Number(e.target.value))}
            />
          </Field>

          <Field label="Status">
            <Select
              value={data.is_active}
              onChange={(e) => setData('is_active', e.target.value)}
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </Select>
          </Field>
        </FormSection>

        <Card>
          <CardHeader title="Imagem do Selo" description="PNG, JPG ou SVG (max 2MB)" icon={Upload} />
          <div className="flex items-start gap-4">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-contain rounded-lg border border-border bg-muted/40"
              />
            ) : (
              <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-col gap-2 justify-center">
              <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
                Selecionar Imagem
              </Button>
              {preview && (
                <p className="text-xs text-muted-foreground">Clique para trocar a imagem</p>
              )}
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </Card>

        <div className="flex justify-end gap-3">
          <ButtonLink href="/painel/selos" variant="secondary">
            Cancelar
          </ButtonLink>
          <Button type="submit" loading={processing}>
            <Save className="w-4 h-4" />
            {processing ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
