import { Award, Star } from 'lucide-react'

export function TransparencySealSection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <div className="bg-gradient-to-r from-gold-50 to-gold-100 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="shrink-0">
            <div className="w-24 h-24 rounded-full bg-gold-400 flex items-center justify-center shadow-lg">
              <Award className="w-12 h-12 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-heading font-bold text-navy-900 mb-2">Selo de Transparência</h2>
            <p className="text-navy-600 mb-4">A Câmara Municipal de Sumé busca constantemente a excelência em transparência pública, seguindo os padrões do PNTP 2025.</p>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-gold-400 fill-gold-400" />)}
              <span className="ml-2 text-sm font-medium text-navy-600">Nível Diamante</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
