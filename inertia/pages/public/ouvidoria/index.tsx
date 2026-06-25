import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import {
  MessageSquare,
  Phone,
  Mail,
  Clock,
  MapPin,
  ExternalLink,
  AlertCircle,
  ThumbsUp,
  HelpCircle,
} from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";

const channels = [
  {
    icon: MessageSquare,
    title: "Denúncias",
    description: "Relate irregularidades de forma sigilosa",
    color: "bg-navy/10 text-navy dark:bg-sky/10 dark:text-sky",
  },
  {
    icon: HelpCircle,
    title: "Solicitações",
    description: "Solicite informações ou serviços",
    color: "bg-sky/10 text-sky",
  },
  {
    icon: AlertCircle,
    title: "Reclamações",
    description: "Registre sua insatisfação",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    icon: ThumbsUp,
    title: "Elogios",
    description: "Reconheça o bom atendimento",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
];

const DEFAULT_OUVIDORIA_URL = "https://atendimento.camaradesume.pb.gov.br/";

export default function OuvidoriaIndex() {
  const settings = useSiteSettings();
  const ouvidoriaUrl =
    settings.ouvidoria_url && settings.ouvidoria_url !== "#"
      ? settings.ouvidoria_url
      : DEFAULT_OUVIDORIA_URL;
  const isExternal = ouvidoriaUrl.startsWith("http");

  return (
    <>
      <SeoHead
        title="Ouvidoria - Câmara Municipal de Sumé"
        description="Canal de Ouvidoria da Câmara Municipal de Sumé. Denúncias, reclamações, sugestões e elogios."
        url="/ouvidoria"
      />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Ouvidoria" }]} />
        <PageHero
          badge="Cidadão"
          title="Ouvidoria"
          subtitle="Canal de comunicação direta entre o cidadão e a Câmara Municipal"
          centered
        />
        <main id="conteudo" tabIndex={-1}>
          <section className="py-10 lg:py-14">
            <div className="container">
              <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-12">
                {channels.map((channel, index) => (
                  <div key={index} className="card-modern p-4 sm:p-5 text-center">
                    <div
                      className={`w-12 h-12 mx-auto rounded-xl ${channel.color} flex items-center justify-center mb-3`}
                    >
                      <channel.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">{channel.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{channel.description}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="card-modern p-8 flex flex-col">
                  <h2 className="font-bold text-foreground mb-2 text-xl">Registrar manifestação</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    As manifestações são registradas no sistema oficial de Ouvidoria da Câmara.
                    Você receberá protocolo e poderá acompanhar o andamento online.
                  </p>
                  <a
                    href={ouvidoriaUrl}
                    {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="btn-modern inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold no-underline mb-4"
                  >
                    Acessar sistema de Ouvidoria
                    {isExternal && <ExternalLink className="w-4 h-4 opacity-80" />}
                  </a>
                  <p className="text-xs text-muted-foreground mt-auto">
                    Prazo de resposta: até 20 dias, prorrogáveis por mais 10 mediante
                    justificativa (Lei nº 13.460/2017).
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="card-modern p-6">
                    <h2 className="font-bold text-foreground mb-4">Atendimento presencial</h2>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">(83) 3353-1185</p>
                          <p className="text-sm text-muted-foreground">Telefone</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">
                            ouvidoria@camaradesume.pb.gov.br
                          </p>
                          <p className="text-sm text-muted-foreground">E-mail</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">
                            Segunda a Sexta: 08h às 14h
                          </p>
                          <p className="text-sm text-muted-foreground">Horário de atendimento</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">
                            Praça Luiz Gaudêncio, S/N - Centro
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Sumé - PB, CEP: 58540-000
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>
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
