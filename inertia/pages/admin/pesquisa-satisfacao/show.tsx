import { Head } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { ArrowLeft, BadgeCheck, ClipboardList, Star, User, Mail, Phone } from 'lucide-react'
import { ButtonLink, Card, CardHeader, PageHeader } from '~/components/admin/ui'

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
  const cpfVerified = Boolean(survey.cpf_hash) || Boolean(maskCpf(survey.cpf))

  return (
    <AdminLayout title="Detalhes da Resposta">
      <Head title="Resposta - Pesquisa de Satisfação" />

      <PageHeader
        title="Detalhes da Resposta"
        description={`Enviada em ${new Date(survey.created_at).toLocaleString('pt-BR')}`}
        icon={ClipboardList}
        eyebrow="Pesquisa de Satisfação"
        actions={
          <ButtonLink href="/painel/pesquisa-satisfacao" variant="secondary">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </ButtonLink>
        }
      />

      <div className="space-y-6">
        {/* Top row: Identificação + Avaliações lado a lado no desktop */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Identificação */}
          <Card>
            <CardHeader title="Identificação" icon={User} />
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground">
                  {survey.name || <span className="text-muted-foreground italic">Anônimo</span>}
                </span>
              </div>
              {survey.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a href={`mailto:${survey.email}`} className="text-sm text-navy hover:underline">
                    {survey.email}
                  </a>
                </div>
              )}
              {survey.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground">{survey.phone}</span>
                </div>
              )}
              {cpfVerified && (
                <div className="flex items-center gap-3">
                  <BadgeCheck className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground">
                    CPF verificado (dado pseudonimizado — não armazenado em texto claro)
                  </span>
                </div>
              )}
              <p className="text-xs text-muted-foreground pt-1">
                Enviado em {new Date(survey.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
          </Card>

          {/* Avaliações */}
          <Card>
            <CardHeader title="Avaliações" icon={Star} />
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
        </div>

        {/* Comentários — largura total */}
        {(survey.suggestions || survey.complaints) && (
          <Card>
            <CardHeader title="Comentários" />
            <div className="grid gap-4 sm:grid-cols-2">
              {survey.suggestions && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Sugestões</p>
                  <p className="text-sm text-foreground whitespace-pre-line">{survey.suggestions}</p>
                </div>
              )}
              {survey.complaints && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1.5">Reclamações</p>
                  <p className="text-sm text-foreground whitespace-pre-line">{survey.complaints}</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
