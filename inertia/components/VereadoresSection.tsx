import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useState } from "react";

interface VereadoresSectionProps {
  councilors?: any[];
  title?: string | null;
  subtitle?: string | null;
  badge?: string | null;
}

export const VereadoresSection = ({ councilors, title, subtitle, badge }: VereadoresSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 4;

  const vereadores = councilors && councilors.length > 0 ? councilors : [];
  const maxIndex = Math.max(0, vereadores.length - itemsPerPage);

  if (vereadores.length === 0) return null;

  return (
    <section className="py-20 px-4 section-gradient">
      <div className="container mx-auto">
        <div className="text-center mb-14 animate-fade-in">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            {badge || 'Legislatura 2025-2028'}
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
            {title || 'Mesa Diretora e Vereadores'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {subtitle || 'Composição da Mesa Diretora e parlamentares'}
          </p>
        </div>

        <div className="relative px-8">
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-700 ease-out gap-6"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage + 2)}%)` }}
            >
              {vereadores.map((vereador: any, index: number) => (
                <div
                  key={vereador.id || index}
                  className="min-w-[calc(25%-18px)] sm:min-w-[calc(50%-12px)] lg:min-w-[calc(25%-18px)] animate-fade-in"
                >
                  <div className="card-modern overflow-hidden group">
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                      <span className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg">
                        EM EXERCÍCIO
                      </span>
                      {vereador.photo_url ? (
                        <img
                          src={vereador.photo_url}
                          alt={vereador.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-navy/5">
                          <Users className="w-16 h-16 text-navy/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-foreground text-sm leading-tight mb-2 line-clamp-2">
                        {vereador.name?.toUpperCase()}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3">{vereador.party || ''}</p>
                      <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 text-primary text-xs font-semibold rounded-full">
                        {vereador.role || 'Vereador'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {vereadores.length > itemsPerPage && (
            <>
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card shadow-xl border border-border/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))}
                disabled={currentIndex >= maxIndex}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card shadow-xl border border-border/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
