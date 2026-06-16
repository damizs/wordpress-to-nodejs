import { MapPin, Clock, Search, Send, Phone, Mail, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";
import { SectionHeading } from "~/components/SectionHeading";

interface ESicSectionProps {
  title?: string;
  subtitle?: string;
}

export const ESicSection = ({ title, subtitle }: ESicSectionProps) => {
  const settings = useSiteSettings();
  const newUrl = settings.esic_new_url && settings.esic_new_url !== "#" ? settings.esic_new_url : "/transparencia";
  const consultUrl = settings.esic_consult_url && settings.esic_consult_url !== "#" ? settings.esic_consult_url : newUrl;
  const address = settings.footer_address || "Rua Antônio Vieira Lima, S/N, Centro, Sumé - PB";
  const hours = settings.footer_hours || "Segunda à Sexta-feira das 8h às 14h";
  const phone = settings.footer_phone || "";
  const email = settings.footer_email || "";

  const linkProps = (url: string) =>
    url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {};

  const steps = [
    "Cadastre sua solicitação de informação",
    "Acompanhe o andamento do pedido",
    "Receba a resposta em até 20 dias úteis",
  ];

  const contactItems: { icon: LucideIcon; title: string; content: string; href?: string }[] = [
    { icon: MapPin, title: "Endereço", content: address },
    { icon: Clock, title: "Horário de Atendimento", content: hours },
  ];
  if (phone) {
    contactItems.push({
      icon: Phone,
      title: "Telefone",
      content: phone,
      href: `tel:${phone.replace(/[^\d+]/g, "")}`,
    });
  }
  if (email) {
    contactItems.push({ icon: Mail, title: "E-mail", content: email, href: `mailto:${email}` });
  }

  return (
    <section id="esic" className="py-14 lg:py-20 bg-muted/40">
      <div className="container">
        <SectionHeading
          badge="Acesso à Informação"
          title={title && title !== "e-SIC" ? title : "E-SIC - Sistema Eletrônico de Informações"}
          subtitle={subtitle || "Acesse informações públicas e solicite dados da administração municipal de forma transparente"}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Sistema E-SIC */}
          <div data-reveal="left" className="card-modern p-8 flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-7">Sistema E-SIC</h3>

            <div className="flex flex-col sm:flex-row gap-4 mb-9">
              <a
                href={newUrl}
                {...linkProps(newUrl)}
                className="btn-modern group flex-1 inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-navy-light text-primary-foreground text-sm font-semibold no-underline shadow-lg hover:shadow-xl"
              >
                <Send className="w-5 h-5" />
                Nova Demanda
                <ArrowRight className="w-4 h-4 -ml-3 opacity-0 transition-all duration-300 group-hover:ml-0 group-hover:opacity-100" />
              </a>
              <a
                href={consultUrl}
                {...linkProps(consultUrl)}
                className="btn-modern flex-1 inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-gradient-gold text-navy text-sm font-semibold no-underline shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5" />
                Consultar Demanda
              </a>
            </div>

            <div className="mt-auto rounded-2xl border border-border/60 bg-gradient-to-br from-muted to-muted/40 p-6">
              <h4 className="flex items-center gap-3 font-bold text-foreground mb-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
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
            className="relative overflow-hidden rounded-3xl p-8 text-primary-foreground shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-navy" />
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gold/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-sky/10 blur-3xl" />

            <div className="relative">
              <h3 className="text-xl font-bold mb-8">Atendimento Presencial</h3>
              <div className="space-y-6">
                {contactItems.map((item, i) => {
                  const Icon = item.icon;
                  const body = (
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
                      {body}
                    </a>
                  ) : (
                    <div key={i} className="group flex items-start gap-4">
                      {body}
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
