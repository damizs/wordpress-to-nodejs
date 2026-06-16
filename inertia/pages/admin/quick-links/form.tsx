import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft } from 'lucide-react'
import { Button, Card, Field, Input, Select } from '~/components/admin/ui'

const ICONS = [
  'Scale', 'Users', 'Play', 'BookOpen', 'Shield', 'FileText', 'Phone', 'Building2',
  'Gavel', 'ScrollText', 'MessageCircle', 'Eye', 'Calendar', 'UserCheck', 'Search',
  'Download', 'ExternalLink', 'Globe', 'Mail', 'MapPin',
]

// Valores = chaves entendidas pelo colorMap público (mapeadas para a paleta
// institucional navy/gold/sky/emerald). Os rótulos indicam a cor escolhida.
const COLORS = [
  { label: 'Navy (principal)', value: 'navy' },
  { label: 'Azul claro', value: 'blue' },
  { label: 'Dourado', value: 'gold' },
  { label: 'Sky (secundária)', value: 'sky' },
  { label: 'Verde', value: 'emerald' },
]

export default function QuickLinkForm({ link }: { link: any | null }) {
  const isEditing = !!link
  const { data, setData, post, put, processing } = useForm({
    title: link?.title || '',
    url: link?.url || '',
    icon: link?.icon || 'Scale',
    color: link?.color || 'navy',
    display_order: link?.display_order || 0,
    is_active: link?.is_active ?? true,
    open_mode: link?.open_mode || 'nova_aba',
    hide_chrome: link?.hide_chrome ?? true,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      put(`/painel/links-rapidos/${link.id}`)
    } else {
      post('/painel/links-rapidos')
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Link' : 'Novo Link'}>
      <Head title={`${isEditing ? 'Editar' : 'Novo'} Link Rápido - Painel`} />

      <Link
        href="/painel/links-rapidos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="admin-form admin-form-narrow">
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Título" required>
              <Input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
            </Field>
            <Field label="URL" required>
              <Input
                type="text"
                value={data.url}
                onChange={(e) => setData('url', e.target.value)}
                required
                placeholder="/vereadores ou https://..."
              />
            </Field>
            <Field label="Ícone">
              <Select value={data.icon} onChange={(e) => setData('icon', e.target.value)}>
                {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
              </Select>
            </Field>
            <Field label="Cor do Gradiente">
              <Select value={data.color} onChange={(e) => setData('color', e.target.value)}>
                {COLORS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </Field>
            <Field label="Ordem">
              <Input
                type="number"
                value={data.display_order}
                onChange={(e) => setData('display_order', parseInt(e.target.value) || 0)}
              />
            </Field>
            <Field label="Abertura do link" hint="No modal, o visitante também pode abrir em outra aba">
              <Select value={data.open_mode} onChange={(e) => setData('open_mode', e.target.value)}>
                <option value="nova_aba">Nova aba</option>
                <option value="modal">Modal popup</option>
              </Select>
            </Field>
            {data.open_mode === 'modal' && (
              <div className="flex items-end">
                <div className="flex items-center gap-2 pb-2">
                  <input
                    type="checkbox"
                    id="hide_chrome"
                    checked={data.hide_chrome === true || data.hide_chrome === 'true'}
                    onChange={(e) => setData('hide_chrome', e.target.checked)}
                    className="w-4 h-4 rounded border-border text-navy"
                  />
                  <label htmlFor="hide_chrome" className="text-sm text-muted-foreground">
                    Ocultar cabeçalho e rodapé (links do portal)
                  </label>
                </div>
              </div>
            )}
            <div className="flex items-end">
              <div className="flex items-center gap-2 pb-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={data.is_active === true || data.is_active === 'true'}
                  onChange={(e) => setData('is_active', e.target.checked)}
                  className="w-4 h-4 rounded border-border text-navy"
                />
                <label htmlFor="is_active" className="text-sm text-muted-foreground">Ativo</label>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={processing}>
            <Save className="w-4 h-4" />
            {processing ? 'Salvando...' : isEditing ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
