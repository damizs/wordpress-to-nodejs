import { Head, Link } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'

interface Props { councilors: any[]; legislature: any | null }

export default function CouncilorsIndex({ councilors, legislature }: Props) {
  return (
    <PublicLayout>
      <Head title="Vereadores - Câmara Municipal de Sumé" />
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Vereadores</h1>
            {legislature && <p className="text-gray-500 mt-2">{legislature.name} ({legislature.number}ª Legislatura)</p>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {councilors.map((c: any) => (
              <Link key={c.id} href={`/vereadores/${c.slug}`}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                  {c.photo_url ? (
                    <img src={c.photo_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl font-bold">
                      {c.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-3 text-center">
                  <h3 className="font-semibold text-sm text-gray-800 leading-tight">{c.parliamentary_name || c.name}</h3>
                  {c.party && <p className="text-xs text-gray-500 mt-1">{c.party}</p>}
                  {c.position && c.position !== 'Vereador' && (
                    <span className="inline-block mt-1 text-xs bg-navy/10 text-navy px-2 py-0.5 rounded-full">{c.position}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {councilors.length === 0 && <p className="text-center text-gray-400 py-12">Nenhum vereador cadastrado.</p>}
        </div>
      </section>
    </PublicLayout>
  )
}
