import { Head, Link } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { PageHero } from '~/components/PageHero'
import { Users } from 'lucide-react'

interface Props { councilors: any[]; legislature: any | null }

export default function CouncilorsIndex({ councilors, legislature }: Props) {
  return (
    <PublicLayout>
      <Head title="Vereadores - Câmara de Sumé" />
      <PageHero title="Vereadores" subtitle={legislature ? `Legislatura ${legislature.name}` : 'Conheça os vereadores da Câmara Municipal de Sumé'}
        icon={<Users className="w-8 h-8" />} breadcrumbs={[{ label: 'Vereadores' }]} />
      <section className="py-10 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {councilors.map((c: any) => (
              <Link key={c.id} href={`/vereadores/${c.slug || c.id}`}
                className="bg-white rounded-lg border hover:border-navy/30 hover:shadow-md transition-all overflow-hidden group">
                <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                  {c.photo_url ? (
                    <img src={c.photo_url} alt={c.parliamentary_name || c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-navy/5">
                      <Users className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-bold text-gray-800">{c.parliamentary_name || c.name}</h3>
                  {c.party && <p className="text-sm text-gray-500 mt-1">{c.party}</p>}
                  {c.position && <p className="text-xs text-gold font-medium mt-1">{c.position}</p>}
                </div>
              </Link>
            ))}
          </div>
          {councilors.length === 0 && (
            <div className="bg-white rounded-lg border p-12 text-center"><Users className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Nenhum vereador cadastrado.</p></div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}
