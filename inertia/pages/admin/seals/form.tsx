import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { ArrowLeft, Save, Upload, Award } from 'lucide-react'
import { useRef, useState } from 'react'
import {
  Button,
  ButtonLink,
  Card,
  CardHeader,
  Field,
  Input,
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

      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/painel/selos"
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          {isEditing ? 'Editar Selo' : 'Novo Selo'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <Card>
          <CardHeader title="Dados do selo" icon={Award} />
          <div className="space-y-6">
            <Field label="Título" required>
              <Input
                type="text"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                placeholder="Ex: Qualidade em Transparencia"
                required
              />
            </Field>

            <Field label="Descrição">
              <Textarea
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                rows={3}
                placeholder="Ex: Selo concedido pela Atricon"
              />
            </Field>

            <Field label="Imagem do Selo" hint="PNG, JPG ou SVG (max 2MB)">
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
                <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
                  Selecionar Imagem
                </Button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </Field>

            <Field label="Link (opcional)">
              <Input
                type="url"
                value={data.link_url}
                onChange={(e) => setData('link_url', e.target.value)}
                placeholder="https://..."
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
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
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
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
