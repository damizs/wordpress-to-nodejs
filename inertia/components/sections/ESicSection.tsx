import { MessageSquare, Phone, Mail, Clock, MapPin } from 'lucide-react'

export function ESicSection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 text-sky-600 text-sm font-medium mb-4">
              <MessageSquare className="w-4 h-4" /> E-SIC
            </div>
            <h2 className="text-3xl font-heading font-bold text-navy-900 mb-4">Serviço de Informação ao Cidadão</h2>
            <p className="text-navy-600 mb-6">Solicite informações públicas ou registre sua manifestação. Garantimos transparência e acesso à informação conforme a Lei nº 12.527/2011.</p>
            <div className="flex flex-wrap gap-3">
              <a href="/esic" className="px-6 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors">Fazer Solicitação</a>
              <a href="/ouvidoria" className="px-6 py-3 bg-navy-100 text-navy-700 rounded-xl font-medium hover:bg-navy-200 transition-colors">Ouvidoria</a>
            </div>
          </div>
          <div className="bg-navy-50 rounded-2xl p-8 space-y-4">
            <h3 className="font-heading font-bold text-navy-900 text-lg mb-4">Contato</h3>
            {[
              { icon: Phone, label: '(83) 3353-1191' },
              { icon: Mail, label: 'contato@camaradesume.pb.gov.br' },
              { icon: MapPin, label: 'Rua Antônio Ramalho, S/N, Centro, Sumé - PB' },
              { icon: Clock, label: 'Seg a Sex, 08h às 14h' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-navy-600">
                <item.icon className="w-5 h-5 text-sky-500 shrink-0" />
                <span className="text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
