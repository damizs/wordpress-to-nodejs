import { Head } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { HelpCircle, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface Props { items: any[]; categories: any[] }

export default function FaqIndex({ items, categories }: Props) {
  const [openId, setOpenId] = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState('')

  const filtered = activeCategory ? items.filter((i: any) => i.category === activeCategory) : items
  const grouped = filtered.reduce((acc: Record<string, any[]>, item: any) => {
    const cat = item.category || 'Geral'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  return (
    <PublicLayout>
      <Head title="Perguntas Frequentes - Câmara de Sumé" />
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <HelpCircle className="w-12 h-12 mx-auto text-navy mb-3" />
            <h1 className="text-3xl font-bold text-gray-900">Perguntas Frequentes</h1>
            <p className="text-gray-500 mt-2">Tire suas dúvidas sobre a Câmara Municipal</p>
          </div>

          <div className="flex gap-2 mb-8 flex-wrap justify-center">
            <button onClick={() => setActiveCategory('')}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${!activeCategory ? 'bg-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              Todas
            </button>
            {categories.map((c: any) => (
              <button key={c.slug} onClick={() => setActiveCategory(c.slug)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${activeCategory === c.slug ? 'bg-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                {c.name}
              </button>
            ))}
          </div>

          {Object.entries(grouped).map(([category, catItems]) => {
            const catLabel = categories.find((c: any) => c.slug === category)?.name || category
            return (
              <div key={category} className="mb-8">
                <h2 className="font-semibold text-gray-700 mb-3 text-lg">{catLabel}</h2>
                <div className="space-y-2">
                  {(catItems as any[]).map((item: any) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <button onClick={() => setOpenId(openId === item.id ? null : item.id)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left">
                        <span className="font-medium text-sm text-gray-800">{item.question}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openId === item.id ? 'rotate-180' : ''}`} />
                      </button>
                      {openId === item.id && (
                        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed whitespace-pre-line border-t border-gray-50 pt-3">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && <p className="text-center text-gray-400 py-12">Nenhuma pergunta encontrada.</p>}
        </div>
      </section>
    </PublicLayout>
  )
}
