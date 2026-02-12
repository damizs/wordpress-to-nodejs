import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Plus, X } from 'lucide-react'
import { useState } from 'react'

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

      <Link href="/painel/comissoes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 mb-2">Dados da Comissão</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nome *</label>
              <input type="text" value={data.name} onChange={(e) => {
                setData('name', e.target.value)
                if (!isEditing) setData('slug', generateSlug(e.target.value))
              }} required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo</label>
              <select value={data.type} onChange={(e) => setData('type', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                <option value="permanente">Permanente</option>
                <option value="temporaria">Temporária</option>
                <option value="especial">Especial</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Legislatura</label>
            <select value={data.legislature_id} onChange={(e) => setData('legislature_id', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
              <option value="">Nenhuma</option>
              {legislatures.map((l: any) => (
                <option key={l.id} value={l.id}>{l.name} ({l.number}ª)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Descrição</label>
            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)}
              rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={data.is_active} onChange={(e) => setData('is_active', e.target.checked)}
              className="rounded border-gray-300 text-navy focus:ring-navy" />
            <span className="text-sm text-gray-600">Ativa</span>
          </label>
        </div>

        {/* Members */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Membros</h2>
            <button type="button" onClick={addMember}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-navy border border-navy/20 rounded-lg hover:bg-navy/5 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </button>
          </div>
          <div className="space-y-3">
            {membersList.map((member, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <select value={member.councilor_id} onChange={(e) => updateMember(idx, 'councilor_id', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                  <option value="">Selecionar vereador...</option>
                  {councilors.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.party || 'S/P'})</option>
                  ))}
                </select>
                <select value={member.role} onChange={(e) => updateMember(idx, 'role', e.target.value)}
                  className="w-40 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                  {roleOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <button type="button" onClick={() => removeMember(idx)} className="p-1.5 text-gray-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {membersList.length === 0 && (
              <p className="text-sm text-gray-400 py-2">Nenhum membro adicionado.</p>
            )}
          </div>
        </div>

        <button type="submit" disabled={processing}
          className="flex items-center gap-2 px-6 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium disabled:opacity-50">
          <Save className="w-4 h-4" />
          {processing ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </AdminLayout>
  )
}
