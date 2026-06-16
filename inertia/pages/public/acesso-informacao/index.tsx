import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { MapPin, Phone, Mail, Clock, Send, Search, ExternalLink, Scale } from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";

interface Props {
  esicUrl: string;
}

export default function AcessoInformacaoIndex({ esicUrl }: Props) {
  const settings = useSiteSettings();
  const phone = settings.esic_phone || settings.footer_phone || "(83) 3353-1175";
  const email = settings.esic_email || "esic@camaradesume.pb.gov.br";
  const address =
    settings.footer_address || "Praça Luiz Gaudêncio, S/N - Centro, Sumé - PB, CEP: 58540-000";
  const hours = settings.footer_hours || "Segunda a Sexta: 08h às 14h";

  const external = esicUrl.startsWith("http");

  return (
    <>
      <SeoHead
        title="Acesso à Informação e e-SIC - Câmara Municipal de Sumé"
        description="Serviço de Informação ao Cidadão (SIC) da Câmara Municipal de Sumé. Endereço, telefone, horário e pedidos via e-SIC."
        url="/acesso-a-informacao"
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Acesso à Informação" }]} />
        <PageHero
          badge="LAI — Lei 12.527/2011"
          title="Serviço de Informação ao Cidadão"
          subtitle="Unidade responsável pelo atendimento presencial e canal eletrônico (e-SIC)"
          centered
        />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
              <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="card-modern p-8">
                  <h2 className="text-xl font-bold text-foreground mb-2">Unidade responsável</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Setor de Comunicação e Relações Institucionais — autoridade de monitoramento
                    do acesso à informação na Câmara Municipal de Sumé.
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">Endereço</p>
                        <p className="text-sm text-muted-foreground">{address}</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">{phone}</p>
                        <p className="text-sm text-muted-foreground">Telefone do SIC</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <a href={`mailto:${email}`} className="font-medium text-foreground hover:text-primary">
                          {email}
                        </a>
                        <p className="text-sm text-muted-foreground">E-mail do SIC</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">{hours}</p>
                        <p className="text-sm text-muted-foreground">Horário de atendimento presencial</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="card-modern p-8 flex flex-col">
                  <h2 className="text-xl font-bold text-foreground mb-2">Pedido eletrônico (e-SIC)</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Solicite informações públicas pelo sistema eletrônico, sem necessidade de
                    justificar o motivo. Prazo de resposta: até 20 dias, prorrogáveis por mais 10.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 mb-8">
                    <a
                      href={esicUrl}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="btn-modern flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold no-underline"
                    >
                      <Send className="w-5 h-5" />
                      Nova demanda
                      {external && <ExternalLink className="w-4 h-4 opacity-70" />}
                    </a>
                    <a
                      href={esicUrl}
                      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="btn-modern flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gold text-navy-dark text-sm font-semibold no-underline"
                    >
                      <Search className="w-5 h-5" />
                      Consultar demanda
                    </a>
                  </div>
                  <a
                    href="/acesso-a-informacao/lai"
                    className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline no-underline"
                  >
                    <Scale className="w-4 h-4" />
                    Regulamentação da LAI na Câmara
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
