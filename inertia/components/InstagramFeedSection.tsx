import { Instagram, ExternalLink } from "lucide-react";

const instagramPosts = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=400&h=400&fit=crop",
    title: "Sessão Extraordinária",
    likes: 234,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=400&fit=crop",
    title: "Homenagem aos Servidores",
    likes: 189,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=400&h=400&fit=crop",
    title: "Audiência Pública",
    likes: 312,
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=400&h=400&fit=crop",
    title: "Transparência em Ação",
    likes: 276,
  },
];

export const InstagramFeedSection = () => {
  return (
    <section className="py-16 px-4 bg-gradient-navy text-primary-foreground">
      <div className="container mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <span className="inline-block px-4 py-1.5 bg-gold/20 text-gold rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            Redes Sociais
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Siga-nos no Instagram
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
            Acompanhe as atividades da Câmara Municipal de Sumé em tempo real
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {instagramPosts.map((post, index) => (
            <a
              key={post.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden animate-fade-in no-underline"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-12 h-12 rounded-full bg-gold/90 flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-navy-dark" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p className="text-sm font-medium text-primary-foreground truncate">{post.title}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-modern inline-flex items-center gap-3 bg-gold text-navy-dark shadow-lg hover:shadow-glow no-underline"
          >
            <Instagram className="w-5 h-5" />
            Seguir @camaradesume
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};
