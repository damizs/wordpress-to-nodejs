import { Link } from "@inertiajs/react";
import { FileSearch, Clock, CheckCircle, Users, ArrowRight } from "lucide-react";

const features = [
  { icon: FileSearch, title: "Solicite Informações", description: "Faça sua solicitação de forma simples e rápida" },
  { icon: Clock, title: "Prazo de 20 dias", description: "Resposta garantida por lei no prazo legal" },
  { icon: CheckCircle, title: "Acompanhe o Status", description: "Monitore sua solicitação em tempo real" },
  { icon: Users, title: "Atendimento Humanizado", description: "Equipe especializada pronta para ajudar" },
];

export const ESicSection = () => {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-primary-foreground animate-fade-in">
            <span className="inline-block px-4 py-1.5 bg-gold/20 text-gold rounded-full text-xs font-semibold tracking-wider uppercase mb-6">
              Lei de Acesso à Informação
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              e-SIC<br />
              <span className="text-gradient-gold">Serviço de Informação ao Cidadão</span>
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 leading-relaxed">
              Acesse documentos, relatórios e informações públicas de forma simples e transparente. 
              Seu direito de saber é garantido pela Lei nº 12.527/2011.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/e-sic"
                className="btn-modern inline-flex items-center justify-center gap-3 bg-gold text-navy-dark hover:bg-gold-light no-underline"
              >
                Acessar e-SIC
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/perguntas-frequentes"
                className="btn-modern inline-flex items-center justify-center gap-3 glass text-primary-foreground hover:bg-white/10 no-underline"
              >
                Perguntas Frequentes
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="glass rounded-2xl p-6 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-bold text-primary-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-primary-foreground/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
