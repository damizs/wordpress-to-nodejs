import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Image, Trash2, Save, Plus } from 'lucide-react'
import { useState, useRef } from 'react'
import { Button, Card, CardHeader, PageHeader } from '~/components/admin/ui'

interface Props {
  images: string[]
}

export default function CityImages({ images }: Props) {
  const [currentImages, setCurrentImages] = useState<string[]>(images || [])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setNewFiles(prev => [...prev, ...files])

    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setPreviews(prev => [...prev, ev.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeExisting = (index: number) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeNew = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setSaving(true)

    const formData = new FormData()
    formData.append('existing_images', JSON.stringify(currentImages))
    newFiles.forEach((file) => {
      formData.append('city_images', file)
    })
    formData.append('keep_existing_city_images', 'true')

    try {
      const response = await fetch('/painel/configuracoes/fotos-cidade', {
        method: 'POST',
        body: formData,
        headers: {
          'X-XSRF-TOKEN': document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''
        }
      })

      if (response.ok) {
        router.reload()
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="Fotos da Cidade">
      <Head title="Fotos da Cidade - Painel" />

      <PageHeader
        title="Fotos da Cidade"
        description='Adicione fotos de Sumé que aparecerão no carrossel da seção "Conheça Nossa Cidade".'
        icon={Image}
        eyebrow="Site"
        actions={
          <Button
            type="button"
            onClick={handleSave}
            loading={saving}
            disabled={saving || (currentImages.length === images.length && newFiles.length === 0)}
          >
            {!saving && <Save className="w-4 h-4" />}
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        }
      />

      <div className="w-full min-w-0">
        <Card>
          <CardHeader
            icon={Image}
            title="Galeria de imagens"
            description="Adicione, remova ou substitua as fotos do carrossel."
          />

          {currentImages.length === 0 && previews.length === 0 && (
            <div className="mb-6 rounded-xl border border-dashed border-border py-14 text-center">
              <Image className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma foto cadastrada. Clique em "Adicionar Fotos" para começar.</p>
            </div>
          )}

          {currentImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Imagens atuais ({currentImages.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {currentImages.map((img, index) => (
                  <div key={index} className="relative group aspect-video">
                    <img src={img} alt={`Cidade ${index + 1}`} className="w-full h-full object-cover rounded-lg border border-border" />
                    <button
                      type="button"
                      onClick={() => removeExisting(index)}
                      className="absolute top-1.5 right-1.5 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {previews.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Novas imagens a adicionar ({previews.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group aspect-video">
                    <img src={preview} alt={`Nova ${index + 1}`} className="w-full h-full object-cover rounded-lg border-2 border-gold" />
                    <button
                      type="button"
                      onClick={() => removeNew(index)}
                      className="absolute top-1.5 right-1.5 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-border rounded-lg hover:border-navy/50 hover:bg-navy/5 transition-colors"
            >
              <Plus className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Adicionar Fotos</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
