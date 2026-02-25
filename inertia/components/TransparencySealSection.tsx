import seloTransparencia from "~/assets/selo-transparencia.png";
import seloCorrupcao from "~/assets/selo-prevencao-corrupcao.png";
import { ExternalLink } from "lucide-react";

export const TransparencySealSection = () => {
  return (
    <section className="py-16 px-4 bg-gradient-navy text-primary-foreground">
      <div className="container mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <span className="inline-block px-3 py-1 bg-gold/20 text-gold rounded-full text-xs font-semibold mb-4">
            CERTIFICAÇÕES
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
            Compromisso com a Transparência
          </h2>
          <p className="text-sm md:text-base opacity-80 max-w-2xl mx-auto">
            A Câmara Municipal de Sumé é reconhecida por seu compromisso com a transparência pública 
            e combate à corrupção.
          </p>
        </div>

        {/* Seals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Selo Transparência Ouro */}
          <div className="bg-primary-foreground/5 rounded-2xl p-6 flex flex-col items-center text-center animate-fade-in hover:bg-primary-foreground/10 transition-colors">
            <div className="w-36 h-36 md:w-44 md:h-44 mb-4">
              <img 
                src={seloTransparencia} 
                alt="Selo Qualidade em Transparência Ouro 2025" 
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            <h3 className="text-lg font-serif font-bold mb-2">
              Qualidade em Transparência
            </h3>
            <p className="text-sm opacity-70 mb-4">
              Selo Ouro concedido pelo Tribunal de Contas do Estado da Paraíba.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-navy-dark rounded-lg text-sm font-medium hover:bg-gold-light transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Saiba Mais
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Selo Prevenção à Corrupção */}
          <div className="bg-primary-foreground/5 rounded-2xl p-6 flex flex-col items-center text-center animate-fade-in hover:bg-primary-foreground/10 transition-colors">
            <div className="w-36 h-36 md:w-44 md:h-44 mb-4">
              <img 
                src={seloCorrupcao} 
                alt="Selo Programa Nacional de Prevenção à Corrupção - Participante" 
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            <h3 className="text-lg font-serif font-bold mb-2">
              Prevenção à Corrupção
            </h3>
            <p className="text-sm opacity-70 mb-4">
              Participante do Programa Nacional de Prevenção à Corrupção.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary-foreground/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Conhecer Programa
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Portal Link */}
        <div className="text-center mt-10 animate-fade-in">
          <a
            href="#transparencia"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-navy-dark rounded-lg font-medium hover:bg-gold-light transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Acessar Portal da Transparência
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
