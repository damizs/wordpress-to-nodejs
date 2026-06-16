import { Head, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { ArrowLeft, BadgeCheck, Star, User, Mail, Phone } from 'lucide-react'
import { Card, CardHeader } from '~/components/admin/ui'

interface Props { survey: any }

function Stars({ rating, label }: { rating: number | null; label: string }) {
  if (!rating) return null
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className={`w-4 h-4 ${(rating || 0) >= s ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
          ))}
        </div>
        <span className="text-sm font-medium text-foreground">{rating}/5</span>
      </div>
    </div>
  )
}

function maskCpf(cpf: string | null | undefined) {
  const digits = String(cpf || '').replace(/\D/g, '').slice(0, 11)
  if (digits.length !== 11) return null
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export default function PesquisaSatisfacaoShow({ survey }: Props) {
  const cpf = maskCpf(survey.cpf)

  return (
    <AdminLayout title="Detalhes da Resposta">
      <Head title="Resposta - Pesquisa de Satisfação" />
      <Link href="/painel/pesquisa-satisfacao" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="admin-form admin-form-narrow">
        {/* Identificação */}
        <Card>
          <CardHeader title="Identificação" />
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{survey.name || <span className="text-muted-foreground italic">Anônimo</span>}</span>
            </div>
            {survey.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${survey.email}`} className="text-sm text-navy hover:underline">{survey.email}</a>
              </div>
            )}
            {survey.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{survey.phone}</span>
              </div>
            )}
            {cpf && (
              <div className="flex items-center gap-3">
                <BadgeCheck className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{cpf}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Enviado em {new Date(survey.created_at).toLocaleString('pt-BR')}</p>
          </div>
        </Card>

        {/* Avaliações */}
        <Card>
          <CardHeader title="Avaliações" />
          <div className="divide-y divide-border/70">
            <Stars rating={survey.rating_atendimento} label="Atendimento ao público" />
            <Stars rating={survey.rating_transparencia} label="Transparência" />
            <Stars rating={survey.rating_legislativo} label="Atuação legislativa" />
            <Stars rating={survey.rating_infraestrutura} label="Infraestrutura" />
            <div className="pt-3 mt-2 border-t-2 border-border">
              <Stars rating={survey.rating_geral} label="Avaliação geral" />
            </div>
          </div>
        </Card>

        {/* Comentários */}
        {(survey.suggestions || survey.complaints) && (
          <Card>
            <CardHeader title="Comentários" />
            {survey.suggestions && (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Sugestões</p>
                <p className="text-sm text-foreground whitespace-pre-line">{survey.suggestions}</p>
              </div>
            )}
            {survey.complaints && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Reclamações</p>
                <p className="text-sm text-foreground whitespace-pre-line">{survey.complaints}</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
