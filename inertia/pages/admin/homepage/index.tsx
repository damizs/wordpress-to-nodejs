import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, Monitor, Shield, Users, FileText, Globe, Award, Eye, GripVertical, type LucideIcon } from 'lucide-react'
import { Button, Card, CardHeader, Field, Input, Textarea } from '~/components/admin/ui'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Props {
  settings: Record<string, Record<string, string | null>>
}

function get(settings: Props['settings'], group: string, key: string): string {
  return settings?.[group]?.[key] ?? ''
}

// Seções da home (chave curta usada em section_order + visibilidade section_<key>_visible)
const SECTIONS: { key: string; label: string }[] = [
  { key: 'news', label: 'Notícias' },
  { key: 'quickaccess', label: 'Acesso Rápido' },
  { key: 'esic', label: 'E-SIC' },
  { key: 'transparency', label: 'Transparência' },
  { key: 'vereadores', label: 'Vereadores' },
  { key: 'mesa', label: 'Mesa Diretora (Clássico/Moderno/Compacto)' },
  { key: 'legislativo', label: 'Legislativo em Números' },
  { key: 'diario', label: 'Diário Oficial' },
  { key: 'instagram', label: 'Instagram Feed' },
  { key: 'reels', label: 'Galeria de Vídeos (Reels)' },
  { key: 'conheca', label: 'Conheça Sumé' },
  { key: 'seals', label: 'Selos' },
  { key: 'survey', label: 'Pesquisa de Satisfação' },
]
const SECTION_LABEL: Record<string, string> = Object.fromEntries(SECTIONS.map((s) => [s.key, s.label]))

function SortableSectionRow({
  id,
  label,
  visible,
  onToggle,
}: {
  id: string
  label: string
  visible: boolean
  onToggle: (v: boolean) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        visible ? 'border-navy/40 bg-navy/5' : 'border-border bg-muted'
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reordenar ${label}`}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <label className="flex items-center gap-2 cursor-pointer flex-1">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => onToggle(e.target.checked)}
          className="w-4 h-4 rounded border-border accent-navy"
        />
        <span className="text-sm text-foreground">{label}</span>
      </label>
    </div>
  )
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
    section_mesa_visible: get(settings, 'homepage_sections', 'section_mesa_visible'),
    section_legislativo_visible: get(settings, 'homepage_sections', 'section_legislativo_visible'),
    section_diario_visible: get(settings, 'homepage_sections', 'section_diario_visible'),
    section_instagram_visible: get(settings, 'homepage_sections', 'section_instagram_visible'),
    section_reels_visible: get(settings, 'homepage_sections', 'section_reels_visible'),
    section_conheca_visible: get(settings, 'homepage_sections', 'section_conheca_visible'),
    section_seals_visible: get(settings, 'homepage_sections', 'section_seals_visible'),
    section_survey_visible: get(settings, 'homepage_sections', 'section_survey_visible'),
    // Ordem das seções (drag-and-drop). Default = ordem do catálogo SECTIONS.
    section_order: (() => {
      try {
        const a = JSON.parse(get(settings, 'homepage_sections', 'section_order') || 'null')
        if (Array.isArray(a) && a.length) return a as string[]
      } catch {
        /* ignora */
      }
      return SECTIONS.map((s) => s.key)
    })(),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('/painel/homepage')
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Ordem exibida: chaves salvas válidas + quaisquer seções faltantes ao fim.
  const displayOrder: string[] = [
    ...(data.section_order as string[]).filter((k) => k in SECTION_LABEL),
    ...SECTIONS.map((s) => s.key).filter((k) => !(data.section_order as string[]).includes(k)),
  ]

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (over && active.id !== over.id) {
      const oldI = displayOrder.indexOf(String(active.id))
      const newI = displayOrder.indexOf(String(over.id))
      if (oldI !== -1 && newI !== -1) setData('section_order', arrayMove(displayOrder, oldI, newI))
    }
  }

  return (
    <AdminLayout title="Editor da Homepage">
      <Head title="Homepage - Painel" />

      <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-6">
        {/* Seções da home: arraste para reordenar + ligue/desligue */}
        <Section
          icon={Eye}
          title="Seções da Homepage"
          description="Arraste pela alça para reordenar e use a caixa para mostrar/ocultar cada seção"
        >
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={displayOrder} strategy={verticalListSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {displayOrder.map((key) => (
                  <SortableSectionRow
                    key={key}
                    id={key}
                    label={SECTION_LABEL[key]}
                    visible={data[`section_${key}_visible`] === 'true'}
                    onToggle={(v) => setData(`section_${key}_visible`, v ? 'true' : 'false')}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
