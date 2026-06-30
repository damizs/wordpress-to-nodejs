import { MapPin, Clock, Search, Send, Phone, Mail, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { usePage } from "@inertiajs/react";
import { useSiteSettings } from "~/hooks/use_site_settings";

/**
 * URL do sistema e-SIC: vem 100% do painel (esic_new_url). Sem URL configurada,
 * fica vazio e os botões do sistema são omitidos (sem chumbar tenant).
 */
export const DEFAULT_ESIC_URL = "";

/**
 * Contatos padrão da seção (Painel → Homepage → E-SIC). Fallback VAZIO — o
 * endereço/horário/telefone/e-mail vêm do painel; cada item some quando vazio.
 */
const DEFAULT_ESIC_CONTACT = {
  address: "",
  hours: "",
  phone: "",
  email: "",
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
  const orgName = (usePage().props as { camara?: { nome?: string } }).camara?.nome || "";

  const newUrl = pickSetting(settings.esic_new_url, DEFAULT_ESIC_URL);
  const consultUrl = pickSetting(settings.esic_consult_url, newUrl);

  const address = pickSetting(settings.homepage_esic_address, DEFAULT_ESIC_CONTACT.address);
  const hours = pickSetting(settings.homepage_esic_hours, DEFAULT_ESIC_CONTACT.hours);
  const phone = pickSetting(
    settings.homepage_esic_phone,
    settings.esic_phone,
    DEFAULT_ESIC_CONTACT.phone
  );
  const email = pickSetting(
    settings.homepage_esic_email,
    settings.esic_email,
    DEFAULT_ESIC_CONTACT.email
  );
  const sicUnit = pickSetting(
    settings.sic_unit,
    orgName ? `Serviço de Informação ao Cidadão (SIC) da ${orgName}` : ""
  );
  const monitoringAuthority = pickSetting(
    settings.sic_monitoring_authority,
    orgName ? `Presidência da ${orgName}` : ""
  );

  const linkProps = (url: string) =>
    url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" as const } : {};

  const headingTitle =
    title && title !== "e-SIC" ? title : "E-SIC - Sistema Eletrônico de Informações";
  const headingSubtitle =
    subtitle ||
    "Acesse informações públicas e solicite dados da administração municipal de forma transparente";

  // Cada linha de contato só entra quando o painel tem o dado (fallback vazio).
  const contactItems: { icon: LucideIcon; title: string; content: string; href?: string }[] = [
    address && { icon: MapPin, title: "Endereço", content: address },
    hours && { icon: Clock, title: "Horário de Atendimento", content: hours },
    phone && {
      icon: Phone,
      title: "Telefone",
      content: phone,
      href: `tel:${phone.replace(/[^\d+]/g, "")}`,
    },
    email && {
      icon: Mail,
      title: "E-mail",
      content: email,
      href: `mailto:${email}`,
    },
  ].filter(Boolean) as { icon: LucideIcon; title: string; content: string; href?: string }[];

  const steps = [
    "Cadastre sua solicitação de informação",
    "Acompanhe o andamento do pedido",
    "Receba a resposta em até 20 dias úteis",
  ];

  return (
    <section id="esic" className="relative section-block overflow-hidden">
      {/* Fundo navy de ponta a ponta (full-bleed) — um único brilho sutil */}
      <div className="absolute inset-0 bg-gradient-hero" aria-hidden />
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container">
        {/* Cabeçalho — badge + título sobre o fundo azul */}
        {!hideHeading && (
        <div className="text-center mb-8 sm:mb-14" data-reveal>
          <span className="inline-block px-4 py-1.5 bg-gold/20 text-gold rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            Acesso à Informação
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 leading-tight px-1">
            {headingTitle}
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-base sm:text-lg px-1">{headingSubtitle}</p>
        </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto items-stretch">
          {/* Sistema E-SIC */}
          <div data-reveal="left" className="card-modern p-5 sm:p-8 flex flex-col bg-card shadow-lg">
            <h3 className="text-xl font-bold text-foreground mb-8">Sistema E-SIC</h3>

            {newUrl && (
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
            )}

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
            className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-primary-foreground shadow-xl min-h-[280px] sm:min-h-[320px] border border-primary-foreground/10"
          >
            <div className="absolute inset-0 bg-gradient-navy" />
            <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-gold/10 blur-3xl" />

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

        <div className="mt-6 sm:mt-8 max-w-6xl mx-auto rounded-2xl border border-primary-foreground/15 bg-card/95 p-5 sm:p-6 shadow-lg" data-reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
            {sicUnit && (
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Unidade responsável
              </span>
              <p className="font-semibold text-foreground leading-relaxed">{sicUnit}</p>
            </div>
            )}
            {monitoringAuthority && (
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Autoridade de monitoramento
              </span>
              <p className="font-semibold text-foreground leading-relaxed">{monitoringAuthority}</p>
            </div>
            )}
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Prazos da LAI
              </span>
              <p className="text-muted-foreground leading-relaxed">
                Resposta em até 20 dias, prorrogáveis por 10 dias mediante justificativa. O recurso deve seguir os prazos informados no sistema e-SIC.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
