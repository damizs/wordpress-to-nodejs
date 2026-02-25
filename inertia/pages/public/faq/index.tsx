import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import { PageTitle } from '~/components/PageTitle'
import SeoHead from '~/components/SeoHead'
import { HelpCircle, ChevronDown, ChevronRight, MessageCircle, FileText } from 'lucide-react'
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
    <>
      <SeoHead
        title="Perguntas Frequentes - Câmara Municipal de Sumé"
        description="Tire suas dúvidas sobre a Câmara Municipal de Sumé. Perguntas frequentes sobre legislação, transparência e serviços."
        url="/faq"
      />
      <div className="min-h-screen bg-background" style={{ fontFamily: "Verdana, Geneva, Tahoma, sans-serif" }}>
        <TopBar />
        <Header />

        <main>
          <Breadcrumb items={[{ label: 'Perguntas Frequentes' }]} />
          <PageTitle title="PERGUNTAS FREQUENTES" />

          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
                {/* Main content */}
                <div className="flex-1">
                  {Object.entries(grouped).map(([category, catItems]) => {
                    const catLabel = categories.find((c: any) => c.slug === category)?.name || category
                    return (
                      <div key={category} className="mb-8">
                        <h2 className="font-bold text-foreground mb-4 text-lg flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MessageCircle className="w-4 h-4 text-primary" />
                          </div>
                          {catLabel}
                        </h2>
                        <div className="space-y-3">
                          {(catItems as any[]).map((item: any) => (
                            <div key={item.id} className="card-modern overflow-hidden">
                              <button onClick={() => setOpenId(openId === item.id ? null : item.id)}
                                className="w-full flex items-center justify-between px-6 py-4 text-left">
                                <span className="font-medium text-sm text-foreground">{item.question}</span>
                                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ml-2 ${openId === item.id ? 'rotate-180' : ''}`} />
                              </button>
                              {openId === item.id && (
                                <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line border-t pt-4">
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
                    <div className="card-modern p-12 text-center">
                      <HelpCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">Nenhuma pergunta encontrada.</p>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <aside className="lg:w-72 flex-shrink-0">
                  <div className="card-modern sticky top-4 overflow-hidden">
                    <div className="bg-gradient-hero text-primary-foreground px-5 py-4">
                      <h3 className="font-bold flex items-center gap-2">
                        <HelpCircle className="w-5 h-5" /> Categorias
                      </h3>
                    </div>
                    <nav className="p-3">
                      <button
                        onClick={() => setActiveCategory('')}
                        className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors mb-1 ${
                          !activeCategory ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted'
                        }`}
                      >
                        Todas as categorias
                      </button>
                      {categories.map((c: any) => (
                        <button
                          key={c.slug}
                          onClick={() => setActiveCategory(c.slug)}
                          className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors mb-1 ${
                            activeCategory === c.slug ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </nav>

                    {/* Info box */}
                    <div className="px-5 py-4 border-t border-border">
                      <div className="bg-sky/10 rounded-xl p-4 text-xs text-foreground">
                        <p className="font-semibold mb-1 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-primary" /> Lei de Acesso à Informação
                        </p>
                        <p className="text-muted-foreground">Conforme a LAI (Lei nº 12.527/2011), todo cidadão tem direito ao acesso à informação pública.</p>
                      </div>
                    </div>

                    <div className="px-5 pb-4 space-y-2">
                      <a href="/pesquisa-de-satisfacao" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ChevronRight className="w-3 h-3" /> Pesquisa de Satisfação
                      </a>
                      <a href="/politica-de-privacidade" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ChevronRight className="w-3 h-3" /> Política de Privacidade
                      </a>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}
