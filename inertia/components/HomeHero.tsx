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

  const primaryBtn =
    "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-navy-dark text-sm font-semibold hover:opacity-90 transition-opacity no-underline";
  const ghostBtn =
    "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary-foreground/30 text-primary-foreground text-sm font-semibold hover:bg-primary-foreground/10 transition-colors no-underline";

  if (template === "moderno") {
    return (
      <section className="relative text-primary-foreground overflow-hidden bg-navy-dark">
        {backgroundImage ? (
          <div className="absolute inset-0 overflow-hidden">
            <img src={backgroundImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/88 to-navy-dark/72" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-navy-dark/20" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-navy-dark" />
        )}

        <div className="absolute inset-0 template-modern-grid opacity-10 pointer-events-none" aria-hidden="true" />

        <div className="relative container py-8 sm:py-11 lg:py-16">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.8fr)] lg:gap-10 xl:gap-12 items-center min-w-0">
            <div className="min-w-0" data-reveal="fade-right">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                  {subtitle}
                </span>
                <span className="h-px flex-1 max-w-16 bg-gradient-to-r from-gold/70 to-transparent" aria-hidden="true" />
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight max-w-2xl">
                {titleFirstWord}{" "}
                <span className="text-gradient-gold">{titleRest.join(" ")}</span>
              </h1>
              <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-primary-foreground/82 max-w-2xl leading-relaxed">
                {tagline}
              </p>
              <div className="mt-5 sm:mt-6 flex flex-col min-[420px]:flex-row gap-3">
                <Link href="/transparencia" className={primaryBtn}>
                  Transparência
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link href="/noticias" className={ghostBtn}>
                  Últimas notícias
                </Link>
              </div>
            </div>

            <div className="grid min-w-0 gap-3 sm:grid-cols-2" data-reveal="fade-left">
              {MODERN_SERVICE_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-primary-foreground/14 bg-primary-foreground/[0.08] p-4 text-primary-foreground no-underline shadow-xl backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-gold/50 hover:bg-primary-foreground/[0.13]"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gold text-navy-dark shadow-lg">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="text-base font-bold leading-tight transition-colors group-hover:text-gold">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-primary-foreground/72">
                    {item.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gold">
                    Acessar
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden border-b border-border bg-muted/30">
      <div className="container py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.75fr)] lg:items-center">
          <div className="min-w-0">
            <span className="inline-flex rounded-full bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy">
              {subtitle}
            </span>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
              {titleFirstWord}{" "}
              <span className="text-navy">{titleRest.join(" ")}</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
              {tagline}
            </p>
            <div className="mt-6 flex flex-col gap-3 min-[420px]:flex-row">
              <Link href="/transparencia" className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-5 py-3 text-sm font-bold text-white no-underline shadow-sm transition-colors hover:bg-navy-dark">
                <Shield className="h-4 w-4" aria-hidden="true" />
                Transparência
              </Link>
              <Link href="/ouvidoria" className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-bold text-foreground no-underline shadow-sm transition-colors hover:bg-muted">
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
                className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 text-foreground no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:border-navy/25 hover:shadow-md"
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
