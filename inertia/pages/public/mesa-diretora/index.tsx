import { Head, Link } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { PageHero } from '~/components/PageHero'
import { Crown, Users } from 'lucide-react'

interface Props { biennium: any; legislature_name: string; positions: any[] }

export default function MesaDiretoraIndex({ biennium, legislature_name, positions }: Props) {
  return (
    <PublicLayout>
      <Head title="Mesa Diretora - Câmara de Sumé" />
      <PageHero title="Mesa Diretora" subtitle={biennium ? `Biênio ${biennium.name} • ${legislature_name}` : 'Composição da Mesa Diretora da Câmara Municipal'}
        icon={<Crown className="w-8 h-8" />} breadcrumbs={[{ label: 'Mesa Diretora' }]} />
      <section className="py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          {positions.length > 0 ? (
            <div className="space-y-4">
              {positions.map((p: any) => (
                <div key={p.id} className="bg-white rounded-lg border hover:border-navy/30 transition-colors p-5 flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    {p.councilor?.photo_url ? (
                      <img src={p.councilor.photo_url} alt={p.councilor.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-navy/5"><Users className="w-8 h-8 text-gray-300" /></div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-gold uppercase tracking-wider">{p.position}</span>
                    <h3 className="font-bold text-gray-800 mt-1">{p.councilor?.parliamentary_name || p.councilor?.name || 'Vago'}</h3>
                    {p.councilor?.party && <p className="text-sm text-gray-500">{p.councilor.party}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border p-12 text-center"><Crown className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Mesa Diretora ainda não cadastrada.</p></div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}
