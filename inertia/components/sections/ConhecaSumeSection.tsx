import { MapPin } from 'lucide-react'

export function ConhecaSumeSection() {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-navy-50 to-white">
      <div className="container mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-50 text-gold-600 text-sm font-medium mb-4">
          <MapPin className="w-4 h-4" /> Conheça Sumé
        </div>
        <h2 className="text-3xl font-heading font-bold text-navy-900 mb-4">Conheça nossa cidade</h2>
        <p className="text-navy-500 max-w-2xl mx-auto mb-8">
          Sumé, no Cariri paraibano, é conhecida por sua rica história, cultura vibrante e paisagens deslumbrantes do semiárido nordestino.
        </p>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { title: 'História', desc: 'Fundada em 1951, Sumé carrega uma história rica.' },
            { title: 'Cultura', desc: 'Festas juninas, artesanato e tradições culturais.' },
            { title: 'Turismo', desc: 'Açude de Sumé, Serra do Boqueirão e mais.' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-navy-100">
              <h3 className="font-heading font-bold text-navy-900 mb-2">{item.title}</h3>
              <p className="text-navy-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
