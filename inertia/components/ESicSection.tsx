import { MapPin, Clock, Search, Send, Phone, Mail, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";

/** Sistema e-SIC contratado (doc3.inf.br) — Sumé */
export const DEFAULT_ESIC_URL = "https://doc3.inf.br/cmsu2516300/esic";

/** Contatos padrão da seção (Painel → Homepage → E-SIC). Não usa footer. */
const SUME_ESIC_CONTACT = {
  address: "Rua Luiz Grande, s/n - Centro\nCEP: 58540-000\nSumé - PB",
  hours: "Segunda à Sexta-feira\ndas 8h às 14h",
  phone: "(83) 3353-1191",
  email: "contato@camaradesume.pb.gov.br",
};

interface ESicSectionProps {
  title?: string;
  subtitle?: string;
  /** Páginas internas com PageHero próprio */
  hideHeading?: boolean;
}

function pickSetting(...values: (string | null | undefined)[]): string {
  for (const v of values) {
    if (v && v.trim() !== "" && v.trim() !== "#") return v.trim();
  }
  return "";
}

/**
 * Seção E-SIC da home — visual alinhado ao mockup Lovable (camarade-s-new-look).
 * Botões abrem o sistema externo; contatos vêm de homepage_esic_* no painel.
 */
export const ESicSection = ({ title, subtitle, hideHeading = false }: ESicSectionProps) => {
  const settings = useSiteSettings();

  const newUrl = pickSetting(settings.esic_new_url, DEFAULT_ESIC_URL);
  const consultUrl = pickSetting(settings.esic_consult_url, newUrl);

  const address = pickSetting(settings.homepage_esic_address, SUME_ESIC_CONTACT.address);
  const hours = pickSetting(settings.homepage_esic_hours, SUME_ESIC_CONTACT.hours);
  const phone = pickSetting(
    settings.homepage_esic_phone,
    settings.esic_phone,
    SUME_ESIC_CONTACT.phone
  );
  const email = pickSetting(
    settings.homepage_esic_email,
    settings.esic_email,
    SUME_ESIC_CONTACT.email
  );

  const linkProps = (url: string) =>
    url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" as const } : {};

  const headingTitle =
    title && title !== "e-SIC" ? title : "E-SIC - Sistema Eletrônico de Informações";
  const headingSubtitle =
    subtitle ||
    "Acesse informações públicas e solicite dados da administração municipal de forma transparente";

  const contactItems: { icon: LucideIcon; title: string; content: string; href?: string }[] = [
    { icon: MapPin, title: "Endereço", content: address },
    { icon: Clock, title: "Horário de Atendimento", content: hours },
    {
      icon: Phone,
      title: "Telefone",
      content: phone,
      href: `tel:${phone.replace(/[^\d+]/g, "")}`,
    },
    {
      icon: Mail,
      title: "E-mail",
      content: email,
      href: `mailto:${email}`,
    },
  ];

  const steps = [
    "Cadastre sua solicitação de informação",
    "Acompanhe o andamento do pedido",
    "Receba a resposta em até 20 dias úteis",
  ];

  return (
    <section id="esic" className="relative py-20 overflow-hidden">
      {/* Fundo navy de ponta a ponta (full-bleed) */}
      <div className="absolute inset-0 bg-gradient-hero" aria-hidden />
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container">
        {/* Cabeçalho — badge + título sobre o fundo azul */}
        {!hideHeading && (
        <div className="text-center mb-14" data-reveal>
          <span className="inline-block px-4 py-1.5 bg-gold/20 text-gold rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            Acesso à Informação
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 leading-tight">
            {headingTitle}
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">{headingSubtitle}</p>
        </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-stretch">
          {/* Sistema E-SIC */}
          <div data-reveal="left" className="card-modern p-8 flex flex-col bg-card shadow-lg">
            <h3 className="text-xl font-bold text-foreground mb-8">Sistema E-SIC</h3>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <a
                href={newUrl}
                {...linkProps(newUrl)}
                className="btn-modern group flex-1 inline-flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-gradient-to-r from-primary to-navy-light text-primary-foreground text-sm font-semibold no-underline shadow-lg hover:shadow-xl"
              >
                <Send className="w-5 h-5 shrink-0" />
                Nova Demanda
                <ArrowRight className="w-4 h-4 shrink-0 opacity-0 -ml-4 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100" />
              </a>
              <a
                href={consultUrl}
                {...linkProps(consultUrl)}
                className="btn-modern flex-1 inline-flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-gradient-gold text-navy-dark text-sm font-semibold no-underline shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5 shrink-0" />
                Consultar Demanda
              </a>
            </div>

            <div className="mt-auto rounded-2xl border border-border/50 bg-gradient-to-br from-muted to-muted/50 p-6">
              <h4 className="font-bold text-foreground mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Clock className="w-5 h-5 text-primary" />
                </span>
                Como funciona o E-SIC?
              </h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                {steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-navy-light text-sm font-bold text-primary-foreground shadow-md">
                      {i + 1}
                    </span>
                    <span className="pt-1">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Atendimento Presencial */}
          <div
            data-reveal="right"
            className="relative overflow-hidden rounded-3xl p-8 text-primary-foreground shadow-xl min-h-[320px] border border-primary-foreground/10"
          >
            <div className="absolute inset-0 bg-gradient-navy" />
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-sky/10" />
            <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-gold/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-sky/10 blur-3xl" />

            <div className="relative">
              <h3 className="text-xl font-bold mb-8">Atendimento Presencial</h3>
              <div className="space-y-6">
                {contactItems.map((item, i) => {
                  const Icon = item.icon;
                  const row = (
                    <>
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl glass transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-5 w-5 text-gold" />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-gold mb-1">{item.title}</span>
                        <span className="block text-sm leading-relaxed text-primary-foreground/80 whitespace-pre-line break-words">
                          {item.content}
                        </span>
                      </span>
                    </>
                  );
                  return item.href ? (
                    <a key={i} href={item.href} className="group flex items-start gap-4 no-underline">
                      {row}
                    </a>
                  ) : (
                    <div key={i} className="group flex items-start gap-4">
                      {row}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
