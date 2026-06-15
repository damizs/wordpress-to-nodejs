import { Link } from "@inertiajs/react";
import { Instagram, ExternalLink, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SectionHeading } from "~/components/SectionHeading";

interface InstagramPost {
  id: number;
  title: string;
  excerpt: string;
  image: string | null;
  slug: string | null;
  instagramUrl: string | null;
  date: string;
}

interface InstagramFeedSectionProps {
  posts?: InstagramPost[];
  instagramUrl?: string;
}

const DEFAULT_PROFILE = "https://www.instagram.com/camaradesume";

export const InstagramFeedSection = ({ posts = [], instagramUrl }: InstagramFeedSectionProps) => {
  const profileUrl = instagramUrl || DEFAULT_PROFILE;
  const handle = "@" + (profileUrl.replace(/\/+$/, "").split("/").pop() || "instagram");
  const scrollerRef = useRef<HTMLDivElement>(null);
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
  }, [updateEdges, posts.length]);

  const scrollByPage = useCallback((direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  }, []);

  return (
    <section className="py-14 lg:py-20 px-4 bg-background">
      <div className="container mx-auto">
        <SectionHeading
          badge="Redes Sociais"
          title="Siga-nos no Instagram"
          subtitle="Acompanhe as atividades da Câmara Municipal em tempo real."
        />

        {posts.length > 0 ? (
          <>
            {/* Profile header */}
            <div className="flex items-center justify-center gap-3 mb-10" data-reveal>
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[3px]">
                <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <a
                  href={profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-foreground text-lg hover:text-primary transition-colors no-underline"
                >
                  {handle}
                </a>
                <p className="text-muted-foreground text-sm">Publicações importadas automaticamente</p>
              </div>
            </div>

            {/* Carousel */}
            <div className="relative px-8" data-reveal>
              <div
                ref={scrollerRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {posts.map((post) => {
                  const card = (
                    <div className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all group h-full">
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        {post.image ? (
                          <img
                            src={post.image}
                            alt={post.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Instagram className="w-12 h-12 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-foreground text-sm mb-1 line-clamp-2">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                          <Calendar className="w-3.5 h-3.5" />
                          {post.date}
                        </div>
                      </div>
                    </div>
                  );
                  return (
                    <div
                      key={post.id}
                      className="snap-start shrink-0 w-[85%] sm:w-[45%] lg:w-[23.5%] animate-fade-in"
                    >
                      {post.slug ? (
                        <Link href={`/noticias/${post.slug}`} className="no-underline block h-full">
                          {card}
                        </Link>
                      ) : (
                        <a
                          href={post.instagramUrl || profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="no-underline block h-full"
                        >
                          {card}
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>

              {posts.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Posts anteriores"
                    onClick={() => scrollByPage(-1)}
                    disabled={!canPrev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    type="button"
                    aria-label="Próximos posts"
                    onClick={() => scrollByPage(1)}
                    disabled={!canNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>
                </>
              )}
            </div>

            <div className="text-center mt-10">
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all no-underline"
              >
                Seguir {handle} no Instagram
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </>
        ) : (
          <div className="flex justify-center">
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group card-modern p-8 flex flex-col items-center gap-4 no-underline max-w-md w-full"
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Instagram className="w-10 h-10 text-white" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-foreground text-xl mb-2">{handle}</h3>
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
        )}
      </div>
    </section>
  );
};
