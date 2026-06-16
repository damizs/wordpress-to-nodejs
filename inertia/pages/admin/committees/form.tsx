import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Plus, X, Landmark, Users } from 'lucide-react'
import { useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  Field,
  IconButton,
  Input,
  Select,
  Textarea,
} from '~/components/admin/ui'

interface Props {
  committee: any | null
  members: any[]
  legislatures: any[]
  councilors: any[]
}

const roleOptions = ['Presidente', 'Vice-Presidente', 'Relator', 'Membro']

export default function CommitteeForm({ committee, members: initialMembers, legislatures, councilors }: Props) {
  const isEditing = !!committee
  const [membersList, setMembersList] = useState<any[]>(
    initialMembers.map((m: any) => ({ councilor_id: String(m.councilor_id), role: m.role, councilor_name: m.councilor_name }))
  )

  const { data, setData, post, processing } = useForm({
    name: committee?.name || '',
    slug: committee?.slug || '',
    description: committee?.description || '',
    type: committee?.type || 'permanente',
    legislature_id: committee?.legislature_id || '',
    is_active: committee?.is_active ?? true,
    members_json: JSON.stringify(initialMembers.map((m: any) => ({ councilor_id: m.councilor_id, role: m.role }))),
  })

  function generateSlug(name: string) {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  function addMember() {
    const updated = [...membersList, { councilor_id: '', role: 'Membro', councilor_name: '' }]
    setMembersList(updated)
    setData('members_json', JSON.stringify(updated.filter((m) => m.councilor_id)))
  }

  function removeMember(idx: number) {
    const updated = membersList.filter((_, i) => i !== idx)
    setMembersList(updated)
    setData('members_json', JSON.stringify(updated.filter((m) => m.councilor_id)))
  }

  function updateMember(idx: number, field: string, value: string) {
    const updated = [...membersList]
    updated[idx] = { ...updated[idx], [field]: value }
    if (field === 'councilor_id') {
      updated[idx].councilor_name = councilors.find((c: any) => String(c.id) === value)?.name || ''
    }
    setMembersList(updated)
    setData('members_json', JSON.stringify(updated.filter((m) => m.councilor_id)))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      post(`/painel/comissoes/${committee.id}?_method=PUT`, { forceFormData: true })
    } else {
      post('/painel/comissoes', { forceFormData: true })
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Comissão' : 'Nova Comissão'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Comissão - Painel`} />

      <Link
        href="/painel/comissoes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="admin-form admin-form-narrow">
        <Card>
          <CardHeader title="Dados da Comissão" icon={Landmark} />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nome" required>
                <Input
                  type="text"
                  value={data.name}
                  onChange={(e) => {
                    setData('name', e.target.value)
                    if (!isEditing) setData('slug', generateSlug(e.target.value))
                  }}
                  required
                />
              </Field>
              <Field label="Tipo">
                <Select value={data.type} onChange={(e) => setData('type', e.target.value)}>
                  <option value="permanente">Permanente</option>
                  <option value="temporaria">Temporária</option>
                  <option value="especial">Especial</option>
                </Select>
              </Field>
            </div>
            <Field label="Legislatura">
              <Select
                value={data.legislature_id}
                onChange={(e) => setData('legislature_id', e.target.value)}
              >
                <option value="">Nenhuma</option>
                {legislatures.map((l: any) => (
                  <option key={l.id} value={l.id}>{l.name} ({l.number}ª)</option>
                ))}
              </Select>
            </Field>
            <Field label="Descrição">
              <Textarea
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                rows={3}
              />
            </Field>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.is_active}
                onChange={(e) => setData('is_active', e.target.checked)}
                className="rounded border-border text-navy focus:ring-navy"
              />
              <span className="text-sm text-muted-foreground">Ativa</span>
            </label>
          </div>
        </Card>

        {/* Members */}
        <Card>
          <CardHeader
            title="Membros"
            icon={Users}
            actions={
              <Button type="button" variant="secondary" size="sm" onClick={addMember}>
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </Button>
            }
          />
          <div className="space-y-3">
            {membersList.map((member, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <Select
                  value={member.councilor_id}
                  onChange={(e) => updateMember(idx, 'councilor_id', e.target.value)}
                  className="flex-1"
                >
                  <option value="">Selecionar vereador...</option>
                  {councilors.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.party || 'S/P'})</option>
                  ))}
                </Select>
                <Select
                  value={member.role}
                  onChange={(e) => updateMember(idx, 'role', e.target.value)}
                  className="w-40"
                >
                  {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                </Select>
                <IconButton type="button" tone="delete" onClick={() => removeMember(idx)} title="Remover">
                  <X className="w-4 h-4" />
                </IconButton>
              </div>
            ))}
            {membersList.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">Nenhum membro adicionado.</p>
            )}
          </div>
        </Card>

        <Button type="submit" loading={processing}>
          <Save className="w-4 h-4" />
          {processing ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </AdminLayout>
  )
}
