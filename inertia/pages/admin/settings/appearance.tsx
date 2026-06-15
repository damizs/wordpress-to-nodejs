import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  Palette,
  Type,
  MapPin,
  Share2,
  Shield,
  Save,
  Upload,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { useState, useRef } from 'react'
import { Button, Card, CardHeader, Field, Input, Select } from '~/components/admin/ui'
import { CAMPAIGNS, THEME_PRESETS, getCampaign, resolveActiveCampaign } from '~/lib/campaigns'

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
    theme_preset: getVal(appearance, 'theme_preset') || 'navy',
    campaign_mode: getVal(appearance, 'campaign_mode') || 'auto',
    color_navy: getVal(appearance, 'color_navy'),
    color_gold: getVal(appearance, 'color_gold'),
    color_sky: getVal(appearance, 'color_sky'),
    header_title: getVal(appearance, 'header_title'),
    header_subtitle: getVal(appearance, 'header_subtitle'),
    footer_description: getVal(footer, 'footer_description'),
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
    atricon_logo_url: null as File | null,
    news_background_image: null as File | null,
  })

  const logoRef = useRef<HTMLInputElement>(null)
  const faviconRef = useRef<HTMLInputElement>(null)
  const atriconLogoRef = useRef<HTMLInputElement>(null)
  const newsBackgroundRef = useRef<HTMLInputElement>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(getVal(appearance, 'logo_url'))
  const [faviconPreview, setFaviconPreview] = useState<string | null>(getVal(appearance, 'favicon_url'))
  const [atriconLogoPreview, setAtriconLogoPreview] = useState<string | null>(getVal(appearance, 'atricon_logo_url'))
  const [newsBackgroundPreview, setNewsBackgroundPreview] = useState<string | null>(getVal(appearance, 'news_background_image'))

  function handleFileChange(field: 'logo_url' | 'favicon_url' | 'atricon_logo_url' | 'news_background_image', file: File | null) {
    setData(field, file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (field === 'logo_url') setLogoPreview(e.target?.result as string)
        else if (field === 'favicon_url') setFaviconPreview(e.target?.result as string)
        else if (field === 'atricon_logo_url') setAtriconLogoPreview(e.target?.result as string)
        else setNewsBackgroundPreview(e.target?.result as string)
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
        {/* Theme presets & seasonal campaigns */}
        <Section icon={Sparkles} title="Tema & Campanhas">
          <ThemeAndCampaigns
            themePreset={data.theme_preset}
            campaignMode={data.campaign_mode}
            onThemeChange={(v) => setData('theme_preset', v)}
            onCampaignChange={(v) => setData('campaign_mode', v)}
          />
        </Section>

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

          {/* Logo ATRICON (Radar) */}
          <div className="mt-4">
            <Field label="Logo ATRICON (Radar)">
              <p className="text-xs text-muted-foreground mb-3">
                Substitui a medalha de nível no módulo Radar ATRICON. Aceita SVG (transparente) —
                será exibida sobre fundo branco no painel.
              </p>
              <div className="flex items-start gap-4">
                {atriconLogoPreview ? (
                  <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-border bg-white p-3 flex items-center justify-center">
                    <img src={atriconLogoPreview} alt="Logo ATRICON" className="w-full h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setAtriconLogoPreview(null)
                        setData('atricon_logo_url', null)
                      }}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => atriconLogoRef.current?.click()}
                    className="w-28 h-28 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-navy/50 transition-colors text-center px-2"
                  >
                    <Upload className="w-7 h-7 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Clique para enviar</span>
                    <span className="text-[11px] text-muted-foreground/70">PNG, SVG, JPG ou WebP</span>
                  </div>
                )}
                <input
                  ref={atriconLogoRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileChange('atricon_logo_url', e.target.files?.[0] || null)}
                />
              </div>
            </Field>
          </div>

          {/* News Background */}
          <div className="mt-4">
            <Field label="Imagem de Fundo - Seção Notícias">
              <p className="text-xs text-muted-foreground mb-3">Imagem que aparece atrás dos cards de notícias na página inicial</p>
              <div className="flex items-start gap-4">
                {newsBackgroundPreview ? (
                  <div className="relative w-64 h-36 rounded-lg overflow-hidden border border-border">
                    <img src={newsBackgroundPreview} alt="Background" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setNewsBackgroundPreview(null)
                        setData('news_background_image', null)
                      }}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => newsBackgroundRef.current?.click()}
                    className="w-64 h-36 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-navy/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Clique para enviar</span>
                    <span className="text-xs text-muted-foreground/70">JPG, PNG ou WebP</span>
                  </div>
                )}
                <input
                  ref={newsBackgroundRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileChange('news_background_image', e.target.files?.[0] || null)}
                />
              </div>
            </Field>
          </div>
        </Section>

        {/* Footer */}
        <Section icon={MapPin} title="Rodapé">
          <TextField label="Descrição (texto abaixo da logo)" value={data.footer_description} onChange={(v) => setData('footer_description', v)} />
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
          <Button type="submit" loading={processing}>
            {!processing && <Save className="w-4 h-4" />}
            {processing ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}

// ---- Sub-components ----

