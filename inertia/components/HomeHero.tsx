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
  /** Limite de cards no painel de notícias do hero */
  newsLimit?: number;
}

/**
 * Hero de abertura da home, exibido apenas nos modelos com `homeHero: true`
 * (lib/templates.ts): "classico" e "moderno". Traz o <h1> real da home — útil
 * para acessibilidade quando o cabeçalho usa logo (sem h1 textual).
 *
 * Modelo Moderno: hero unificado — texto institucional à esquerda, notícias à
 * direita, fundo com a imagem configurada no painel (Homepage → Notícias).
 */
export function HomeHero({ template, news = [], backgroundImage, newsLimit }: HomeHeroProps) {
  const settings = useSiteSettings();
  const title = settings.header_title || "Câmara Municipal de Sumé";
  const subtitle = settings.header_subtitle || "Estado da Paraíba";
  const tagline =
    settings.footer_description ||
    "Acompanhe o trabalho do Legislativo: transparência, participação e serviço ao cidadão.";
  const [titleFirstWord, ...titleRest] = title.split(" ");

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
            <div className="absolute inset-0 bg-navy-dark/80" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-hero">
            <div className="absolute -top-1/3 -right-1/4 w-[28rem] h-[28rem] bg-gold/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-1/3 -left-1/4 w-[28rem] h-[28rem] bg-sky/10 rounded-full blur-3xl" />
          </div>
        )}

        {/* Ornamentos modernos — mesh + grade sobre o fundo */}
        <div className="absolute inset-0 template-modern-grid opacity-60 pointer-events-none" aria-hidden="true" />
        <div className="absolute inset-0 template-modern-mesh pointer-events-none" aria-hidden="true" />

        <div className="relative container py-10 sm:py-14 lg:py-20">
          <div
            className={`grid gap-8 lg:gap-10 xl:gap-12 items-start ${
              hasNews ? "lg:grid-cols-2" : "max-w-3xl"
            }`}
          >
            <div data-reveal="fade-right">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                  {subtitle}
                </span>
                <span className="h-px flex-1 max-w-16 bg-gradient-to-r from-gold/70 to-transparent" aria-hidden="true" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                {titleFirstWord}{" "}
                <span className="text-gradient-gold">{titleRest.join(" ")}</span>
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

            {hasNews && (
              <div
                className="relative rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.04] backdrop-blur-md p-1.5 sm:p-2 shadow-2xl"
                data-reveal="fade-left"
              >
                <div
                  className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-gold/25 to-transparent rounded-tr-2xl pointer-events-none"
                  aria-hidden="true"
                />
                <div
                  className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-gold/40 rounded-bl-2xl pointer-events-none"
                  aria-hidden="true"
                />
                <NewsHeroPanel news={news} limit={newsLimit} />
              </div>
            )}
          </div>
        </div>

        {hasNews && (
          <div className="relative bg-navy-dark/90 backdrop-blur-sm border-t border-primary-foreground/10">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" aria-hidden="true" />
            <div className="container py-4 flex justify-center sm:justify-end">
              <Link
                href="/noticias"
                className="group inline-flex items-center justify-center gap-3 w-full sm:w-auto px-6 py-2.5 bg-primary-foreground/10 hover:bg-gold hover:text-navy-dark rounded-full text-primary-foreground font-medium no-underline transition-all duration-300"
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

  // Modelo clássico: hero institucional ornamentado (governamental).
  return (
    <section className="relative bg-gradient-hero text-primary-foreground overflow-hidden">
      <div className="absolute inset-0 template-classico-grid opacity-55 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-0 left-0 right-0 template-gold-rule-solid opacity-90" aria-hidden="true" />

      <div className="relative container py-14 lg:py-20">
        <div className="max-w-3xl mx-auto text-center relative px-2">
          {/* Moldura ornamental */}
          <div
            className="absolute -inset-x-3 sm:-inset-x-6 -inset-y-4 sm:-inset-y-6 border border-gold/25 rounded-sm pointer-events-none hidden md:block"
            aria-hidden="true"
          >
            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-gold rotate-45" />
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 bg-gold rotate-45" />
          </div>

          <span className="inline-block text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-4">
            {subtitle}
          </span>
          <div className="template-gold-rule w-28 mx-auto mb-5 opacity-90" aria-hidden="true" />
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight template-serif">
            {titleFirstWord}{" "}
            <span className="text-gradient-gold">{titleRest.join(" ")}</span>
          </h1>
          <p className="mt-5 text-primary-foreground/85 leading-relaxed max-w-2xl mx-auto">{tagline}</p>
          <div className="template-gold-rule w-20 mx-auto mt-6 mb-7 opacity-60" aria-hidden="true" />
          <div className="flex flex-wrap justify-center gap-3">
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

      <div className="relative template-gold-rule-solid opacity-90" aria-hidden="true" />
    </section>
  );
}
