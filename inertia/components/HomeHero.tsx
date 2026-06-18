import { Link } from "@inertiajs/react";
import { ArrowRight, FileCheck2, Gavel, MessageSquare, Shield } from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";

interface HomeHeroProps {
  template: string;
  backgroundImage?: string | null;
}

const MODERN_SERVICE_LINKS = [
  {
    title: "Portal da Transparência",
    description: "Receitas, despesas, contratos e dados públicos.",
    href: "/transparencia",
    icon: Shield,
  },
  {
    title: "e-SIC",
    description: "Solicite informações com base na LAI.",
    href: "/esic",
    icon: FileCheck2,
  },
  {
    title: "Ouvidoria",
    description: "Envie manifestações, sugestões e pedidos.",
    href: "/ouvidoria",
    icon: MessageSquare,
  },
  {
    title: "Licitações",
    description: "Acompanhe editais, atas e documentos oficiais.",
    href: "/licitacoes",
    icon: Gavel,
  },
];

export function HomeHero({ template, backgroundImage }: HomeHeroProps) {
  const settings = useSiteSettings();
  const title = settings.header_title || "Câmara Municipal de Sumé";
  const subtitle = settings.header_subtitle || "Estado da Paraíba";
  const tagline =
    settings.footer_description ||
    "Acompanhe o trabalho do Legislativo: transparência, participação e serviço ao cidadão.";
  const [titleFirstWord, ...titleRest] = title.split(" ");
  const resolvedLogo = settings.logo_url || null;

  const primaryBtn =
    "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-navy-dark text-sm font-semibold hover:opacity-90 transition-opacity no-underline";
  const ghostBtn =
    "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary-foreground/30 text-primary-foreground text-sm font-semibold hover:bg-primary-foreground/10 transition-colors no-underline";

  if (template === "moderno") {
    return (
      <section className="relative overflow-hidden bg-navy-dark text-primary-foreground">
        {backgroundImage ? (
          <div className="absolute inset-0 overflow-hidden">
            <img src={backgroundImage} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/88 to-navy-dark/72" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-navy-dark/20" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-navy-dark" />
        )}

        <div className="absolute inset-0 template-modern-grid opacity-10 pointer-events-none" aria-hidden="true" />

        <div className="relative container py-10 sm:py-14 lg:py-20">
          <div className="max-w-4xl min-w-0" data-reveal="fade-right">
            {resolvedLogo && (
              <img
                src={resolvedLogo}
                alt=""
                className="mb-6 h-16 w-auto max-w-[260px] object-contain drop-shadow-2xl sm:h-20"
              />
            )}
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                {subtitle}
              </span>
              <span className="h-px flex-1 max-w-20 bg-gradient-to-r from-gold/70 to-transparent" aria-hidden="true" />
            </div>
            <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {titleFirstWord}{" "}
              <span className="text-gradient-gold">{titleRest.join(" ")}</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-primary-foreground/82 sm:text-xl">
              {tagline}
            </p>
            <div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row sm:mt-7">
              <Link href="/transparencia" className={primaryBtn}>
                Transparência
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/noticias" className={ghostBtn}>
                Últimas notícias
              </Link>
            </div>
          </div>

          <div
            className="mt-9 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4"
            data-reveal="fade-up"
          >
            {MODERN_SERVICE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl border border-primary-foreground/16 bg-primary-foreground/[0.09] p-3.5 text-primary-foreground no-underline shadow-lg backdrop-blur-md transition-all hover:-translate-y-1 hover:border-gold/55 hover:bg-primary-foreground/[0.14]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold text-navy-dark shadow-lg">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold leading-tight transition-colors group-hover:text-gold">
                    {item.title}
                  </span>
                  <span className="mt-1 block line-clamp-1 text-xs text-primary-foreground/70">
                    {item.description}
                  </span>
                </span>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-gold transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const hasHeroImage = Boolean(backgroundImage);

  return (
    <section
      className={`relative overflow-hidden border-b ${
        hasHeroImage ? "border-primary-foreground/10 bg-navy-dark text-primary-foreground" : "border-border bg-muted/30"
      }`}
    >
      {backgroundImage && (
        <div className="absolute inset-0 overflow-hidden">
          <img src={backgroundImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/90 via-navy-dark/78 to-navy-dark/58" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/70 via-transparent to-navy-dark/20" />
        </div>
      )}

      <div className="relative container py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.75fr)] lg:items-center">
          <div className="min-w-0">
            {resolvedLogo && (
              <img
                src={resolvedLogo}
                alt=""
                className="mb-5 h-16 w-auto max-w-[260px] object-contain drop-shadow-xl sm:h-20"
              />
            )}
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                hasHeroImage ? "bg-gold text-navy-dark" : "bg-gold/15 text-navy"
              }`}
            >
              {subtitle}
            </span>
            <h1
              className={`mt-4 max-w-3xl text-3xl font-bold leading-tight md:text-4xl lg:text-5xl ${
                hasHeroImage ? "text-white" : "text-foreground"
              }`}
            >
              {titleFirstWord}{" "}
              <span className={hasHeroImage ? "text-gold" : "text-navy"}>{titleRest.join(" ")}</span>
            </h1>
            <p
              className={`mt-4 max-w-2xl text-base leading-relaxed md:text-lg ${
                hasHeroImage ? "text-primary-foreground/82" : "text-muted-foreground"
              }`}
            >
              {tagline}
            </p>
            <div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row">
              <Link href="/transparencia" className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-bold text-navy-dark no-underline shadow-sm transition-opacity hover:opacity-90">
                <Shield className="h-4 w-4" aria-hidden="true" />
                Transparência
              </Link>
              <Link
                href="/ouvidoria"
                className={`inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-bold no-underline shadow-sm transition-colors ${
                  hasHeroImage
                    ? "border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15"
                    : "border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Ouvidoria
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {MODERN_SERVICE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-start gap-4 rounded-xl border border-border/70 bg-card/95 p-4 text-foreground no-underline shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-navy/25 hover:shadow-md"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-navy">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold leading-tight transition-colors group-hover:text-navy">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </span>
                </span>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-navy" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
