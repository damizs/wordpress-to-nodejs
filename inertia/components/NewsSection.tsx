import { Calendar, ArrowRight, Play } from "lucide-react";

const newsItems = [
  {
    id: 1,
    title: "Câmara de Sumé aprova crédito de quase R$1 milhão para Educação e Infraestrutura",
    excerpt: "A Câmara Municipal de Sumé realizou uma sessão extraordinária para aprovação de importantes projetos...",
    date: "29 Dez 2025",
    featured: true,
    image: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=800&h=600&fit=crop"
  },
  {
    id: 2,
    title: "Câmara de Sumé Recebe Selo Ouro da ATRICON por Transparência Pública",
    excerpt: "A Câmara Municipal foi agraciada com o Selo Ouro do Programa Nacional de Transparência...",
    date: "22 Dez 2025",
    image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=600&h=400&fit=crop"
  },
  {
    id: 3,
    title: "Transparência e Participação Cidadã nas Sessões",
    excerpt: "A Câmara mantém sua agenda de trabalho legislativo com participação ativa da população...",
    date: "20 Dez 2025",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&h=400&fit=crop"
  },
  {
    id: 4,
    title: "Participe da 2ª Audiência Pública sobre PPA e LOA",
    excerpt: "Convite à população para participar da audiência pública dedicada ao planejamento municipal...",
    date: "15 Dez 2025",
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&h=400&fit=crop"
  },
  {
    id: 5,
    title: "Centenário da Assembleia de Deus celebrado em sessão solene",
    excerpt: "A Câmara realizou sessão solene em homenagem ao centenário da igreja na cidade...",
    date: "17 Nov 2025",
    image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&h=400&fit=crop"
  },
];

export const NewsSection = () => {
  const featuredNews = newsItems.find((n) => n.featured);
  const otherNews = newsItems.filter((n) => !n.featured);

  return (
    <section className="relative bg-gradient-hero py-20 px-4 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-sky/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured News */}
          {featuredNews && (
            <article className="relative group cursor-pointer lg:row-span-2 animate-fade-in">
              <div className="relative h-full min-h-[450px] lg:min-h-[550px] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={featuredNews.image}
                  alt={featuredNews.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/70 to-transparent" />
                
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-20 h-20 rounded-full glass flex items-center justify-center animate-pulse-glow">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-gold text-sm mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>{featuredNews.date}</span>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-serif font-bold text-primary-foreground mb-4 group-hover:text-gold transition-colors duration-500 leading-tight">
                    {featuredNews.title}
                  </h2>
                  <p className="text-primary-foreground/80 text-base lg:text-lg line-clamp-2">
                    {featuredNews.excerpt}
                  </p>
                </div>
              </div>
            </article>
          )}

          {/* Other News Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {otherNews.map((news, index) => (
              <article
                key={news.id}
                className="relative group cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-56 rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={news.image}
                    alt={news.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="inline-block text-gold/80 text-xs mb-2">{news.date}</span>
                    <h3 className="text-sm font-serif font-bold text-primary-foreground group-hover:text-gold transition-colors duration-500 line-clamp-2 leading-snug">
                      {news.title}
                    </h3>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* View More Link */}
        <div className="text-center mt-12">
          <a
            href="#noticias"
            className="group inline-flex items-center gap-3 px-6 py-3 glass rounded-full text-gold hover:bg-gold hover:text-navy-dark transition-all duration-500 font-medium"
          >
            Ver mais notícias
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};
