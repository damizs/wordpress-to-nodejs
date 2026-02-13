import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const imagens = [
  { url: "/placeholder-news.svg", alt: "Vista panorâmica de Sumé" },
  { url: "/placeholder-news.svg", alt: "Igreja histórica" },
  { url: "/placeholder-news.svg", alt: "Serra de Sumé" },
  { url: "/placeholder-news.svg", alt: "Natureza local" },
  { url: "/placeholder-news.svg", alt: "Paisagem regional" },
];

interface ConhecaSumeSectionProps {
  title?: string | null;
  subtitle?: string | null;
}

export const ConhecaSumeSection = ({ title, subtitle }: ConhecaSumeSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? imagens.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === imagens.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            {title || 'Conheça Sumé'}
          </h2>
          {subtitle && <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
        </div>

        {/* Gallery Carousel */}
        <div className="relative max-w-6xl mx-auto">
          <div className="overflow-hidden rounded-xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 25}%)` }}
            >
              {imagens.map((img, index) => (
                <div 
                  key={index}
                  className="min-w-[25%] px-2 animate-fade-in"
                >
                  <div className="aspect-[3/2] rounded-xl overflow-hidden">
                    <img 
                      src={img.url}
                      alt={img.alt}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/90 border border-border shadow-lg flex items-center justify-center hover:bg-card transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/90 border border-border shadow-lg flex items-center justify-center hover:bg-card transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {imagens.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentIndex === index ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
