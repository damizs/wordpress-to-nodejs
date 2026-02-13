import { Head } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { PageHero } from '~/components/PageHero'
import { HelpCircle, ChevronDown, ChevronRight, MessageCircle } from 'lucide-react'
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
      <PageHero title="Perguntas Frequentes" subtitle="Tire suas dúvidas sobre a Câmara Municipal de Sumé" icon={<HelpCircle className="w-8 h-8" />}
        breadcrumbs={[{ label: 'Perguntas Frequentes' }]} />

      <section className="py-10 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="flex-1">
              {Object.entries(grouped).map(([category, catItems]) => {
                const catLabel = categories.find((c: any) => c.slug === category)?.name || category
                return (
                  <div key={category} className="mb-8">
                    <h2 className="font-bold text-gray-800 mb-3 text-lg flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-navy" />
                      {catLabel}
                    </h2>
                    <div className="space-y-2">
                      {(catItems as any[]).map((item: any) => (
                        <div key={item.id} className="bg-white rounded-lg border hover:border-navy/30 transition-colors overflow-hidden">
                          <button onClick={() => setOpenId(openId === item.id ? null : item.id)}
                            className="w-full flex items-center justify-between px-5 py-4 text-left">
                            <span className="font-medium text-sm text-gray-800">{item.question}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${openId === item.id ? 'rotate-180' : ''}`} />
                          </button>
                          {openId === item.id && (
                            <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed whitespace-pre-line border-t pt-3">
                              {item.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {filtered.length === 0 && (
                <div className="bg-white rounded-lg border p-12 text-center">
                  <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhuma pergunta encontrada.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-lg border sticky top-4">
                <div className="bg-navy text-white px-5 py-4 rounded-t-lg">
                  <h3 className="font-bold flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" /> Categorias
                  </h3>
                </div>
                <nav className="p-3">
                  <button
                    onClick={() => setActiveCategory('')}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5 ${
                      !activeCategory ? 'bg-navy/10 text-navy font-semibold border-l-4 border-navy pl-2' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Todas as categorias
                  </button>
                  {categories.map((c: any) => (
                    <button
                      key={c.slug}
                      onClick={() => setActiveCategory(c.slug)}
                      className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5 ${
                        activeCategory === c.slug ? 'bg-navy/10 text-navy font-semibold border-l-4 border-navy pl-2' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </nav>

                {/* Info box */}
                <div className="px-5 py-4 border-t">
                  <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
                    <p className="font-semibold mb-1">📋 Lei de Acesso à Informação</p>
                    <p>Conforme a LAI (Lei nº 12.527/2011), todo cidadão tem direito ao acesso à informação pública.</p>
                  </div>
                </div>

                <div className="px-5 pb-4 space-y-2">
                  <a href="/pesquisa-de-satisfacao" className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy transition-colors">
                    <ChevronRight className="w-3 h-3" /> Pesquisa de Satisfação
                  </a>
                  <a href="/politica-de-privacidade" className="flex items-center gap-2 text-sm text-gray-600 hover:text-navy transition-colors">
                    <ChevronRight className="w-3 h-3" /> Política de Privacidade
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
