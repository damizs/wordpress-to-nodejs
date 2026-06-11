import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ConhecaSumeSectionProps {
  images?: string[];
  title?: string;
  subtitle?: string;
}

function usePerPage() {
  const [count, setCount] = useState(4);
  useEffect(() => {
    const update = () => setCount(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 4);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return count;
}

export const ConhecaSumeSection = ({ images, title }: ConhecaSumeSectionProps) => {
  const defaultImages = ["/images/sume-cidade.jpg"];
  const carouselImages = images && images.length > 0 ? images : defaultImages;
  const perPage = usePerPage();
  const [start, setStart] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const canScroll = carouselImages.length > perPage;

  const next = () => setStart((s) => (s + 1) % carouselImages.length);
  const prev = () => setStart((s) => (s - 1 + carouselImages.length) % carouselImages.length);

  // Autoplay da fita de fotos
  useEffect(() => {
    if (!canScroll || isPaused || lightboxIndex !== null) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [canScroll, isPaused, lightboxIndex, carouselImages.length]);

  const visible = Array.from({ length: Math.min(perPage, carouselImages.length) }).map(
    (_, i) => (start + i) % carouselImages.length
  );

  // Navegação por teclado no lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => (i! - 1 + carouselImages.length) % carouselImages.length);
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i! + 1) % carouselImages.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, carouselImages.length]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = "hidden";
  };
  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = "";
  };

  return (
    <>
      <section data-reveal>
        {/* Faixa navy com o título (padrão do portal) */}
        <div className="bg-gradient-hero py-4">
          <h2 className="text-center text-primary-foreground text-xl md:text-2xl font-bold">
            {title || "Conheça Sumé - PB"}
          </h2>
        </div>

        {/* Fita de fotos */}
        <div
          className="relative bg-background py-8 px-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="container mx-auto">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 px-10">
              {visible.map((imgIndex) => (
                <button
                  key={imgIndex}
                  onClick={() => openLightbox(imgIndex)}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl group shadow-md"
                  aria-label={`Ampliar foto ${imgIndex + 1} de Sumé`}
                >
                  <img
                    src={carouselImages[imgIndex]}
                    alt={`Sumé - Imagem ${imgIndex + 1}`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>

            {canScroll && (
              <>
                <button
                  onClick={prev}
                  aria-label="Fotos anteriores"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card shadow-lg border border-border/60 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  aria-label="Próximas fotos"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card shadow-lg border border-border/60 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="flex justify-center gap-1.5 mt-5">
                  {carouselImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStart(i)}
                      aria-label={`Ir para foto ${i + 1}`}
                      className={`h-2 rounded-full transition-all ${i === start ? "bg-primary w-5" : "bg-border w-2 hover:bg-muted-foreground/40"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10">
            <X className="w-8 h-8" />
          </button>
          <div className="absolute top-4 left-4 text-white/70 text-sm">
            {lightboxIndex + 1} / {carouselImages.length}
          </div>
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
            <img
              src={carouselImages[lightboxIndex]}
              alt={`Sumé - Imagem ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {carouselImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex - 1 + carouselImages.length) % carouselImages.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((lightboxIndex + 1) % carouselImages.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
};
