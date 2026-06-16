import { Link } from "@inertiajs/react";
import { ArrowRight, Shield, MessageSquare } from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";

interface FeaturedNews {
  title: string;
  excerpt: string;
  image: string | null;
  slug: string;
}

interface HomeHeroProps {
  /** Modelo do site ativo (data-template). */
  template: string;
  /** Notícia em destaque (usada no modelo "moderno"). */
  featured?: FeaturedNews | null;
}

/**
 * Hero de abertura da home, exibido apenas nos modelos com `homeHero: true`
 * (lib/templates.ts): "classico" e "moderno". Traz o <h1> real da home — útil
 * para acessibilidade quando o cabeçalho usa logo (sem h1 textual).
 *
 * Dark-safe: usa tokens (--primary-foreground, --gold). Não recolore nada fora
 * do hero; combina com qualquer tema/campanha.
 */
export function HomeHero({ template, featured }: HomeHeroProps) {
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
    return (
      <section className="relative bg-gradient-hero text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/3 -right-1/4 w-[28rem] h-[28rem] bg-gold/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/3 -left-1/4 w-[28rem] h-[28rem] bg-sky/10 rounded-full blur-3xl" />
        </div>
        <div className="relative container py-14 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
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

            {featured && (
              <Link
                href={`/noticias/${featured.slug}`}
                className="group block rounded-3xl overflow-hidden border border-primary-foreground/15 bg-primary-foreground/5 hover:bg-primary-foreground/10 transition-colors no-underline"
                data-reveal="fade-left"
              >
                {featured.image && (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={featured.image}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gold">
                    Em destaque
                  </span>
                  <h2 className="mt-2 text-xl font-bold text-primary-foreground line-clamp-2">
                    {featured.title}
                  </h2>
                  {featured.excerpt && (
                    <p className="mt-2 text-sm text-primary-foreground/75 line-clamp-2">
                      {featured.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            )}
          </div>
        </div>
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
