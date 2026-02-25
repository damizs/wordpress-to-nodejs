import { Instagram, ExternalLink } from "lucide-react";

export const InstagramFeedSection = () => {
  return (
    <section className="py-20 px-4 section-gradient">
      <div className="container mx-auto">
        <div className="text-center mb-14 animate-fade-in">
          <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            Redes Sociais
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Siga-nos no Instagram
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Acompanhe as atividades da Câmara Municipal em tempo real.
          </p>
        </div>

        <div className="flex justify-center">
          <a
            href="https://www.instagram.com/camaradesume"
            target="_blank"
            rel="noopener noreferrer"
            className="group card-modern p-8 flex flex-col items-center gap-4 no-underline max-w-md w-full"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
              <Instagram className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-foreground text-xl mb-2">@camaradesume</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Notícias, sessões e atividades legislativas
              </p>
              <span className="inline-flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                Seguir no Instagram
                <ExternalLink className="w-4 h-4" />
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};
