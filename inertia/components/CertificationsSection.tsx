import { ExternalLink, Award } from "lucide-react";
import { SectionHeading } from "~/components/SectionHeading";

interface Seal {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl?: string;
}

interface CertificationsSectionProps {
  seals?: Seal[];
  title?: string;
  subtitle?: string;
}

export const CertificationsSection = ({ seals = [], title, subtitle }: CertificationsSectionProps) => {
  // Sem selos cadastrados: não renderiza a seção (evita seção vazia na home).
  if (seals.length === 0) {
    return null;
  }

  // Grid adapta ao número de selos: 1 → estreito/centralizado, 2 → 2 colunas, 3+ → 3 colunas.
  const gridClass =
    seals.length === 1
      ? "grid grid-cols-1 gap-6 max-w-md mx-auto"
      : seals.length === 2
        ? "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto"
        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto";

  // Com poucos selos a seção fica compacta (evita uma faixa navy alta e vazia);
  // com 3+ usa o respiro padrão do section-block.
  const sectionClass =
    seals.length <= 2 ? 'bg-gradient-hero py-12 lg:py-16' : 'section-block bg-gradient-hero'

  return (
    <section className={sectionClass}>
      <div className="container min-w-0">
        <SectionHeading
          tone="dark"
          badge="Certificações"
          title={title || "Compromisso com a Transparência"}
          subtitle={
            subtitle ||
            "A Câmara Municipal é reconhecida por seu compromisso com a transparência pública e combate à corrupção."
          }
        />

        <div className={gridClass}>
          {seals.map((seal, index) => (
            <div
              key={seal.id}
              className="flex flex-col items-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 transition-colors duration-300 hover-lift group"
              data-reveal="zoom"
              data-reveal-delay={index * 100}
            >
              {/* Selo sobre um glow/disco translúcido sutil para legibilidade em fundos transparentes */}
              <div className="relative mb-6 flex items-center justify-center">
                <div
                  className="absolute inset-0 m-auto h-28 w-28 rounded-full bg-white/10 blur-xl"
                  aria-hidden="true"
                />
                {seal.imageUrl ? (
                  <img
                    src={seal.imageUrl}
                    alt={seal.title}
                    loading="lazy"
                    decoding="async"
                    className="relative h-32 md:h-36 w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="relative h-32 w-32 rounded-full bg-white/10 flex items-center justify-center ring-1 ring-white/20">
                    <Award className="h-14 w-14 text-white" />
                  </div>
                )}
              </div>

              <h3 className="text-lg md:text-xl font-bold text-center text-white mb-2">{seal.title}</h3>

              {seal.description && (
                <p className="text-white/70 text-sm text-center mb-6">{seal.description}</p>
              )}

              {seal.linkUrl && (
                <div className="mt-auto text-center">
                  <a
                    href={seal.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white hover:text-navy-dark transition-colors no-underline"
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
