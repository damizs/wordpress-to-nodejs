import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Image, Trash2, Save, Plus } from 'lucide-react'
import { useState, useRef } from 'react'

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

      <div className="max-w-4xl">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Image className="w-5 h-5 text-navy" />
            <h2 className="font-semibold text-gray-800">Fotos da Cidade (Carrossel)</h2>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            Adicione fotos de Sumé que aparecerão no carrossel da seção "Conheça Nossa Cidade".
          </p>

          {currentImages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Imagens atuais</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img src={img} alt={`Cidade ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeExisting(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {previews.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Novas imagens</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img src={preview} alt={`Nova ${index + 1}`} className="w-full h-32 object-cover rounded-lg border-2 border-green-400" />
                    <button
                      type="button"
                      onClick={() => removeNew(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-navy/50 transition-colors"
            >
              <Plus className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">Adicionar Fotos</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || (currentImages.length === images.length && newFiles.length === 0)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-navy text-white rounded-lg hover:bg-navy-dark transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
