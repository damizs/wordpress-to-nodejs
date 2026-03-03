import { useState, useEffect } from "react";
import { MapPin, Users, Mountain, History, ChevronLeft, ChevronRight, X } from "lucide-react";

interface ConhecaSumeSectionProps {
  images?: string[];
}

export const ConhecaSumeSection = ({ images }: ConhecaSumeSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const defaultImages = ["/images/sume-cidade.jpg"];
  const carouselImages = images && images.length > 0 ? images : defaultImages;
  const hasMultipleImages = carouselImages.length > 1;

  // Auto-play do carrossel (5 segundos)
  useEffect(() => {
    if (!hasMultipleImages || isPaused || lightboxOpen) return;
    
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

  const openLightbox = () => {
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, carouselImages.length]);

  return (
    <>
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Carousel */}
            <div 
              className="relative animate-fade-in"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-gold/20 rounded-3xl blur-3xl" />
              
              <div 
                className="relative rounded-3xl shadow-2xl overflow-hidden aspect-[4/3] cursor-pointer group"
                onClick={openLightbox}
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

                {/* Overlay com hint de clique */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-4 py-2 rounded-full">
                    Clique para ampliar
                  </span>
                </div>

                {/* Navigation Arrows */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-800" />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-800" />
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
                        className={`h-2.5 rounded-full transition-all ${
                          index === currentIndex 
                            ? 'bg-gold w-6' 
                            : 'bg-white/60 hover:bg-white/80 w-2.5'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
              <span className="inline-block px-4 py-1.5 bg-gold/10 text-gold rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
                Conheça Nossa Cidade
              </span>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                Sumé<br />
                <span className="text-gradient-gold">Cariri Paraibano</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Sumé, localizada no Cariri Ocidental da Paraíba, é uma cidade rica em história e cultura. 
                Conhecida por sua hospitalidade e tradições, é um importante polo regional.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <MapPin className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-bold text-foreground">838 km²</p>
                    <p className="text-xs text-muted-foreground">Área territorial</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <Users className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-bold text-foreground">~16 mil</p>
                    <p className="text-xs text-muted-foreground">Habitantes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <Mountain className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-bold text-foreground">533m</p>
                    <p className="text-xs text-muted-foreground">Altitude média</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <History className="w-6 h-6 text-primary" />
                  <div>
                    <p className="font-bold text-foreground">1951</p>
                    <p className="text-xs text-muted-foreground">Emancipação</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
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
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={goToNext}
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