function ThemeAndCampaigns({
  themePreset,
  campaignMode,
  onThemeChange,
  onCampaignChange,
}: {
  themePreset: string
  campaignMode: string
  onThemeChange: (v: string) => void
  onCampaignChange: (v: string) => void
}) {
  const isForced = campaignMode !== 'auto' && campaignMode !== 'off'
  const [forcedKey, setForcedKey] = useState(isForced ? campaignMode : CAMPAIGNS[0].key)

  const currentMonth = new Date().getMonth() + 1
  const autoCampaign = resolveActiveCampaign('auto', currentMonth)
  const previewCampaign = isForced
    ? getCampaign(campaignMode)
    : campaignMode === 'auto'
      ? autoCampaign
      : null

  return (
    <div className="space-y-6">
      {/* Theme presets */}
      <Field
        label="Tema do site"
        hint="Preset de cores institucional. Em 'Navy (padrão)' valem as cores customizadas abaixo."
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {THEME_PRESETS.map((preset) => {
            const selected = (themePreset || 'navy') === preset.key
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => onThemeChange(preset.key)}
                aria-pressed={selected}
                className={`rounded-lg border p-3 text-left transition-all ${
                  selected
                    ? 'border-navy ring-2 ring-navy/25 bg-navy/5'
                    : 'border-border bg-card hover:border-navy/40'
                }`}
              >
                <div className="flex items-center gap-1 mb-2">
                  <span className="w-6 h-6 rounded-md border border-black/10" style={{ background: preset.navy }} />
                  <span className="w-6 h-6 rounded-md border border-black/10" style={{ background: preset.gold }} />
                  <span className="w-6 h-6 rounded-md border border-black/10" style={{ background: preset.sky }} />
                </div>
                <span className={`block text-xs font-semibold ${selected ? 'text-navy' : 'text-foreground'}`}>
                  {preset.label}
                </span>
              </button>
            )
          })}
        </div>
      </Field>

      {/* Seasonal campaigns */}
      <Field
        label="Campanhas sazonais"
        hint="Campanhas de conscientização (Outubro Rosa, Novembro Azul...) recolorem apenas o cabeçalho, o rodapé e os botões, além de exibir uma faixa com o laço da causa. O restante do site mantém a paleta institucional."
      >
        <div className="space-y-2.5">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="campaign_mode_choice"
              checked={campaignMode === 'auto'}
              onChange={() => onCampaignChange('auto')}
              className="mt-0.5 accent-[hsl(var(--navy))]"
            />
            <span className="text-sm text-foreground">
              <span className="font-semibold">Automático</span>
              <span className="text-muted-foreground"> — ativa sozinha no mês correspondente</span>
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="campaign_mode_choice"
              checked={campaignMode === 'off'}
              onChange={() => onCampaignChange('off')}
              className="mt-0.5 accent-[hsl(var(--navy))]"
            />
            <span className="text-sm text-foreground">
              <span className="font-semibold">Desativado</span>
              <span className="text-muted-foreground"> — nunca exibir campanhas</span>
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="radio"
              name="campaign_mode_choice"
              checked={isForced}
              onChange={() => onCampaignChange(forcedKey)}
              className="mt-0.5 accent-[hsl(var(--navy))]"
            />
            <span className="text-sm text-foreground">
              <span className="font-semibold">Forçar campanha específica</span>
              <span className="text-muted-foreground"> — fica ativa independente do mês</span>
            </span>
          </label>

          {isForced && (
            <div className="pl-6 max-w-xs">
              <Select
                value={campaignMode}
                onChange={(e) => {
                  setForcedKey(e.target.value)
                  onCampaignChange(e.target.value)
                }}
              >
                {CAMPAIGNS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>
      </Field>

      {/* Preview */}
      {campaignMode !== 'off' && (
        previewCampaign ? (
          <div
            className="rounded-lg border border-border p-4 flex items-center gap-4 text-white"
            style={{
              background: `linear-gradient(90deg, ${previewCampaign.colors.navy}, ${previewCampaign.colors.sky})`,
            }}
          >
            <span className="shrink-0 w-10 h-10 rounded-full bg-white/95 shadow flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6">
              {previewCampaign.emblem}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold uppercase tracking-wide">{previewCampaign.label}</p>
              <p className="text-xs opacity-90">{previewCampaign.message}</p>
            </div>
            <div className="ml-auto flex items-center gap-1 shrink-0">
              <span className="w-5 h-5 rounded border border-white/40" style={{ background: previewCampaign.colors.navy }} />
              <span className="w-5 h-5 rounded border border-white/40" style={{ background: previewCampaign.colors.gold }} />
              <span className="w-5 h-5 rounded border border-white/40" style={{ background: previewCampaign.colors.sky }} />
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground rounded-lg border border-dashed border-border px-4 py-3">
            Nenhuma campanha ativa no mês atual — o site segue com o tema selecionado.
          </p>
        )
      )}
    </div>
  )
}

function Section({ icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader icon={icon} title={title} />
      {children}
    </Card>
  )
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <Field label={label}>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </Field>
  )
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 shrink-0 rounded-lg border border-border bg-card cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono"
        />
      </div>
    </Field>
  )
}

function FileField({ label, preview, inputRef, onChange }: {
  label: string
  preview: string | null
  inputRef: React.RefObject<HTMLInputElement | null>
  onChange: (f: File | null) => void
}) {
  return (
    <Field label={label}>
      <div
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-3 px-3 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-navy/30 transition-colors"
      >
        {preview ? (
          <img src={preview} alt={label} className="w-10 h-10 object-contain rounded" />
        ) : (
          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
            <Upload className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        <span className="text-sm text-muted-foreground">Clique para selecionar</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </Field>
  )
}
