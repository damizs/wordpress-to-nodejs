import { ExternalLink } from "lucide-react";

interface Seal {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl?: string;
}

interface CertificationsSectionProps {
  seals?: Seal[];
}

export const CertificationsSection = ({ seals = [] }: CertificationsSectionProps) => {
  if (seals.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-gradient-navy text-white">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            Certificações
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Compromisso com a Transparência
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            A Câmara Municipal de Sumé é reconhecida por seu compromisso com a transparência pública.
          </p>
        </div>

        <div className={`grid gap-6 max-w-5xl mx-auto ${
          seals.length === 1 ? 'grid-cols-1 max-w-md' :
          seals.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl' :
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {seals.map((seal) => (
            <div
              key={seal.id}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="flex justify-center mb-6">
                <img
                  src={seal.imageUrl}
                  alt={seal.title}
                  className="h-40 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-bold text-center mb-2">{seal.title}</h3>
              <p className="text-white/60 text-sm text-center mb-4">{seal.description}</p>
              {seal.linkUrl && (
                <div className="text-center">
                  <a
                    href={seal.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-navy rounded-lg text-sm font-medium hover:bg-gold hover:text-navy-dark transition-colors"
                  >
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
