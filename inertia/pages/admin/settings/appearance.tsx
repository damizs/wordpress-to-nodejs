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
  LayoutGrid,
  LayoutTemplate,
  Newspaper,
  type LucideIcon,
} from 'lucide-react'
import { useState, useRef } from 'react'
import { Button, Card, CardHeader, Field, Input, Select } from '~/components/admin/ui'
import { CAMPAIGNS, THEME_PRESETS, getCampaign, resolveActiveCampaign } from '~/lib/campaigns'
import { LAYOUT_STYLES, type LayoutStyle } from '~/lib/layouts'
import { SITE_TEMPLATES, type SiteTemplate, type SiteTemplateKey } from '~/lib/templates'
import { NEWS_LAYOUTS } from '~/lib/news-layouts'
import { TemplateCustomizeModal } from '~/components/admin/TemplateCustomizeModal'
import {
  getTemplateCustomConfig,
  parseTemplateConfig,
  serializeTemplateConfig,
  type TemplateConfigStore,
  type TemplateCustomConfig,
} from '~/lib/template-config'

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
    layout_style: getVal(appearance, 'layout_style') || 'institucional',
    site_template: getVal(appearance, 'site_template') || 'institucional',
    news_layout: getVal(appearance, 'news_layout') || 'mosaico',
    news_count: getVal(appearance, 'news_count') || '5',
    template_config: getVal(appearance, 'template_config') || '{}',
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
    document_brasao_url: null as File | null,
    favicon_url: null as File | null,
    atricon_logo_url: null as File | null,
    news_background_image: null as File | null,
  })

  const logoRef = useRef<HTMLInputElement>(null)
  const brasaoRef = useRef<HTMLInputElement>(null)
  const faviconRef = useRef<HTMLInputElement>(null)
  const atriconLogoRef = useRef<HTMLInputElement>(null)
  const newsBackgroundRef = useRef<HTMLInputElement>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(getVal(appearance, 'logo_url'))
  const [brasaoPreview, setBrasaoPreview] = useState<string | null>(getVal(appearance, 'document_brasao_url'))
  const [faviconPreview, setFaviconPreview] = useState<string | null>(getVal(appearance, 'favicon_url'))
  const [atriconLogoPreview, setAtriconLogoPreview] = useState<string | null>(getVal(appearance, 'atricon_logo_url'))
  const [newsBackgroundPreview, setNewsBackgroundPreview] = useState<string | null>(getVal(appearance, 'news_background_image'))

  function handleFileChange(field: 'logo_url' | 'document_brasao_url' | 'favicon_url' | 'atricon_logo_url' | 'news_background_image', file: File | null) {
    setData(field, file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (field === 'logo_url') setLogoPreview(e.target?.result as string)
        else if (field === 'document_brasao_url') setBrasaoPreview(e.target?.result as string)
        else if (field === 'favicon_url') setFaviconPreview(e.target?.result as string)
        else if (field === 'atricon_logo_url') setAtriconLogoPreview(e.target?.result as string)
        else setNewsBackgroundPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const [tab, setTab] = useState<string>('tema')
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [customizeTemplate, setCustomizeTemplate] = useState<SiteTemplateKey>(
    (getVal(appearance, 'site_template') || 'institucional') as SiteTemplateKey
  )

  const templateConfigStore = parseTemplateConfig(data.template_config)

  function openTemplateCustomize(key: SiteTemplateKey) {
    setData('site_template', key)
    setCustomizeTemplate(key)
    setCustomizeOpen(true)
  }

  function applyTemplateCustomize(config: TemplateCustomConfig) {
    const store: TemplateConfigStore = { ...parseTemplateConfig(data.template_config) }
    store[customizeTemplate] = config
    setData('template_config', serializeTemplateConfig(store))
    if (config.newsLayout) setData('news_layout', config.newsLayout)
    if (config.newsCount) setData('news_count', String(config.newsCount))
    setCustomizeOpen(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('/painel/aparencia', {
      forceFormData: true,
    })
  }

  const TABS: { key: string; label: string; icon: LucideIcon }[] = [
    { key: 'tema', label: 'Tema & Campanhas', icon: Sparkles },
    { key: 'modelo', label: 'Modelo & Layout', icon: LayoutTemplate },
    { key: 'cores', label: 'Cores', icon: Palette },
    { key: 'identidade', label: 'Identidade', icon: Type },
    { key: 'noticias', label: 'Notícias', icon: Newspaper },
    { key: 'contato', label: 'Rodapé & Contato', icon: MapPin },
  ]

  return (
    <AdminLayout title="Aparência">
      <Head title="Aparência - Painel" />

      <form onSubmit={handleSubmit} className="max-w-4xl">
        {/* Abas de navegação */}
        <div className="sticky top-16 z-20 -mx-4 lg:mx-0 mb-6 bg-background/95 backdrop-blur border-b border-border px-4 lg:px-0 lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
          <div className="flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:rounded-xl lg:bg-muted lg:p-1.5">
            {TABS.map((t) => {
              const active = tab === t.key
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-navy text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted lg:hover:bg-background/70'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          {tab === 'tema' && (
            <Section icon={Sparkles} title="Tema & Campanhas">
              <ThemeAndCampaigns
                themePreset={data.theme_preset}
                campaignMode={data.campaign_mode}
                onThemeChange={(v) => setData('theme_preset', v)}
                onCampaignChange={(v) => setData('campaign_mode', v)}
              />
            </Section>
          )}

          {tab === 'modelo' && (
            <>
              <Section icon={LayoutTemplate} title="Modelo do Site">
                <SiteTemplatePicker
                  value={data.site_template}
                  onSelect={openTemplateCustomize}
                />
                <p className="text-xs text-muted-foreground mt-3">
                  Ao escolher um modelo, abre o painel para reordenar seções, ajustar fundos e
                  configurar notícias. Salve o formulário ao terminar.
                </p>
                <button
                  type="button"
                  onClick={() => openTemplateCustomize(data.site_template as SiteTemplateKey)}
                  className="mt-2 text-sm font-semibold text-navy hover:text-gold transition-colors"
                >
                  Personalizar modelo ativo novamente
                </button>
              </Section>
              <Section icon={LayoutGrid} title="Estilo de Layout">
                <LayoutStylePicker value={data.layout_style} onChange={(v) => setData('layout_style', v)} />
              </Section>
            </>
          )}

          {tab === 'cores' && (
            <Section icon={Palette} title="Cores do Site">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ColorField label="Cor Principal (Navy)" value={data.color_navy} onChange={(v) => setData('color_navy', v)} />
                <ColorField label="Cor Destaque (Gold)" value={data.color_gold} onChange={(v) => setData('color_gold', v)} />
                <ColorField label="Cor Secundária (Sky)" value={data.color_sky} onChange={(v) => setData('color_sky', v)} />
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                As cores customizadas valem quando o tema é "Navy (padrão)". Outros presets na aba Tema sobrescrevem estas cores.
              </p>
            </Section>
          )}

          {tab === 'identidade' && (
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

              <div className="mt-4">
                <FileField
                  label="Brasão (documentos oficiais)"
                  preview={brasaoPreview}
                  inputRef={brasaoRef}
                  onChange={(f) => handleFileChange('document_brasao_url', f)}
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Usado no timbre das matérias (publicações, atas, pautas, atividades). Se vazio, usa a logo do cabeçalho.
                </p>
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
            </Section>
          )}

          {tab === 'noticias' && (
            <Section icon={Newspaper} title="Seção de Notícias">
              <NewsLayoutPicker value={data.news_layout} onChange={(v) => setData('news_layout', v)} />

              <div className="mt-4">
                <Field
                  label="Quantidade de cards na home"
                  hint="Também configurável ao personalizar o modelo (aba Modelo & Layout). Máximo 12."
                >
                  <Select
                    value={data.news_count || '5'}
                    onChange={(e) => setData('news_count', e.target.value)}
                  >
                    {[3, 4, 5, 6, 8, 10, 12].map((n) => (
                      <option key={n} value={String(n)}>
                        {n} cards
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="mt-6">
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
          )}

          {tab === 'contato' && (
            <>
              <Section icon={MapPin} title="Rodapé">
                <TextField label="Descrição (texto abaixo da logo)" value={data.footer_description} onChange={(v) => setData('footer_description', v)} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField label="Endereço" value={data.footer_address} onChange={(v) => setData('footer_address', v)} />
                  <TextField label="Telefone" value={data.footer_phone} onChange={(v) => setData('footer_phone', v)} />
                  <TextField label="Email" value={data.footer_email} onChange={(v) => setData('footer_email', v)} />
                  <TextField label="Horário" value={data.footer_hours} onChange={(v) => setData('footer_hours', v)} />
                </div>
              </Section>

              <Section icon={Share2} title="Redes Sociais">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <TextField label="Facebook" value={data.social_facebook} onChange={(v) => setData('social_facebook', v)} placeholder="https://facebook.com/..." />
                  <TextField label="Instagram" value={data.social_instagram} onChange={(v) => setData('social_instagram', v)} placeholder="https://instagram.com/..." />
                  <TextField label="YouTube" value={data.social_youtube} onChange={(v) => setData('social_youtube', v)} placeholder="https://youtube.com/..." />
                </div>
              </Section>

              <Section icon={Shield} title="E-SIC">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField label="Link Nova Demanda" value={data.esic_new_url} onChange={(v) => setData('esic_new_url', v)} />
                  <TextField label="Link Consultar" value={data.esic_consult_url} onChange={(v) => setData('esic_consult_url', v)} />
                  <TextField label="Telefone E-SIC" value={data.esic_phone} onChange={(v) => setData('esic_phone', v)} />
                  <TextField label="Email E-SIC" value={data.esic_email} onChange={(v) => setData('esic_email', v)} />
                </div>
              </Section>
            </>
          )}
        </div>

        {/* Submit (fixo no rodapé do formulário) */}
        <div className="sticky bottom-0 mt-6 -mx-4 lg:mx-0 flex justify-end gap-3 border-t border-border bg-background/95 backdrop-blur px-4 lg:px-0 py-3 lg:py-4">
          <Button type="submit" loading={processing}>
            {!processing && <Save className="w-4 h-4" />}
            {processing ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </form>

      <TemplateCustomizeModal
        open={customizeOpen}
        templateKey={customizeTemplate}
        config={getTemplateCustomConfig(templateConfigStore, customizeTemplate)}
        onClose={() => setCustomizeOpen(false)}
        onApply={applyTemplateCustomize}
      />
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

// ---- Layout style picker ----

/**
 * Características visuais aproximadas de cada estilo, usadas APENAS no
 * mini-preview do cartão (inline). O efeito real no site vem do CSS
 * `[data-layout="..."]` em app.css.
 */
const LAYOUT_PREVIEW: Record<
  string,
  {
    radius: string
    shadow: string
    headingFont: string
    pill: boolean
    topAccent: boolean
    solidHeader: boolean
  }
> = {
  institucional: {
    radius: '0.75rem',
    shadow: '0 8px 24px -8px rgba(20,27,71,0.18)',
    headingFont: "'Inter', sans-serif",
    pill: false,
    topAccent: false,
    solidHeader: false,
  },
  clean: {
    radius: '0.375rem',
    shadow: '0 1px 3px -1px rgba(20,27,71,0.1)',
    headingFont: "'Inter', sans-serif",
    pill: false,
    topAccent: false,
    solidHeader: true,
  },
  moderno: {
    radius: '1.25rem',
    shadow: '0 16px 36px -12px rgba(20,27,71,0.4)',
    headingFont: "'Inter', sans-serif",
    pill: true,
    topAccent: false,
    solidHeader: false,
  },
  classico: {
    radius: '0.25rem',
    shadow: '0 6px 16px -8px rgba(20,27,71,0.2)',
    headingFont: "Georgia, 'Times New Roman', serif",
    pill: false,
    topAccent: true,
    solidHeader: false,
  },
}

function LayoutStylePreview({ styleKey }: { styleKey: string }) {
  const p = LAYOUT_PREVIEW[styleKey] ?? LAYOUT_PREVIEW.institucional
  return (
    <div
      className="overflow-hidden border border-border bg-white"
      style={{
        borderRadius: p.radius,
        boxShadow: p.shadow,
        borderTop: p.topAccent ? '3px solid #d4a017' : undefined,
      }}
    >
      {/* mini header */}
      <div
        className="h-6"
        style={{
          background: p.solidHeader ? '#141b47' : 'linear-gradient(135deg, #0a3d62, #141b47)',
        }}
      />
      <div className="p-2.5 space-y-1.5">
        <div
          className="text-[11px] leading-tight text-foreground"
          style={{ fontFamily: p.headingFont, fontWeight: 700 }}
        >
          Título de exemplo
        </div>
        <div className="h-1.5 w-full rounded bg-muted" />
        <div className="h-1.5 w-3/4 rounded bg-muted" />
        <span
          className="inline-block mt-1 px-2 py-0.5 text-[9px] font-medium text-white"
          style={{ background: '#141b47', borderRadius: p.pill ? '9999px' : p.radius }}
        >
          Botão
        </span>
      </div>
    </div>
  )
}

function LayoutStylePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field
      label="Estilo de layout"
      hint="Altera a forma (cantos, sombras), a tipografia e a densidade de todo o site. É independente das cores: combina com qualquer tema ou campanha sazonal."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {LAYOUT_STYLES.map((layout: LayoutStyle) => {
          const selected = (value || 'institucional') === layout.key
          return (
            <button
              key={layout.key}
              type="button"
              onClick={() => onChange(layout.key)}
              aria-pressed={selected}
              className={`rounded-lg border p-3 text-left transition-all ${
                selected
                  ? 'border-navy ring-2 ring-navy/25 bg-navy/5'
                  : 'border-border bg-card hover:border-navy/40'
              }`}
            >
              <LayoutStylePreview styleKey={layout.key} />
              <span className={`block mt-2.5 text-sm font-semibold ${selected ? 'text-navy' : 'text-foreground'}`}>
                {layout.label}
              </span>
              <span className="block mt-0.5 text-xs text-muted-foreground leading-snug">
                {layout.description}
              </span>
            </button>
          )
        })}
      </div>
    </Field>
  )
}

/** Mini-mock do arranjo de cabeçalho de cada modelo, só para orientar a escolha. */
function SiteTemplatePreview({ templateKey }: { templateKey: string }) {
  const bar = 'rounded-sm bg-navy/70'
  const dot = 'rounded-full bg-gold'
  if (templateKey === 'classico') {
    return (
      <div className="aspect-[16/9] rounded-md border border-border bg-muted overflow-hidden flex flex-col">
        <div className="h-2 bg-navy/30" />
        <div className="flex items-center justify-between px-2 py-1.5 bg-card">
          <span className={`${dot} w-3 h-3`} />
          <span className={`${bar} w-8 h-1.5`} />
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-navy/80 mt-auto">
          {[0, 1, 2, 3].map((i) => <span key={i} className="rounded-sm bg-white/70 w-4 h-1" />)}
        </div>
      </div>
    )
  }
  if (templateKey === 'moderno') {
    return (
      <div className="aspect-[16/9] rounded-md border border-border bg-gradient-to-br from-navy/80 to-navy/50 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className={`${dot} w-3 h-3`} />
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => <span key={i} className="rounded-sm bg-white/70 w-3 h-1" />)}
            <span className="rounded-sm bg-gold w-2 h-2 ml-0.5" />
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-1">
          <span className="rounded-sm bg-white/80 w-16 h-1.5" />
          <span className="rounded-sm bg-white/50 w-10 h-1" />
        </div>
      </div>
    )
  }
  if (templateKey === 'compacto') {
    return (
      <div className="aspect-[16/9] rounded-md border border-border bg-muted overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-2 py-1 bg-navy/80">
          <span className={`${dot} w-2.5 h-2.5`} />
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((i) => <span key={i} className="rounded-sm bg-white/70 w-3 h-1" />)}
          </div>
          <span className="rounded-full bg-white/50 w-2 h-2" />
        </div>
        <div className="flex-1 grid grid-cols-3 gap-1 p-1.5">
          {[0, 1, 2].map((i) => <span key={i} className="rounded-sm bg-card" />)}
        </div>
      </div>
    )
  }
  // institucional (padrão)
  return (
    <div className="aspect-[16/9] rounded-md border border-border bg-gradient-to-b from-navy/80 to-navy/55 overflow-hidden flex flex-col items-center justify-center gap-1.5 py-2">
      <span className={`${dot} w-4 h-4`} />
      <span className="rounded-sm bg-white/80 w-14 h-1.5" />
      <div className="flex items-center gap-1 mt-0.5 rounded-full bg-white/15 px-1.5 py-1">
        {[0, 1, 2, 3].map((i) => <span key={i} className="rounded-sm bg-white/80 w-3 h-1" />)}
      </div>
    </div>
  )
}

function SiteTemplatePicker({
  value,
  onSelect,
}: {
  value: string
  onSelect: (key: SiteTemplateKey) => void
}) {
  return (
    <Field
      label="Modelo do site"
      hint="Muda a ESTRUTURA do front: arranjo do cabeçalho (logo/menu/busca) e a abertura da home. Clique em um modelo para personalizar blocos e cores."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {SITE_TEMPLATES.map((tpl: SiteTemplate) => {
          const selected = (value || 'institucional') === tpl.key
          return (
            <button
              key={tpl.key}
              type="button"
              onClick={() => onSelect(tpl.key as SiteTemplateKey)}
              aria-pressed={selected}
              className={`rounded-lg border p-3 text-left transition-all ${
                selected
                  ? 'border-navy ring-2 ring-navy/25 bg-navy/5'
                  : 'border-border bg-card hover:border-navy/40'
              }`}
            >
              <SiteTemplatePreview templateKey={tpl.key} />
              <span className={`block mt-2.5 text-sm font-semibold ${selected ? 'text-navy' : 'text-foreground'}`}>
                {tpl.label}
              </span>
              <span className="block mt-0.5 text-xs text-muted-foreground leading-snug">
                {tpl.description}
              </span>
            </button>
          )
        })}
      </div>
    </Field>
  )
}

/** Mini-mock do arranjo de cada modelo de card de notícia. */
function NewsLayoutPreview({ layoutKey }: { layoutKey: string }) {
  const box = 'rounded-sm bg-white/80'
  const wrap = 'aspect-[16/9] rounded-md bg-gradient-to-br from-navy to-navy/70 overflow-hidden p-2 flex'
  if (layoutKey === 'grade') {
    return (
      <div className={`${wrap} grid grid-cols-3 gap-1.5`}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`${box} w-full h-full`} />
        ))}
      </div>
    )
  }
  if (layoutKey === 'lista') {
    return (
      <div className={`${wrap} flex-col gap-1.5`}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-1.5 flex-1">
            <span className={`${box} h-full aspect-square`} />
            <div className="flex-1 space-y-1">
              <span className="block h-1.5 w-3/4 rounded bg-white/70" />
              <span className="block h-1 w-1/2 rounded bg-white/40" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  if (layoutKey === 'destaque') {
    return (
      <div className={`${wrap} gap-1.5`}>
        <span className={`${box} w-3/5 h-full`} />
        <div className="flex-1 flex flex-col gap-1.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <span className={`${box} h-full aspect-square`} />
              <span className="flex-1 h-1.5 rounded bg-white/60" />
            </div>
          ))}
        </div>
      </div>
    )
  }
  // mosaico
  return (
    <div className={`${wrap} gap-1.5`}>
      <span className={`${box} w-1/2 h-full`} />
      <div className="grid grid-cols-2 grid-rows-2 gap-1.5 w-1/2">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`${box} w-full h-full`} />
        ))}
      </div>
    </div>
  )
}

function NewsLayoutPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Field
      label="Modelo dos cards"
      hint="Como as notícias aparecem na página inicial. Independente do tema e do modelo do site."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {NEWS_LAYOUTS.map((nl) => {
          const selected = (value || 'mosaico') === nl.key
          return (
            <button
              key={nl.key}
              type="button"
              onClick={() => onChange(nl.key)}
              aria-pressed={selected}
              className={`rounded-lg border p-3 text-left transition-all ${
                selected ? 'border-navy ring-2 ring-navy/25 bg-navy/5' : 'border-border bg-card hover:border-navy/40'
              }`}
            >
              <NewsLayoutPreview layoutKey={nl.key} />
              <span className={`block mt-2.5 text-sm font-semibold ${selected ? 'text-navy' : 'text-foreground'}`}>
                {nl.label}
              </span>
              <span className="block mt-0.5 text-xs text-muted-foreground leading-snug">{nl.description}</span>
            </button>
          )
        })}
      </div>
    </Field>
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
