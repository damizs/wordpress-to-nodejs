import { Head, Link } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { ArrowLeft, Mail, Phone } from 'lucide-react'

interface Props { councilor: any }

export default function CouncilorShow({ councilor }: Props) {
  return (
    <PublicLayout>
      <Head title={`${councilor.parliamentary_name || councilor.name} - Câmara de Sumé`} />
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/vereadores" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Voltar para Vereadores
          </Link>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 bg-gray-100">
                {councilor.photo_url ? (
                  <img src={councilor.photo_url} alt={councilor.name} className="w-full h-full object-cover min-h-[300px]" />
                ) : (
                  <div className="w-full min-h-[300px] flex items-center justify-center text-gray-300 text-8xl font-bold">
                    {councilor.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="md:w-2/3 p-8">
                <h1 className="text-2xl font-bold text-gray-900">{councilor.parliamentary_name || councilor.name}</h1>
                {councilor.full_name && councilor.full_name !== councilor.name && (
                  <p className="text-sm text-gray-500 mt-1">{councilor.full_name}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {councilor.party && <span className="text-sm bg-navy/10 text-navy px-3 py-1 rounded-full">{councilor.party}</span>}
                  {councilor.positions?.map((p: any) => p.position !== 'Vereador' && (
                    <span key={p.id} className="text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded-full">{p.position} - {p.biennium_name}</span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
                  {councilor.gender && <div><span className="text-gray-400">Gênero:</span> <span className="text-gray-700">{councilor.gender}</span></div>}
                  {councilor.marital_status && <div><span className="text-gray-400">Estado Civil:</span> <span className="text-gray-700">{councilor.marital_status}</span></div>}
                  {councilor.education_level && <div><span className="text-gray-400">Escolaridade:</span> <span className="text-gray-700">{councilor.education_level}</span></div>}
                </div>
                <div className="flex gap-4 mt-6">
                  {councilor.email && (
                    <a href={`mailto:${councilor.email}`} className="flex items-center gap-2 text-sm text-navy hover:underline">
                      <Mail className="w-4 h-4" /> {councilor.email}
                    </a>
                  )}
                  {councilor.phone && (
                    <a href={`tel:${councilor.phone}`} className="flex items-center gap-2 text-sm text-navy hover:underline">
                      <Phone className="w-4 h-4" /> {councilor.phone}
                    </a>
                  )}
                </div>
                {councilor.bio && (
                  <div className="mt-6">
                    <h2 className="font-semibold text-gray-800 mb-2">Biografia</h2>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{councilor.bio}</p>
                  </div>
                )}
                {councilor.history && (
                  <div className="mt-6">
                    <h2 className="font-semibold text-gray-800 mb-2">Trajetória</h2>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{councilor.history}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
