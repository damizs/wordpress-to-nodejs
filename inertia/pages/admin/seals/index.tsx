import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Edit, Trash2, Award } from 'lucide-react'

interface Seal {
  id: number
  title: string
  description: string | null
  image_url: string | null
  link_url: string | null
  sort_order: number
  is_active: boolean
}

interface Props {
  seals: Seal[]
}

export default function SealsIndex({ seals }: Props) {
  const handleDelete = (id: number, title: string) => {
    if (confirm('Excluir selo "' + title + '"?')) {
      router.delete('/painel/selos/' + id)
    }
  }

  return (
    <AdminLayout title="Selos e Certificações">
      <Head title="Selos - Painel" />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Selos e Certificações</h1>
          <p className="text-gray-500 text-sm mt-1">Gerencie os selos exibidos na homepage</p>
        </div>
        <Link href="/painel/selos/novo" className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-dark">
          <Plus className="w-4 h-4" />
          Novo Selo
        </Link>
      </div>

      {seals.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum selo cadastrado</h3>
          <Link href="/painel/selos/novo" className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg">
            <Plus className="w-4 h-4" /> Adicionar Selo
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagem</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {seals.map((seal) => (
                <tr key={seal.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {seal.image_url ? (
                      <img src={seal.image_url} alt={seal.title} className="w-16 h-16 object-contain rounded" />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <Award className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{seal.title}</p>
                    {seal.description && <p className="text-sm text-gray-500">{seal.description}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={seal.is_active ? "px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700" : "px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600"}>
                      {seal.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={"/painel/selos/" + seal.id + "/editar"} className="p-2 text-gray-500 hover:text-navy hover:bg-gray-100 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(seal.id, seal.title)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
