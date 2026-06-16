import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, Monitor, Shield, Users, FileText, Globe, Award, Eye, type LucideIcon } from 'lucide-react'
import { Button, Card, CardHeader, Field, Input, Textarea } from '~/components/admin/ui'

interface Props {
  settings: Record<string, Record<string, string | null>>
}

function get(settings: Props['settings'], group: string, key: string): string {
  return settings?.[group]?.[key] ?? ''
}

export default function HomepageEditor({ settings }: Props) {
  const { data, setData, post, processing } = useForm<Record<string, any>>({
    // Hero
    homepage_hero_title: get(settings, 'homepage_hero', 'homepage_hero_title'),
    homepage_hero_subtitle: get(settings, 'homepage_hero', 'homepage_hero_subtitle'),
    // Quick Access
    homepage_quickaccess_title: get(settings, 'homepage_quickaccess', 'homepage_quickaccess_title'),
    homepage_quickaccess_subtitle: get(settings, 'homepage_quickaccess', 'homepage_quickaccess_subtitle'),
    homepage_quickaccess_badge: get(settings, 'homepage_quickaccess', 'homepage_quickaccess_badge'),
    // E-SIC
    homepage_esic_title: get(settings, 'homepage_esic', 'homepage_esic_title'),
    homepage_esic_subtitle: get(settings, 'homepage_esic', 'homepage_esic_subtitle'),
    homepage_esic_address: get(settings, 'homepage_esic', 'homepage_esic_address'),
    homepage_esic_hours: get(settings, 'homepage_esic', 'homepage_esic_hours'),
    homepage_esic_phone: get(settings, 'homepage_esic', 'homepage_esic_phone'),
    homepage_esic_email: get(settings, 'homepage_esic', 'homepage_esic_email'),
    // Vereadores
    homepage_vereadores_title: get(settings, 'homepage_vereadores', 'homepage_vereadores_title'),
    homepage_vereadores_subtitle: get(settings, 'homepage_vereadores', 'homepage_vereadores_subtitle'),
    homepage_vereadores_badge: get(settings, 'homepage_vereadores', 'homepage_vereadores_badge'),
    // Transparency
    homepage_transparency_title: get(settings, 'homepage_transparency', 'homepage_transparency_title'),
    homepage_transparency_subtitle: get(settings, 'homepage_transparency', 'homepage_transparency_subtitle'),
    // Diário
    homepage_diario_title: get(settings, 'homepage_diario', 'homepage_diario_title'),
    homepage_diario_subtitle: get(settings, 'homepage_diario', 'homepage_diario_subtitle'),
    // Conheça Sumé
    homepage_conheca_title: get(settings, 'homepage_conheca', 'homepage_conheca_title'),
    homepage_conheca_subtitle: get(settings, 'homepage_conheca', 'homepage_conheca_subtitle'),
    // Seals
    homepage_seals_title: get(settings, 'homepage_seals', 'homepage_seals_title'),
    homepage_seals_subtitle: get(settings, 'homepage_seals', 'homepage_seals_subtitle'),
    // Visibility
    section_news_visible: get(settings, 'homepage_sections', 'section_news_visible'),
    section_quickaccess_visible: get(settings, 'homepage_sections', 'section_quickaccess_visible'),
    section_esic_visible: get(settings, 'homepage_sections', 'section_esic_visible'),
    section_transparency_visible: get(settings, 'homepage_sections', 'section_transparency_visible'),
    section_vereadores_visible: get(settings, 'homepage_sections', 'section_vereadores_visible'),
    section_legislativo_visible: get(settings, 'homepage_sections', 'section_legislativo_visible'),
    section_diario_visible: get(settings, 'homepage_sections', 'section_diario_visible'),
    section_instagram_visible: get(settings, 'homepage_sections', 'section_instagram_visible'),
    section_conheca_visible: get(settings, 'homepage_sections', 'section_conheca_visible'),
    section_seals_visible: get(settings, 'homepage_sections', 'section_seals_visible'),
    section_survey_visible: get(settings, 'homepage_sections', 'section_survey_visible'),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('/painel/homepage')
  }

  const visibilityItems = [
    { key: 'section_news_visible', label: 'Notícias' },
    { key: 'section_quickaccess_visible', label: 'Acesso Rápido' },
    { key: 'section_esic_visible', label: 'E-SIC' },
    { key: 'section_transparency_visible', label: 'Transparência' },
    { key: 'section_vereadores_visible', label: 'Vereadores' },
    { key: 'section_legislativo_visible', label: 'Legislativo em Números' },
    { key: 'section_diario_visible', label: 'Diário Oficial' },
    { key: 'section_instagram_visible', label: 'Instagram Feed' },
    { key: 'section_conheca_visible', label: 'Conheça Sumé' },
    { key: 'section_seals_visible', label: 'Selos' },
    { key: 'section_survey_visible', label: 'Pesquisa de Satisfação' },
  ]

  return (
    <AdminLayout title="Editor da Homepage">
      <Head title="Homepage - Painel" />

      <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-6">
        {/* Section Visibility */}
        <Section icon={Eye} title="Visibilidade das Seções" description="Ative/desative seções na homepage">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {visibilityItems.map((item) => (
              <label key={item.key} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                data[item.key] === 'true' ? 'border-navy/40 bg-navy/5' : 'border-border bg-muted'
              }`}>
                <input type="checkbox" checked={data[item.key] === 'true'}
                  onChange={(e) => setData(item.key, e.target.checked ? 'true' : 'false')}
                  className="w-4 h-4 rounded border-border accent-navy" />
                <span className="text-sm text-foreground">{item.label}</span>
              </label>
            ))}
          </div>
        </Section>

        {/* Hero */}
        <Section icon={Monitor} title="Banner Principal (Hero)">
          <TextField label="Título" value={data.homepage_hero_title} onChange={(v) => setData('homepage_hero_title', v)} />
          <TextField label="Subtítulo" value={data.homepage_hero_subtitle} onChange={(v) => setData('homepage_hero_subtitle', v)} />
        </Section>

        {/* Quick Access */}
        <Section icon={Globe} title="Seção: Acesso Rápido" description="Os cards de acesso rápido são gerenciados em Links Rápidos">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Badge" value={data.homepage_quickaccess_badge} onChange={(v) => setData('homepage_quickaccess_badge', v)} />
            <TextField label="Título" value={data.homepage_quickaccess_title} onChange={(v) => setData('homepage_quickaccess_title', v)} />
          </div>
          <TextField label="Subtítulo" value={data.homepage_quickaccess_subtitle} onChange={(v) => setData('homepage_quickaccess_subtitle', v)} />
        </Section>

        {/* E-SIC */}
        <Section icon={Shield} title="Seção: E-SIC" description="Links dos botões são configurados em Aparência > E-SIC">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Título" value={data.homepage_esic_title} onChange={(v) => setData('homepage_esic_title', v)} />
            <TextField label="Subtítulo" value={data.homepage_esic_subtitle} onChange={(v) => setData('homepage_esic_subtitle', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextAreaField label="Endereço" value={data.homepage_esic_address} onChange={(v) => setData('homepage_esic_address', v)} rows={3} />
            <TextAreaField label="Horário" value={data.homepage_esic_hours} onChange={(v) => setData('homepage_esic_hours', v)} rows={3} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Telefone" value={data.homepage_esic_phone} onChange={(v) => setData('homepage_esic_phone', v)} />
            <TextField label="Email" value={data.homepage_esic_email} onChange={(v) => setData('homepage_esic_email', v)} />
          </div>
        </Section>

        {/* Vereadores */}
        <Section icon={Users} title="Seção: Vereadores" description="Os vereadores são gerenciados em Vereadores">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField label="Badge da Legislatura" value={data.homepage_vereadores_badge} onChange={(v) => setData('homepage_vereadores_badge', v)} />
            <TextField label="Título" value={data.homepage_vereadores_title} onChange={(v) => setData('homepage_vereadores_title', v)} />
          </div>
          <TextField label="Subtítulo" value={data.homepage_vereadores_subtitle} onChange={(v) => setData('homepage_vereadores_subtitle', v)} />
        </Section>

        {/* Transparency */}
        <Section icon={Shield} title="Seção: Transparência">
          <TextField label="Título" value={data.homepage_transparency_title} onChange={(v) => setData('homepage_transparency_title', v)} />
          <TextField label="Subtítulo" value={data.homepage_transparency_subtitle} onChange={(v) => setData('homepage_transparency_subtitle', v)} />
        </Section>

        {/* Diário */}
        <Section icon={FileText} title="Seção: Diário Oficial">
          <TextField label="Título" value={data.homepage_diario_title} onChange={(v) => setData('homepage_diario_title', v)} />
          <TextField label="Subtítulo" value={data.homepage_diario_subtitle} onChange={(v) => setData('homepage_diario_subtitle', v)} />
        </Section>

        {/* Conheça Sumé */}
        <Section icon={Globe} title="Seção: Conheça Sumé">
          <TextField label="Título" value={data.homepage_conheca_title} onChange={(v) => setData('homepage_conheca_title', v)} />
          <TextField label="Subtítulo" value={data.homepage_conheca_subtitle} onChange={(v) => setData('homepage_conheca_subtitle', v)} />
        </Section>

        {/* Seals */}
        <Section icon={Award} title="Seção: Selos de Transparência">
          <TextField label="Título" value={data.homepage_seals_title} onChange={(v) => setData('homepage_seals_title', v)} />
          <TextField label="Subtítulo" value={data.homepage_seals_subtitle} onChange={(v) => setData('homepage_seals_subtitle', v)} />
        </Section>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <Button type="submit" loading={processing}>
            {!processing && <Save className="w-4 h-4" />}
            {processing ? 'Salvando...' : 'Salvar Todas as Configurações'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}

// Sub-components
function Section({ icon, title, description, children }: { icon: LucideIcon; title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader icon={icon} title={title} description={description} />
      <div className="space-y-4">{children}</div>
    </Card>
  )
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <Field label={label}>
      <Input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </Field>
  )
}

function TextAreaField({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <Field label={label}>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="resize-none" />
    </Field>
  )
}
