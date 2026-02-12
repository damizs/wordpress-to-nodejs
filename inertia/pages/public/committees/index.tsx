import { Head } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { Users2 } from 'lucide-react'

interface Props { committees: any[] }

const typeBadge: Record<string, string> = {
  permanente: 'bg-blue-100 text-blue-700',
  temporaria: 'bg-amber-100 text-amber-700',
  especial: 'bg-purple-100 text-purple-700',
}

export default function CommitteesIndex({ committees }: Props) {
  return (
    <PublicLayout>
      <Head title="Comissões - Câmara de Sumé" />
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <Users2 className="w-12 h-12 mx-auto text-navy mb-3" />
            <h1 className="text-3xl font-bold text-gray-900">Comissões Parlamentares</h1>
            <p className="text-gray-500 mt-2">Conheça as comissões e seus membros</p>
          </div>

          <div className="space-y-6">
            {committees.map((c: any) => (
              <div key={c.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">{c.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${typeBadge[c.type] || 'bg-gray-100 text-gray-600'}`}>
                          {c.type}
                        </span>
                        {c.legislature_name && <span className="text-xs text-gray-400">{c.legislature_name}</span>}
                      </div>
                    </div>
                  </div>
                  {c.description && <p className="text-sm text-gray-600 mt-3">{c.description}</p>}

                  {c.members && c.members.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Composição</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {c.members.map((m: any) => (
                          <div key={m.id} className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                              {m.councilor_photo ? (
                                <img src={m.councilor_photo} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">
                                  {m.councilor_name?.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800 leading-tight">{m.councilor_name}</p>
                              <p className="text-xs text-gray-400">{m.role} {m.councilor_party ? `• ${m.councilor_party}` : ''}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {committees.length === 0 && (
              <p className="text-center text-gray-400 py-12">Nenhuma comissão cadastrada.</p>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
