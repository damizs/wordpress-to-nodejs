import { Instagram, Heart, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const posts = [
  { 
    imagem: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=400&h=400&fit=crop",
    titulo: "PARABÉNS, VEREADORA MARCELA! 🎉",
    descricao: "Hoje é um dia especial...",
    likes: 17,
    comments: 6
  },
  { 
    imagem: "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400&h=400&fit=crop",
    titulo: "FELIZ 2026, SUMÉ!",
    descricao: "Vereadoras e...",
    likes: 20,
    comments: 3
  },
  { 
    imagem: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=400&fit=crop",
    titulo: "SESSÃO EXTRAORDINÁRIA!",
    descricao: "Vereadores e...",
    likes: 49,
    comments: 2
  },
  { 
    imagem: "https://images.unsplash.com/photo-1560439514-4e9645039924?w=400&h=400&fit=crop",
    titulo: "DÁ PRA GANHAR O CONCURSO?",
    descricao: "Brincadeira!...",
    likes: 28,
    comments: 3
  },
];

export const InstagramFeedSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(posts.length - 4, prev + 1));
  };

  return (
    <section className="py-16 px-4 bg-background">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[3px]">
              <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-serif font-bold text-lg">C</span>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">camaradesume</h3>
              <p className="text-muted-foreground text-sm flex items-center gap-1">
                <Instagram className="w-4 h-4" />
                205 publicações
              </p>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex gap-6 transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 25}%)` }}
            >
              {posts.map((post, index) => (
                <div 
                  key={index}
                  className="min-w-[calc(25%-18px)] sm:min-w-[calc(50%-12px)] lg:min-w-[calc(25%-18px)] animate-fade-in"
                >
                  <div className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all group">
                    <div className="relative aspect-square overflow-hidden">
                      <img 
                        src={post.imagem}
                        alt={post.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-foreground text-sm mb-1 line-clamp-1">
                        {post.titulo}
                      </h4>
                      <p className="text-muted-foreground text-xs mb-3 line-clamp-1">
                        {post.descricao}
                      </p>
                      <div className="flex items-center gap-4 text-muted-foreground text-xs">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button 
            onClick={handleNext}
            disabled={currentIndex >= posts.length - 4}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((dot) => (
            <button
              key={dot}
              onClick={() => setCurrentIndex(dot)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentIndex === dot ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
