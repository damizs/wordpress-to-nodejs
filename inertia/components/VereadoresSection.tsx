import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import { InfiniteCarousel } from "~/components/InfiniteCarousel";
import { SectionHeading } from "~/components/SectionHeading";

interface Vereador {
  id: number;
  nome: string;
  apelido: string;
  cargo: string;
  foto: string | null;
  slug: string;
  ativo: boolean;
}

interface VereadoresSectionProps {
  vereadores?: Vereador[];
  legislatura?: string;
  title?: string;
  subtitle?: string;
}

export const VereadoresSection = ({
  vereadores = [],
  legislatura = "2025-2028",
  title = "Mesa Diretora e Vereadores",
  subtitle,
}: VereadoresSectionProps) => {
  if (vereadores.length === 0) {
    return null;
  }

  return (
    <section className="py-14 lg:py-20 px-4 bg-background">
      <div className="container mx-auto">
        {/* Header */}
        <SectionHeading
          badge={`Legislatura ${legislatura}`}
          title={title}
          subtitle={subtitle || `Composição da Mesa Diretora e parlamentares da Legislatura ${legislatura}`}
        />

        {/* Carrossel infinito automático */}
        <div data-reveal>
          <InfiniteCarousel ariaLabel="Vereadores" gapClass="gap-6" className="pb-1">
            {vereadores.map((vereador) => (
              <div
                key={vereador.id}
                className="shrink-0 w-[85vw] sm:w-[42vw] lg:w-[28vw] xl:w-[21vw]"
              >
                <Link href={`/vereadores/${vereador.slug}`} className="no-underline">
                  <div className="card-modern overflow-hidden group">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {vereador.ativo && (
                        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-navy-dark/90 text-white text-[10px] font-bold tracking-wide rounded-md shadow-lg">
                          EM EXERCÍCIO
                        </span>
                      )}
                      <img
                        src={vereador.foto || "/images/placeholder-vereador.jpg"}
                        alt={vereador.nome}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-foreground text-sm leading-tight mb-2 line-clamp-2">
                        {vereador.nome.toUpperCase()}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3">{vereador.apelido}</p>
                      <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 text-primary text-xs font-semibold rounded-full">
                        {vereador.cargo}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </InfiniteCarousel>
        </div>

        {/* View More Link */}
        <div className="text-center mt-12">
          <Link
            href="/vereadores"
            className="btn-modern inline-flex items-center gap-3 bg-gradient-to-r from-primary to-navy-light text-primary-foreground shadow-lg hover:shadow-xl hover:gap-4 no-underline"
          >
            Ver todos os vereadores
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
