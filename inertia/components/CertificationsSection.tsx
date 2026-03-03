import { ExternalLink, Award, Shield, CheckCircle } from "lucide-react";

interface Seal {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl?: string;
}

interface CertificationsSectionProps {
  seals?: Seal[];
}

export const CertificationsSection = ({ seals = [] }: CertificationsSectionProps) => {
  if (seals.length === 0) {
    return (
      <section className="py-16 px-4 bg-gradient-to-r from-primary/5 via-gold/5 to-sky/5">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex items-center gap-4 animate-fade-in">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-glow">
                  <Award className="w-12 h-12 text-navy-dark" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-4 border-background">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg">Selo de Transparência</h3>
                <p className="text-sm text-muted-foreground">Compromisso com a gestão pública</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-16 bg-border" />
            <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground">Lei de Acesso à Informação</p>
                <p className="text-sm text-muted-foreground">Lei nº 12.527/2011</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-gradient-navy text-white">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            Certificações
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Compromisso com a Transparência</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            A Câmara Municipal de Sumé é reconhecida por seu compromisso com a transparência pública.
          </p>
        </div>
        <div className={`grid gap-6 max-w-5xl mx-auto ${seals.length === 1 ? 'grid-cols-1 max-w-md' : seals.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {seals.map((seal) => (
            <div key={seal.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
              <div className="flex justify-center mb-6">
                {seal.imageUrl ? (
                  <img src={seal.imageUrl} alt={seal.title} className="h-40 w-auto object-contain group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gold/20 flex items-center justify-center">
                    <Award className="w-16 h-16 text-gold" />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-center mb-2">{seal.title}</h3>
              {seal.description && <p className="text-white/60 text-sm text-center mb-4">{seal.description}</p>}
              {seal.linkUrl && (
                <div className="text-center">
                  <a href={seal.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-navy rounded-lg text-sm font-medium hover:bg-gold hover:text-navy-dark transition-colors">
                    Saiba Mais
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
