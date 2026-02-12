import { Head, Link } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { ArrowLeft } from 'lucide-react'

interface Props { session: any }

export default function PautaShow({ session }: Props) {
  return (
    <PublicLayout>
      <Head title={`Pauta - ${session.title} - Câmara de Sumé`} />
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/pautas" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          <article className="bg-white rounded-2xl shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{session.title}</h1>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{session.session_date}</span>
              <span className="text-sm bg-navy/10 text-navy px-3 py-1 rounded-full capitalize">{session.type}</span>
            </div>
            {session.agenda && (
              <div><h2 className="font-semibold text-gray-800 mb-2">Ordem do Dia</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">{session.agenda}</div>
              </div>
            )}
          </article>
        </div>
      </section>
    </PublicLayout>
  )
}
