import { Link } from "@inertiajs/react";
import {
  ArrowRight,
  CalendarDays,
  FileCheck2,
  Gavel,
  MessageSquare,
  Newspaper,
  Search,
  Shield,
} from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";

interface HomeHeroProps {
  template: string;
  backgroundImage?: string | null;
}

/** Serviços principais ao cidadão (acesso rápido nobre do hero). */
const SERVICE_LINKS = [
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
    description: "Manifestações, sugestões e pedidos.",
    href: "/ouvidoria",
    icon: MessageSquare,
  },
  {
    title: "Licitações",
    description: "Editais, atas e documentos oficiais.",
    href: "/licitacoes",
    icon: Gavel,
  },
];

/** Campo de busca do hero (gov.br): navega para /busca?q=... — não duplica TopBar/cards. */
function HeroSearch({ variant = "lg" }: { variant?: "lg" | "sm" }) {
  const lg = variant === "lg";
  return (
    <form
      action="/busca"
      method="get"
      role="search"
      className={`flex overflow-hidden rounded-xl bg-card shadow-lg ${lg ? "max-w-md" : "w-full lg:w-80"}`}
    >
      <label htmlFor="hero-q" className="sr-only">
        Buscar no portal
      </label>
      <input
        id="hero-q"
        name="q"
        type="search"
        className={`min-w-0 flex-1 bg-transparent text-foreground outline-none ${lg ? "px-4 py-3 text-sm" : "px-3.5 py-2.5 text-sm"}`}
        placeholder={lg ? "O que você procura no portal?" : "Buscar no portal..."}
      />
      <button
        type="submit"
        className="flex items-center gap-2 bg-navy px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-navy-dark sm:px-5"
        aria-label="Buscar"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        {lg && <span className="hidden sm:inline">Buscar</span>}
      </button>
    </form>
  );
}

export function HomeHero({ template, backgroundImage }: HomeHeroProps) {
  const settings = useSiteSettings();
  const title = settings.header_title || "Câmara Municipal de Sumé";
  const subtitle = settings.header_subtitle || "Estado da Paraíba";
  const tagline =
    settings.footer_description ||
    "Comprometida com a transparência e o bem-estar da população.";
  const [titleFirstWord, ...titleRest] = title.split(" ");
  const titleTail = titleRest.join(" ");
  const resolvedLogo = settings.logo_url || null;

  /* ===================== MODERNO / DESTAQUE ===================== */
  if (template === "moderno") {
    return (
      <section className="relative overflow-hidden bg-navy-dark text-primary-foreground">
        {backgroundImage ? (
          <div className="absolute inset-0 overflow-hidden">
            <img src={backgroundImage} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-navy-dark via-navy-dark/90 to-navy-dark/65" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-navy-dark/20" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-navy" />
        )}
        <div className="absolute inset-0 template-modern-grid opacity-10 pointer-events-none" aria-hidden="true" />

        <div className="relative container py-12 lg:py-16">
          <div className="max-w-3xl min-w-0" data-reveal="fade-right">
            {resolvedLogo && (
              <img
                src={resolvedLogo}
                alt=""
                className="mb-6 h-16 w-auto max-w-[260px] object-contain drop-shadow-2xl sm:h-20"
              />
            )}
            <div className="mb-4 flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">{subtitle}</span>
              <span className="h-px w-16 bg-gradient-to-r from-gold/70 to-transparent" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
              {titleFirstWord} <span className="text-gradient-gold">{titleTail}</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-primary-foreground/85 sm:text-xl">
              {tagline}
            </p>
            <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row">
              <Link
                href="/noticias"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-bold text-navy-dark no-underline transition-opacity hover:opacity-90"
              >
                <Newspaper className="h-4 w-4" aria-hidden="true" /> Últimas notícias
              </Link>
              <Link
                href="/agenda"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/30 px-5 py-3 text-sm font-bold text-primary-foreground no-underline transition-colors hover:bg-primary-foreground/10"
              >
                <CalendarDays className="h-4 w-4" aria-hidden="true" /> Agenda da Câmara
              </Link>
            </div>
          </div>

          <div className="mt-9 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4" data-reveal="fade-up">
            {SERVICE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.08] p-3.5 text-primary-foreground no-underline shadow-lg backdrop-blur-md transition-all hover:-translate-y-1 hover:border-gold/55 hover:bg-primary-foreground/[0.13]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold text-navy-dark shadow-lg">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold leading-tight transition-colors group-hover:text-gold">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block line-clamp-1 text-xs text-primary-foreground/70">
                    {item.description}
                  </span>
                </span>
                <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-gold transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ===================== COMPACTO / NOTÍCIAS (slim) ===================== */
  if (template === "compacto") {
    return (
      <section className="relative overflow-hidden bg-gradient-navy text-primary-foreground">
        <div className="relative container py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {resolvedLogo ? (
                <img src={resolvedLogo} alt="" className="h-10 w-auto max-w-[160px] object-contain sm:h-12" />
              ) : null}
              <div className="hidden h-10 w-px bg-primary-foreground/15 sm:block" />
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-bold leading-tight">{title}</p>
                <p className="truncate text-xs text-primary-foreground/70">Notícias e serviços do Legislativo</p>
              </div>
            </div>
            <HeroSearch variant="sm" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {SERVICE_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3.5 py-1.5 text-xs font-semibold text-primary-foreground no-underline transition-colors hover:border-gold/60 hover:text-gold"
              >
                <item.icon className="h-3.5 w-3.5 text-gold" aria-hidden="true" /> {item.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ===================== CLÁSSICO / GOVERNAMENTAL (padrão do hero) ===================== */
  return (
    <section className="relative overflow-hidden bg-navy-dark text-primary-foreground">
      {backgroundImage ? (
        <div className="absolute inset-0 overflow-hidden">
          <img src={backgroundImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/92 to-navy-dark/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/80 via-transparent to-navy-dark/30" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-hero" />
      )}

      <div className="relative container py-12 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Identidade + busca */}
          <div className="min-w-0" data-reveal="fade-right">
            {resolvedLogo && (
              <img
                src={resolvedLogo}
                alt=""
                className="mb-5 h-16 w-auto max-w-[260px] object-contain drop-shadow-xl sm:h-20"
              />
            )}
            <span className="inline-flex rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-navy-dark">
              {subtitle}
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              {titleFirstWord} <span className="text-gold">{titleTail}</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-primary-foreground/85 sm:text-lg">{tagline}</p>
            <div className="mt-6">
              <HeroSearch variant="lg" />
            </div>
          </div>

          {/* Serviços ao cidadão — grade 2×2 ordenada */}
          <div className="min-w-0" data-reveal="fade-up">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-gold">Serviços ao cidadão</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {SERVICE_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 text-foreground no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:border-navy/25 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy/10 text-navy">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold leading-tight group-hover:text-navy">{item.title}</span>
                    <span className="mt-1 block text-xs leading-snug text-muted-foreground">{item.description}</span>
                  </span>
                  <ArrowRight
                    className="h-4 w-4 text-navy/70 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
