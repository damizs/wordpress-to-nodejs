import { useState, useEffect } from "react";
import { MapPin, Users, Mountain, History, ChevronLeft, ChevronRight, X, ArrowRight } from "lucide-react";
import { SectionHeading } from "~/components/SectionHeading";

interface ConhecaSumeSectionProps {
  images?: string[];
  title?: string;
  subtitle?: string;
}

export const ConhecaSumeSection = ({ images, title, subtitle }: ConhecaSumeSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const defaultImages = ["/images/sume-cidade.jpg"];
  const carouselImages = images && images.length > 0 ? images : defaultImages;
  const hasMultipleImages = carouselImages.length > 1;

  // Auto-play do crossfade (5 segundos); pausa no hover/lightbox e respeita prefers-reduced-motion
  useEffect(() => {
    if (!hasMultipleImages || isPaused || lightboxOpen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselImages.length, hasMultipleImages, isPaused, lightboxOpen]);

  const goToPrevious = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
  };

  // Trava o scroll do body enquanto o lightbox estiver aberto (com cleanup garantido)
  useEffect(() => {
    if (!lightboxOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [lightboxOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, carouselImages.length]);

  return (
    <>
      <section className="section-block bg-muted/40">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Image Carousel */}
            <div
              className="relative"
              data-reveal="left"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-gold/20 rounded-3xl blur-3xl" />

              <div
                className="relative rounded-3xl shadow-2xl overflow-hidden aspect-[4/3] cursor-pointer group ring-1 ring-border/60 border border-white/10"
                onClick={() => setLightboxOpen(true)}
              >
                {carouselImages.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`Sumé - Imagem ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                      index === currentIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                    onError={(e) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop";
                    }}
                  />
                ))}

                {/* Gradiente inferior para profundidade e legibilidade */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 via-black/20 to-transparent pointer-events-none" />

                {/* Selo/legenda discreta */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-sm px-3 py-1.5 text-[0.7rem] font-medium text-white/90 ring-1 ring-white/15">
                  <MapPin className="w-3.5 h-3.5 text-gold" />
                  Cariri Ocidental — Paraíba
                </div>

                {/* Overlay com hint de clique */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/55 backdrop-blur-sm px-3 py-1.5 rounded-full ring-1 ring-white/15">
                    Clique para ampliar
                  </span>
                </div>

                {/* Navigation Arrows */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={goToPrevious}
                      aria-label="Imagem anterior"
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm text-white ring-1 ring-white/15 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={goToNext}
                      aria-label="Próxima imagem"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-sm text-white ring-1 ring-white/15 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Dots Indicator */}
                {hasMultipleImages && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {carouselImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex(index);
                        }}
                        aria-label={`Ir para imagem ${index + 1}`}
                        className={`h-2.5 rounded-full transition-all ring-1 ring-black/10 ${
                          index === currentIndex
                            ? 'bg-gold w-6'
                            : 'bg-white/70 hover:bg-white w-2.5'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div data-reveal="right" data-reveal-delay={120}>
              <SectionHeading
                align="left"
                badge="Conheça Nossa Cidade"
                title={
                  title || (
                    <>
                      Sumé<br />
                      <span className="text-gradient-gold">Cariri Paraibano</span>
                    </>
                  )
                }
                subtitle={
                  subtitle ||
                  "Sumé, localizada no Cariri Ocidental da Paraíba, é uma cidade rica em história e cultura. Conhecida por sua hospitalidade e tradições, é um importante polo regional."
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="card-modern hover-lift flex items-center gap-3 p-4">
                  <span className="flex-shrink-0 grid place-items-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                    <MapPin className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold text-foreground leading-tight">838 km²</p>
                    <p className="text-xs text-muted-foreground">Área territorial</p>
                  </div>
                </div>
                <div className="card-modern hover-lift flex items-center gap-3 p-4">
                  <span className="flex-shrink-0 grid place-items-center w-11 h-11 rounded-xl bg-primary/10 text-primary">
                    <Users className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold text-foreground leading-tight">~16 mil</p>
                    <p className="text-xs text-muted-foreground">Habitantes</p>
                  </div>
                </div>
                <div className="card-modern hover-lift flex items-center gap-3 p-4">
                  <span className="flex-shrink-0 grid place-items-center w-11 h-11 rounded-xl bg-gold/10 text-gold">
                    <Mountain className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold text-foreground leading-tight">533m</p>
                    <p className="text-xs text-muted-foreground">Altitude média</p>
                  </div>
                </div>
                <div className="card-modern hover-lift flex items-center gap-3 p-4">
                  <span className="flex-shrink-0 grid place-items-center w-11 h-11 rounded-xl bg-gold/10 text-gold">
                    <History className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-2xl font-bold text-foreground leading-tight">1951</p>
                    <p className="text-xs text-muted-foreground">Emancipação</p>
                  </div>
                </div>
              </div>

              {/* CTA discreto */}
              <a
                href="/historia-da-camara"
                className="group/cta mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-gold transition-colors"
              >
                Conheça a história da Câmara
                <ArrowRight className="w-4 h-4 transition-transform group-hover/cta:translate-x-0.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Fechar visualização"
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Image Counter */}
          {hasMultipleImages && (
            <div className="absolute top-4 left-4 text-white/70 text-sm">
              {currentIndex + 1} / {carouselImages.length}
            </div>
          )}

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
            <img
              src={carouselImages[currentIndex]}
              alt={`Sumé - Imagem ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <button
                onClick={goToPrevious}
                aria-label="Imagem anterior"
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={goToNext}
                aria-label="Próxima imagem"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          {/* Thumbnails */}
          {hasMultipleImages && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto p-2">
              {carouselImages.map((src, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  aria-label={`Ir para imagem ${index + 1}`}
                  className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                    index === currentIndex
                      ? 'ring-2 ring-gold opacity-100'
                      : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};
