import { useState, useEffect } from "react";
import { MapPin, Users, Mountain, History, ChevronLeft, ChevronRight } from "lucide-react";

interface ConhecaSumeSectionProps {
  images?: string[];
}

export const ConhecaSumeSection = ({ images }: ConhecaSumeSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const defaultImages = ["/images/sume-cidade.jpg"];
  const carouselImages = images && images.length > 0 ? images : defaultImages;
  const hasMultipleImages = carouselImages.length > 1;

  useEffect(() => {
    if (!hasMultipleImages) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselImages.length, hasMultipleImages]);

  const goToPrevious = () => setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  const goToNext = () => setCurrentIndex((prev) => (prev + 1) % carouselImages.length);

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Carousel */}
          <div className="relative animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-gold/20 rounded-3xl blur-3xl" />
            <div className="relative rounded-3xl shadow-2xl overflow-hidden aspect-[4/3]">
              {carouselImages.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`Sumé - Imagem ${index + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=600&fit=crop"; }}
                />
              ))}
              {hasMultipleImages && (
                <>
                  <button onClick={goToPrevious} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all">
                    <ChevronLeft className="w-5 h-5 text-gray-800" />
                  </button>
                  <button onClick={goToNext} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all">
                    <ChevronRight className="w-5 h-5 text-gray-800" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {carouselImages.map((_, index) => (
                      <button key={index} onClick={() => setCurrentIndex(index)} className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentIndex ? 'bg-gold w-6' : 'bg-white/60 hover:bg-white/80'}`} />
                    ))}
                  </div>
                </>
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
  );
};
