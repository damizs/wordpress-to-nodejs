import { Head, Link } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { ArrowLeft, Download, Video } from 'lucide-react'

interface Props { session: any }

export default function AtaShow({ session }: Props) {
  return (
    <PublicLayout>
      <Head title={`${session.title} - Atas - Câmara de Sumé`} />
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/atas" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Voltar para Atas
          </Link>
          <article className="bg-white rounded-2xl shadow-sm p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{session.title}</h1>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{session.session_date}</span>
              <span className="text-sm bg-navy/10 text-navy px-3 py-1 rounded-full capitalize">{session.type}</span>
              {session.start_time && <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{session.start_time}</span>}
            </div>
            {session.minutes && (
              <div className="mb-6"><h2 className="font-semibold text-gray-800 mb-2">Ata</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{session.minutes}</p>
              </div>
            )}
            {session.agenda && (
              <div className="mb-6"><h2 className="font-semibold text-gray-800 mb-2">Pauta</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{session.agenda}</p>
              </div>
            )}
            <div className="flex gap-3">
              {session.file_url && (
                <a href={session.file_url} target="_blank" rel="noopener"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-navy border border-navy/20 rounded-lg hover:bg-navy/5">
                  <Download className="w-4 h-4" /> Baixar Ata (PDF)
                </a>
              )}
              {session.video_url && (
                <a href={session.video_url} target="_blank" rel="noopener"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-navy border border-navy/20 rounded-lg hover:bg-navy/5">
                  <Video className="w-4 h-4" /> Assistir Sessão
                </a>
              )}
            </div>
          </article>
        </div>
      </section>
    </PublicLayout>
  )
}
