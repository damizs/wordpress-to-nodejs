import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useState } from "react";

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
}

export const VereadoresSection = ({ vereadores = [], legislatura = "2025-2028" }: VereadoresSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;
  const maxIndex = Math.max(0, vereadores.length - itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  if (vereadores.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 section-gradient">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-14 animate-fade-in">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            Legislatura {legislatura}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Mesa Diretora e Vereadores
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Composição da Mesa Diretora e parlamentares da Legislatura {legislatura}
          </p>
        </div>

        {/* Carousel */}
        <div className="relative px-8">
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-700 ease-out gap-6"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage + 2)}%)` }}
            >
              {vereadores.map((vereador, index) => (
                <div 
                  key={vereador.id} 
                  className="min-w-[calc(25%-18px)] sm:min-w-[calc(50%-12px)] lg:min-w-[calc(25%-18px)] animate-fade-in"
                >
                  <Link href={`/vereadores/${vereador.slug}`} className="no-underline">
                    <div className="card-modern overflow-hidden group">
                      <div className="relative aspect-[3/4] overflow-hidden">
                        {vereador.ativo && (
                          <span className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg">
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
            </div>
          </div>

          {/* Navigation Buttons */}
          {vereadores.length > itemsPerPage && (
            <>
              <button 
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card shadow-xl border border-border/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card shadow-xl border border-border/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
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
