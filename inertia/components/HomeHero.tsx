import { Link } from "@inertiajs/react";
import { ArrowRight, Shield, MessageSquare } from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";
import { NewsHeroPanel, type NewsItem } from "~/components/NewsSection";

interface HomeHeroProps {
  /** Modelo do site ativo (data-template). */
  template: string;
  /** Notícias da home (modelo Moderno: coluna direita do hero). */
  news?: NewsItem[];
  /** Imagem de fundo (mesma da seção de notícias). */
  backgroundImage?: string | null;
}

/**
 * Hero de abertura da home, exibido apenas nos modelos com `homeHero: true`
 * (lib/templates.ts): "classico" e "moderno". Traz o <h1> real da home — útil
 * para acessibilidade quando o cabeçalho usa logo (sem h1 textual).
 *
 * Modelo Moderno: hero unificado — texto institucional à esquerda, notícias à
 * direita, fundo com a imagem configurada no painel (Homepage → Notícias).
 */
export function HomeHero({ template, news = [], backgroundImage }: HomeHeroProps) {
  const settings = useSiteSettings();
  const title = settings.header_title || "Câmara Municipal de Sumé";
  const subtitle = settings.header_subtitle || "Estado da Paraíba";
  const tagline =
    settings.footer_description ||
    "Acompanhe o trabalho do Legislativo: transparência, participação e serviço ao cidadão.";

  const primaryBtn =
    "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-navy-dark text-sm font-semibold hover:opacity-90 transition-opacity no-underline";
  const ghostBtn =
    "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary-foreground/30 text-primary-foreground text-sm font-semibold hover:bg-primary-foreground/10 transition-colors no-underline";

  if (template === "moderno") {
    const hasNews = news.length > 0;

    return (
      <section className="relative text-primary-foreground overflow-hidden">
        {/* Fundo — imagem da seção de notícias ou gradiente fallback */}
        {backgroundImage ? (
          <div className="absolute inset-0 overflow-hidden">
            <img src={backgroundImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-navy-dark/85" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-hero">
            <div className="absolute -top-1/3 -right-1/4 w-[28rem] h-[28rem] bg-gold/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-1/3 -left-1/4 w-[28rem] h-[28rem] bg-sky/10 rounded-full blur-3xl" />
          </div>
        )}

        <div className="relative container py-14 lg:py-20">
          <div
            className={`grid gap-10 lg:gap-14 items-start ${
              hasNews ? "lg:grid-cols-2 lg:items-center" : "max-w-3xl"
            }`}
          >
            <div data-reveal="fade-right">
              <span className="inline-block text-xs font-semibold uppercase tracking-wider text-gold mb-3">
                {subtitle}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                {title}
              </h1>
              <p className="mt-5 text-lg text-primary-foreground/80 max-w-xl leading-relaxed">
                {tagline}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/transparencia" className={primaryBtn}>
                  Transparência
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link href="/noticias" className={ghostBtn}>
                  Últimas notícias
                </Link>
              </div>
            </div>

            {hasNews && <NewsHeroPanel news={news} />}
          </div>
        </div>

        {hasNews && (
          <div className="relative bg-navy-dark/90 backdrop-blur-sm border-t border-primary-foreground/10">
            <div className="container py-4 flex justify-end">
              <Link
                href="/noticias"
                className="group inline-flex items-center gap-3 px-6 py-2.5 bg-primary-foreground/10 hover:bg-gold hover:text-navy-dark rounded-full text-primary-foreground font-medium no-underline transition-all duration-300"
              >
                Ver mais notícias
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </section>
    );
  }

  // Modelo clássico: hero institucional centralizado e enxuto.
  return (
    <section className="bg-gradient-hero text-primary-foreground">
      <div className="container py-12 lg:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-gold mb-3">
            {subtitle}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight">
            {title}
          </h1>
          <p className="mt-4 text-primary-foreground/80 leading-relaxed">{tagline}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/transparencia" className={primaryBtn}>
              <Shield className="w-4 h-4" aria-hidden="true" />
              Transparência
            </Link>
            <Link href="/ouvidoria" className={ghostBtn}>
              <MessageSquare className="w-4 h-4" aria-hidden="true" />
              Ouvidoria
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
