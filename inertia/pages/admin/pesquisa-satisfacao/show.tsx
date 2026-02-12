import { Head, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { ArrowLeft, Star, User, Mail, Phone } from 'lucide-react'

interface Props { survey: any }

function Stars({ rating, label }: { rating: number | null; label: string }) {
  if (!rating) return null
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`w-4 h-4 ${(rating || 0) >= s ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
          ))}
        </div>
        <span className="text-sm font-medium text-gray-700">{rating}/5</span>
      </div>
    </div>
  )
}

export default function PesquisaSatisfacaoShow({ survey }: Props) {
  return (
    <AdminLayout title="Detalhes da Resposta">
      <Head title="Resposta - Pesquisa de Satisfação" />
      <Link href="/painel/pesquisa-satisfacao" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="max-w-2xl space-y-6">
        {/* Identificação */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Identificação</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-700">{survey.name || <span className="text-gray-400 italic">Anônimo</span>}</span>
            </div>
            {survey.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href={`mailto:${survey.email}`} className="text-sm text-navy hover:underline">{survey.email}</a>
              </div>
            )}
            {survey.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">{survey.phone}</span>
              </div>
            )}
            <p className="text-xs text-gray-400">Enviado em {new Date(survey.created_at).toLocaleString('pt-BR')}</p>
          </div>
        </div>

        {/* Avaliações */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Avaliações</h2>
          <div className="divide-y divide-gray-50">
            <Stars rating={survey.rating_atendimento} label="Atendimento ao público" />
            <Stars rating={survey.rating_transparencia} label="Transparência" />
            <Stars rating={survey.rating_legislativo} label="Atuação legislativa" />
            <Stars rating={survey.rating_infraestrutura} label="Infraestrutura" />
            <div className="pt-3 mt-2 border-t-2 border-gray-100">
              <Stars rating={survey.rating_geral} label="Avaliação geral" />
            </div>
          </div>
        </div>

        {/* Comentários */}
        {(survey.suggestions || survey.complaints) && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Comentários</h2>
            {survey.suggestions && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-400 uppercase mb-1">Sugestões</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{survey.suggestions}</p>
              </div>
            )}
            {survey.complaints && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase mb-1">Reclamações</p>
                <p className="text-sm text-gray-700 whitespace-pre-line">{survey.complaints}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
