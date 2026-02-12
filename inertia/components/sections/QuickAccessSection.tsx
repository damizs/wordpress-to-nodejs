import { FileText, Users, Scale, BookOpen, Shield, Gavel, Building2, Phone, Clock, Landmark } from 'lucide-react'

const iconMap: Record<string, any> = { FileText, Users, Scale, BookOpen, Shield, Gavel, Building2, Phone, Clock, Landmark }
const defaultIcons = ['FileText', 'Users', 'Scale', 'BookOpen', 'Shield', 'Gavel', 'Building2', 'Phone', 'Clock', 'Landmark']
const defaultColors = ['bg-gold-400/10 text-gold-600', 'bg-sky-100 text-sky-600', 'bg-navy-100 text-navy-600', 'bg-gold-100 text-gold-700', 'bg-sky-100 text-sky-700', 'bg-navy-100 text-navy-700']

interface QuickLinkItem { id: number; title: string; url: string; icon: string | null; color: string | null }

export function QuickAccessSection({ quickLinks }: { quickLinks: QuickLinkItem[] }) {
  const items = quickLinks.length ? quickLinks : defaultItems
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-navy-50 to-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-heading font-bold text-navy-900 text-center mb-12">Acesso Rápido</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((item, i) => {
            const IconComp = iconMap[item.icon || defaultIcons[i % defaultIcons.length]] || FileText
            return (
              <a key={item.id || i} href={item.url} className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-navy-100">
                <div className={`p-4 rounded-xl ${item.color || defaultColors[i % defaultColors.length]} group-hover:scale-110 transition-transform`}>
                  <IconComp className="w-7 h-7" />
                </div>
                <span className="text-sm font-medium text-navy-700 text-center leading-tight">{item.title}</span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const defaultItems: QuickLinkItem[] = [
  { id: 1, title: 'Leis Municipais', url: '/leis', icon: 'Scale', color: null },
  { id: 2, title: 'Vereadores', url: '/vereadores', icon: 'Users', color: null },
  { id: 3, title: 'Sessões Plenárias', url: '/sessoes', icon: 'Gavel', color: null },
  { id: 4, title: 'Diário Oficial', url: '/diario-oficial', icon: 'BookOpen', color: null },
  { id: 5, title: 'Transparência', url: '/transparencia', icon: 'Shield', color: null },
  { id: 6, title: 'Licitações', url: '/licitacoes', icon: 'FileText', color: null },
  { id: 7, title: 'Ouvidoria', url: '/ouvidoria', icon: 'Phone', color: null },
  { id: 8, title: 'A Câmara', url: '/a-camara', icon: 'Building2', color: null },
  { id: 9, title: 'Legislaturas', url: '/legislaturas', icon: 'Landmark', color: null },
  { id: 10, title: 'Horário', url: '/horario', icon: 'Clock', color: null },
]
