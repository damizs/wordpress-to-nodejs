import { Send, Search, Clock, MapPin, Phone, Mail, ArrowRight } from "lucide-react";

export const ESicSection = () => {
  return (
    <section id="esic" className="py-20 px-4 bg-secondary/50 section-gradient">
      <div className="container mx-auto">
        <div className="text-center mb-14 animate-fade-in">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            Acesso à Informação
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
            E-SIC - Sistema Eletrônico de Informações
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Acesse informações públicas e solicite dados da administração municipal de forma transparente
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* E-SIC Card */}
          <div className="card-modern p-8 animate-fade-in">
            <h3 className="text-xl font-serif font-bold text-foreground mb-8">
              Sistema E-SIC
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <a
                href="#"
                className="btn-modern flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-navy-light text-primary-foreground shadow-lg hover:shadow-xl"
              >
                <Send className="w-5 h-5" />
                Nova Demanda
                <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
              </a>
              <a
                href="#"
                className="btn-modern flex-1 flex items-center justify-center gap-3 bg-gradient-gold text-accent-foreground shadow-lg hover:shadow-xl"
              >
                <Search className="w-5 h-5" />
                Consultar Demanda
              </a>
            </div>

            <div className="bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-6 border border-border/50">
              <h4 className="font-bold text-foreground mb-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                Como funciona o E-SIC?
              </h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-navy-light text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0 shadow-md">1</span>
                  <span className="pt-1">Cadastre sua solicitação de informação</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-navy-light text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0 shadow-md">2</span>
                  <span className="pt-1">Acompanhe o andamento do pedido</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-navy-light text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0 shadow-md">3</span>
                  <span className="pt-1">Receba a resposta em até 20 dias úteis</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Info Card */}
          <div className="relative overflow-hidden rounded-3xl p-8 text-primary-foreground animate-fade-in" style={{ animationDelay: "100ms" }}>
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-navy" />
            <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-sky/10" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-gold/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-sky/10 rounded-full blur-3xl" />
            
            <div className="relative">
              <h3 className="text-xl font-serif font-bold mb-8">
                Atendimento Presencial
              </h3>

              <div className="space-y-6">
                {[
                  { icon: MapPin, title: "Endereço", content: "Rua Luiz Grande, s/n - Centro\nCEP: 58540-000\nSumé - PB" },
                  { icon: Clock, title: "Horário de Atendimento", content: "Segunda à Sexta-feira\ndas 8h às 14h" },
                  { icon: Phone, title: "Telefone", content: "(83) 3353-1191" },
                  { icon: Mail, title: "E-mail", content: "contato@camaradesume.pb.gov.br" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-xl glass flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="w-5 h-5 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1 text-gold">{item.title}</h4>
                      <p className="text-sm opacity-80 whitespace-pre-line">{item.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
