import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Palette, Type, MapPin, Share2, Shield, Save, Upload } from 'lucide-react'
import { useState, useRef } from 'react'

interface SettingItem {
  key: string
  value: string | null
  type: string
  label: string | null
}

interface Props {
  settings: {
    appearance?: SettingItem[]
    footer?: SettingItem[]
    social?: SettingItem[]
    esic?: SettingItem[]
  }
}

function getVal(items: SettingItem[] | undefined, key: string): string {
  return items?.find((s) => s.key === key)?.value ?? ''
}

export default function Appearance({ settings }: Props) {
  const { appearance, footer, social, esic } = settings

  const { data, setData, post, processing } = useForm<Record<string, any>>({
    color_navy: getVal(appearance, 'color_navy'),
    color_gold: getVal(appearance, 'color_gold'),
    color_sky: getVal(appearance, 'color_sky'),
    header_title: getVal(appearance, 'header_title'),
    header_subtitle: getVal(appearance, 'header_subtitle'),
    footer_address: getVal(footer, 'footer_address'),
    footer_phone: getVal(footer, 'footer_phone'),
    footer_email: getVal(footer, 'footer_email'),
    footer_hours: getVal(footer, 'footer_hours'),
    social_facebook: getVal(social, 'social_facebook'),
    social_instagram: getVal(social, 'social_instagram'),
    social_youtube: getVal(social, 'social_youtube'),
    esic_new_url: getVal(esic, 'esic_new_url'),
    esic_consult_url: getVal(esic, 'esic_consult_url'),
    esic_phone: getVal(esic, 'esic_phone'),
    esic_email: getVal(esic, 'esic_email'),
    logo_url: null as File | null,
    favicon_url: null as File | null,
  })

  const logoRef = useRef<HTMLInputElement>(null)
  const faviconRef = useRef<HTMLInputElement>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(getVal(appearance, 'logo_url'))
  const [faviconPreview, setFaviconPreview] = useState<string | null>(getVal(appearance, 'favicon_url'))

  function handleFileChange(field: 'logo_url' | 'favicon_url', file: File | null) {
    setData(field, file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (field === 'logo_url') setLogoPreview(e.target?.result as string)
        else setFaviconPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('/painel/aparencia', {
      forceFormData: true,
    })
  }

  return (
    <AdminLayout title="Aparência">
      <Head title="Aparência - Painel" />

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Colors */}
        <Section icon={Palette} title="Cores do Site">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ColorField label="Cor Principal (Navy)" value={data.color_navy} onChange={(v) => setData('color_navy', v)} />
            <ColorField label="Cor Destaque (Gold)" value={data.color_gold} onChange={(v) => setData('color_gold', v)} />
            <ColorField label="Cor Secundária (Sky)" value={data.color_sky} onChange={(v) => setData('color_sky', v)} />
          </div>
        </Section>

        {/* Branding */}
        <Section icon={Type} title="Identidade Visual">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Título do Header" value={data.header_title} onChange={(v) => setData('header_title', v)} />
            <TextField label="Subtítulo do Header" value={data.header_subtitle} onChange={(v) => setData('header_subtitle', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <FileField
              label="Logo (PNG)"
              preview={logoPreview}
              inputRef={logoRef}
              onChange={(f) => handleFileChange('logo_url', f)}
            />
            <FileField
              label="Favicon"
              preview={faviconPreview}
              inputRef={faviconRef}
              onChange={(f) => handleFileChange('favicon_url', f)}
            />
          </div>
        </Section>

        {/* Footer */}
        <Section icon={MapPin} title="Rodapé">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Endereço" value={data.footer_address} onChange={(v) => setData('footer_address', v)} />
            <TextField label="Telefone" value={data.footer_phone} onChange={(v) => setData('footer_phone', v)} />
            <TextField label="Email" value={data.footer_email} onChange={(v) => setData('footer_email', v)} />
            <TextField label="Horário" value={data.footer_hours} onChange={(v) => setData('footer_hours', v)} />
          </div>
        </Section>

        {/* Social */}
        <Section icon={Share2} title="Redes Sociais">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextField label="Facebook" value={data.social_facebook} onChange={(v) => setData('social_facebook', v)} placeholder="https://facebook.com/..." />
            <TextField label="Instagram" value={data.social_instagram} onChange={(v) => setData('social_instagram', v)} placeholder="https://instagram.com/..." />
            <TextField label="YouTube" value={data.social_youtube} onChange={(v) => setData('social_youtube', v)} placeholder="https://youtube.com/..." />
          </div>
        </Section>

        {/* E-SIC */}
        <Section icon={Shield} title="E-SIC">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Link Nova Demanda" value={data.esic_new_url} onChange={(v) => setData('esic_new_url', v)} />
            <TextField label="Link Consultar" value={data.esic_consult_url} onChange={(v) => setData('esic_consult_url', v)} />
            <TextField label="Telefone E-SIC" value={data.esic_phone} onChange={(v) => setData('esic_phone', v)} />
            <TextField label="Email E-SIC" value={data.esic_email} onChange={(v) => setData('esic_email', v)} />
          </div>
        </Section>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={processing}
            className="flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors disabled:opacity-50 font-medium"
          >
            <Save className="w-4 h-4" />
            {processing ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}

// ---- Sub-components ----

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-navy" />
        <h2 className="font-semibold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none transition-all"
      />
    </div>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none"
        />
      </div>
    </div>
  )
}

function FileField({ label, preview, inputRef, onChange }: {
  label: string
  preview: string | null
  inputRef: React.RefObject<HTMLInputElement | null>
  onChange: (f: File | null) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-3 px-3 py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-navy/30 transition-colors"
      >
        {preview ? (
          <img src={preview} alt={label} className="w-10 h-10 object-contain rounded" />
        ) : (
          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
            <Upload className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <span className="text-sm text-gray-500">Clique para selecionar</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </div>
  )
}
