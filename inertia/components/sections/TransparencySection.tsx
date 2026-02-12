import { Shield, ExternalLink, ChevronRight } from 'lucide-react'

interface TransSection { id: number; title: string; slug: string; description: string | null; links: { id: number; title: string; url: string }[] }

export function TransparencySection({ sections }: { sections: TransSection[] }) {
  const items = sections.length ? sections : defaultSections
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-navy-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-50 text-gold-600 text-sm font-medium mb-4">
            <Shield className="w-4 h-4" /> Portal da Transparência
          </div>
          <h2 className="text-3xl font-heading font-bold text-navy-900">Transparência Pública</h2>
          <p className="text-navy-500 mt-2 max-w-2xl mx-auto">Acesso à informação pública conforme a Lei de Acesso à Informação</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((section) => (
            <div key={section.id} className="bg-white rounded-2xl p-6 shadow-sm border border-navy-100 hover:shadow-md transition-shadow">
              <h3 className="font-heading font-bold text-navy-900 mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.id}>
                    <a href={link.url} className="flex items-center gap-2 text-sm text-navy-600 hover:text-gold-600 transition-colors py-1 group" target="_blank" rel="noopener">
                      <ChevronRight className="w-4 h-4 text-gold-400 group-hover:translate-x-0.5 transition-transform" />
                      {link.title}
                      <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <a href="/transparencia" className="inline-flex items-center gap-2 px-6 py-3 bg-gold-400 text-navy-900 rounded-xl font-medium hover:bg-gold-500 transition-colors">
            Ver Portal Completo <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  )
}

const defaultSections: TransSection[] = [
  { id: 1, title: 'Receitas e Despesas', slug: 'receitas-despesas', description: null, links: [
    { id: 1, title: 'Receitas', url: '#' }, { id: 2, title: 'Despesas', url: '#' }, { id: 3, title: 'Empenhos', url: '#' },
  ]},
  { id: 2, title: 'Licitações e Contratos', slug: 'licitacoes-contratos', description: null, links: [
    { id: 4, title: 'Licitações', url: '#' }, { id: 5, title: 'Contratos', url: '#' }, { id: 6, title: 'Atas', url: '#' },
  ]},
  { id: 3, title: 'Pessoal', slug: 'pessoal', description: null, links: [
    { id: 7, title: 'Servidores', url: '#' }, { id: 8, title: 'Folha de Pagamento', url: '#' }, { id: 9, title: 'Diárias', url: '#' },
  ]},
]
