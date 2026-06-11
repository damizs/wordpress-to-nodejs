import { MapPin, Clock, Search, Send } from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";

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

  const linkProps = (url: string) =>
    url.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <section className="py-20 px-4 bg-muted/40">
      <div className="container mx-auto">
        <div className="text-center mb-12" data-reveal>
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            Acesso à Informação
          </span>
          <h2 className="heading-accent text-3xl md:text-4xl font-bold text-foreground mb-4">
            {title && title !== "e-SIC" ? title : "E-SIC - Sistema Eletrônico de Informações"}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {subtitle || "Acesse informações públicas e solicite dados da administração municipal de forma transparente"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
          {/* Sistema E-SIC */}
          <div data-reveal="left" className="card-modern p-7 flex flex-col">
            <h3 className="text-lg font-bold text-foreground mb-5">Sistema E-SIC</h3>
            <div className="flex flex-wrap gap-3 mb-6">
              <a
                href={newUrl}
                {...linkProps(newUrl)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold no-underline hover:opacity-90 transition-opacity"
              >
                <Send className="w-4 h-4" />
                Nova Demanda
              </a>
              <a
                href={consultUrl}
                {...linkProps(consultUrl)}
                className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-border text-foreground rounded-lg text-sm font-semibold no-underline hover:border-primary hover:text-primary transition-colors"
              >
                <Search className="w-4 h-4" />
                Consultar Demanda
              </a>
            </div>
            <div className="mt-auto bg-muted/60 rounded-xl p-5">
              <h4 className="text-sm font-bold text-foreground mb-3">Como funciona o E-SIC?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4 marker:text-primary">
                <li>Cadastre sua solicitação de informação</li>
                <li>Acompanhe o andamento do pedido</li>
                <li>Receba a resposta em até 20 dias úteis</li>
              </ul>
            </div>
          </div>

          {/* Atendimento Presencial */}
          <div data-reveal="right" className="bg-gradient-hero rounded-2xl p-7 text-primary-foreground shadow-xl">
            <h3 className="text-lg font-bold mb-6">Atendimento Presencial</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">Endereço</h4>
                  <p className="text-sm text-primary-foreground/80 leading-relaxed">{address}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">Horário de Atendimento</h4>
                  <p className="text-sm text-primary-foreground/80">{hours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
