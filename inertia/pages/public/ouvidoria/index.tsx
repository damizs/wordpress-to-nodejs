import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { MessageSquare, Phone, Mail, Clock, MapPin, Send, FileText, AlertCircle, ThumbsUp, HelpCircle } from "lucide-react";

const channels = [
  { icon: MessageSquare, title: "Denúncias", description: "Relate irregularidades de forma sigilosa", color: "bg-navy/10 text-navy dark:bg-sky/10 dark:text-sky" },
  { icon: HelpCircle, title: "Solicitações", description: "Solicite informações ou serviços", color: "bg-sky/10 text-sky" },
  { icon: AlertCircle, title: "Reclamações", description: "Registre sua insatisfação", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { icon: ThumbsUp, title: "Elogios", description: "Reconheça o bom atendimento", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
];

export default function OuvidoriaIndex() {
  return (
    <>
      <SeoHead title="Ouvidoria - Câmara Municipal de Sumé" description="Entre em contato com a Ouvidoria da Câmara Municipal de Sumé. Faça denúncias, reclamações, sugestões ou elogios." url="/ouvidoria" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Ouvidoria" }]} />
        <PageHero badge="Cidadão" title="Ouvidoria" subtitle="Canal de comunicação direta entre o cidadão e a Câmara Municipal" centered />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
            <div className="max-w-4xl mx-auto">

              {/* Channels */}
              <div data-reveal="up" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                {channels.map((channel, index) => (
                  <div key={index} className="card-modern p-5 text-center">
                    <div className={`w-12 h-12 mx-auto rounded-xl ${channel.color} flex items-center justify-center mb-3`}>
                      <channel.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">{channel.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{channel.description}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Contact Form */}
                <div className="card-modern p-6">
                  <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Send className="w-5 h-5 text-primary" />Entre em Contato
                  </h2>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Nome</label>
                      <input type="text" className="w-full px-4 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">E-mail</label>
                      <input type="email" className="w-full px-4 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Tipo</label>
                      <select className="w-full px-4 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20">
                        <option>Denúncia</option>
                        <option>Reclamação</option>
                        <option>Solicitação</option>
                        <option>Sugestão</option>
                        <option>Elogio</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Mensagem</label>
                      <textarea rows={4} className="w-full px-4 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"></textarea>
                    </div>
                    <button type="submit" className="w-full btn-modern bg-primary text-primary-foreground">Enviar</button>
                  </form>
                </div>

                {/* Contact Info */}
                <div className="space-y-6">
                  <div className="card-modern p-6">
                    <h2 className="font-bold text-foreground mb-4">Informações de Contato</h2>
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
                          <p className="font-medium text-foreground">ouvidoria@camaradesume.pb.gov.br</p>
                          <p className="text-sm text-muted-foreground">E-mail</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Segunda a Sexta: 08h às 14h</p>
                          <p className="text-sm text-muted-foreground">Horário de Atendimento</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Praça Luiz Gaudêncio, S/N - Centro</p>
                          <p className="text-sm text-muted-foreground">Sumé - PB, CEP: 58540-000</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="card-modern p-6 bg-primary/5">
                    <h3 className="font-semibold text-foreground mb-2">Prazo de Resposta</h3>
                    <p className="text-sm text-muted-foreground">A Ouvidoria tem prazo de até 20 dias para responder às manifestações, podendo ser prorrogado por mais 10 dias mediante justificativa.</p>
                  </div>
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
