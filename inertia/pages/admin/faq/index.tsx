import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Pencil, Trash2, HelpCircle } from 'lucide-react'

interface FaqItem {
  id: number
  question: string
  answer: string
  category: string
  display_order: number
  is_active: boolean
}

const categoryLabels: Record<string, string> = {
  'LAI': 'LAI',
  'transparencia': 'Transparência',
  'sessões': 'Sessões',
  'participação': 'Participação',
  'sobre a camara': 'Sobre a Câmara',
}

export default function FaqIndex({ items }: { items: FaqItem[] }) {
  function handleDelete(id: number, question: string) {
    if (confirm(`Excluir "${question.substring(0, 50)}..."?`)) {
      router.delete(`/painel/faq/${id}`)
    }
  }

  // Group by category
  const grouped = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, FaqItem[]>)

  return (
    <AdminLayout title="Perguntas Frequentes">
      <Head title="FAQ - Painel" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{items.length} pergunta(s) em {Object.keys(grouped).length} categoria(s)</p>
        <Link href="/painel/faq/criar"
          className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Nova Pergunta
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma pergunta cadastrada</p>
        </div>
      ) : (
        Object.entries(grouped).map(([category, catItems]) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
              {categoryLabels[category] || category} ({catItems.length})
            </h3>
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
              {catItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/50">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.question}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{item.answer.replace(/<[^>]+>/g, '').substring(0, 100)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!item.is_active && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">Inativo</span>
                    )}
                    <Link href={`/painel/faq/${item.id}/editar`} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleDelete(item.id, item.question)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </AdminLayout>
  )
}
