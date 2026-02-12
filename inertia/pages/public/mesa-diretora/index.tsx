import { Head, Link } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { Crown } from 'lucide-react'

interface Props { biennium: any; legislature_name: string; positions: any[] }

export default function MesaDiretoraIndex({ biennium, legislature_name, positions }: Props) {
  return (
    <PublicLayout>
      <Head title="Mesa Diretora - Câmara de Sumé" />
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <Crown className="w-12 h-12 mx-auto text-navy mb-3" />
            <h1 className="text-3xl font-bold text-gray-900">Mesa Diretora</h1>
            {biennium && (
              <p className="text-gray-500 mt-2">
                Biênio {biennium.name} {legislature_name ? `• ${legislature_name}` : ''}
              </p>
            )}
          </div>

          {positions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {positions.map((p: any) => (
                <Link key={p.id} href={p.councilor_slug ? `/vereadores/${p.councilor_slug}` : '#'}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                    {p.councilor_photo ? (
                      <img src={p.councilor_photo} alt={p.councilor_parliamentary_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl font-bold">
                        {p.councilor_parliamentary_name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className="p-5 text-center">
                    <span className="inline-block text-xs font-semibold text-navy bg-navy/10 px-3 py-1 rounded-full mb-2">
                      {p.position}
                    </span>
                    <h3 className="font-semibold text-gray-800 text-lg">{p.councilor_parliamentary_name}</h3>
                    {p.councilor_party && <p className="text-sm text-gray-400 mt-1">{p.councilor_party}</p>}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400">Nenhuma composição da mesa diretora cadastrada para o biênio atual.</p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}
