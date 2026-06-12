import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 1);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges, vereadores.length]);

  const scrollByPage = useCallback((direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  }, []);

  // Autoplay: avança a cada 5s e volta ao início; pausa no hover; respeita prefers-reduced-motion
  useEffect(() => {
    if (isPaused || vereadores.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: el.clientWidth * 0.9, behavior: "smooth" });
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, vereadores.length]);

  if (vereadores.length === 0) {
    return null;
  }

  return (
    <section className="py-14 lg:py-20 px-4 bg-background">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-14" data-reveal>
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            Legislatura {legislatura}
          </span>
          <h2 className="heading-accent text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {subtitle || `Composição da Mesa Diretora e parlamentares da Legislatura ${legislatura}`}
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative px-8"
          data-reveal
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={scrollerRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-2xl pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {vereadores.map((vereador) => (
              <div
                key={vereador.id}
                className="snap-start shrink-0 w-[85%] sm:w-[45%] lg:w-[31%] xl:w-[23.5%]"
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
          </div>

          {/* Navigation Buttons */}
          {vereadores.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => scrollByPage(-1)}
                disabled={!canPrev}
                aria-label="Vereadores anteriores"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card shadow-xl border border-border/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={() => scrollByPage(1)}
                disabled={!canNext}
                aria-label="Próximos vereadores"
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
