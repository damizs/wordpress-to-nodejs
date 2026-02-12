import { ArrowRight, User } from 'lucide-react'

interface CouncilorItem { id: number; name: string; party: string | null; photoUrl: string | null; role: string | null }

export function VereadoresSection({ councilors }: { councilors: CouncilorItem[] }) {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-navy-900 mb-2">Vereadores</h2>
          <p className="text-navy-500">Legislatura 2025-2028</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {councilors.map((v) => (
            <a key={v.id} href={`/vereadores/${v.id}`} className="group text-center">
              <div className="relative mb-3 mx-auto w-28 h-28 rounded-full overflow-hidden border-3 border-navy-100 group-hover:border-gold-400 transition-colors shadow-md">
                {v.photoUrl ? (
                  <img src={v.photoUrl} alt={v.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-navy-100 flex items-center justify-center"><User className="w-10 h-10 text-navy-400" /></div>
                )}
              </div>
              <h3 className="text-sm font-semibold text-navy-800 group-hover:text-gold-600 transition-colors">{v.name}</h3>
              {v.party && <p className="text-xs text-navy-400 mt-0.5">{v.party}</p>}
              {v.role && <p className="text-xs text-gold-600 font-medium mt-0.5">{v.role}</p>}
            </a>
          ))}
        </div>
        <div className="text-center mt-10">
          <a href="/vereadores" className="group inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white rounded-xl font-medium hover:bg-navy-800 transition-colors">
            Ver todos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  )
}
