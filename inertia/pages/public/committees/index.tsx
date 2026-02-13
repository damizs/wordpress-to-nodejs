import { Head } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { PageHero } from '~/components/PageHero'
import { Users2, User } from 'lucide-react'

interface Props { committees: any[] }

export default function CommitteesIndex({ committees }: Props) {
  return (
    <PublicLayout>
      <Head title="Comissões - Câmara de Sumé" />
      <PageHero title="Comissões" subtitle="Comissões permanentes e temporárias da Câmara Municipal" icon={<Users2 className="w-8 h-8" />}
        breadcrumbs={[{ label: 'Comissões' }]} />
      <section className="py-10 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          {committees.length > 0 ? (
            <div className="space-y-6">
              {committees.map((c: any) => (
                <div key={c.id} className="bg-white rounded-lg border overflow-hidden">
                  <div className="bg-navy/5 px-6 py-4 border-b">
                    <h2 className="font-bold text-gray-800 text-lg">{c.name}</h2>
                    {c.description && <p className="text-sm text-gray-500 mt-1">{c.description}</p>}
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${c.type === 'permanente' ? 'bg-navy/10 text-navy' : 'bg-amber-100 text-amber-700'}`}>{c.type}</span>
                  </div>
                  {c.members?.length > 0 && (
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {c.members.map((m: any) => (
                        <div key={m.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {m.councilor?.photo_url ? <img src={m.councilor.photo_url} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-gray-400" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{m.councilor?.parliamentary_name || m.councilor?.name || 'Vago'}</p>
                            <p className="text-xs text-gold font-medium">{m.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border p-12 text-center"><Users2 className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Nenhuma comissão cadastrada.</p></div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}
