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
  Users,
  type LucideIcon,
} from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";

interface HeroLegislativo {
  totalMateriasAno: number;
  totalSessoesAno: number;
  ano: number;
  vereadores?: { id: number }[];
}

interface HomeHeroProps {
  template: string;
  backgroundImage?: string | null;
  legislativo?: HeroLegislativo | null;
  news?: unknown[];
}

interface QuickLink {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const SERVICE_LINKS: QuickLink[] = [
  { title: "Transparência", description: "Receitas, despesas e contratos.", href: "/transparencia", icon: Shield },
  { title: "e-SIC", description: "Pedidos de informação (LAI).", href: "/esic", icon: FileCheck2 },
  { title: "Ouvidoria", description: "Manifestações e sugestões.", href: "/ouvidoria", icon: MessageSquare },
  { title: "Licitações", description: "Editais e contratos.", href: "/licitacoes", icon: Gavel },
];

const COMPACT_LINKS: QuickLink[] = [
  ...SERVICE_LINKS,
  { title: "Vereadores", description: "Parlamentares de Sumé.", href: "/vereadores", icon: Users },
  { title: "Agenda", description: "Sessões e eventos.", href: "/agenda", icon: CalendarDays },
];

function HeroSearch({ id = "hero-q" }: { id?: string }) {
  return (
    <form
      action="/busca"
      method="get"
      role="search"
      className="flex w-full items-stretch overflow-hidden rounded-lg border border-border bg-card shadow-sm focus-within:border-navy focus-within:ring-1 focus-within:ring-navy/20"
    >
      <label htmlFor={id} className="sr-only">
        Buscar no portal
      </label>
      <input
        id={id}
        name="q"
        type="search"
        className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-foreground outline-none"
        placeholder="O que você procura no portal?"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="flex items-center gap-2 bg-navy px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-navy-dark"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Buscar</span>
      </button>
    </form>
  );
}

/** Cards de serviço — estilo único em todos os modelos (sem bento colorido). */
function ServiceCards({ items, compact = false }: { items: QuickLink[]; compact?: boolean }) {
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card-modern group flex flex-col items-center gap-2 p-3 text-center no-underline hover:border-navy/30"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/10 text-navy transition-colors group-hover:bg-navy group-hover:text-primary-foreground dark:group-hover:bg-navy-light">
              <item.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-xs font-semibold leading-tight text-foreground">{item.title}</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="card-modern group flex items-center gap-3 p-4 no-underline hover:border-navy/30"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy/10 text-navy transition-colors group-hover:bg-navy group-hover:text-primary-foreground dark:group-hover:bg-navy-light">
            <item.icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold leading-tight text-foreground group-hover:text-navy dark:group-hover:text-sky">
              {item.title}
            </span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.description}</span>
          </span>
          <ArrowRight
            className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-navy dark:group-hover:text-sky"
            aria-hidden="true"
          />
        </Link>
      ))}
    </div>
  );
}

export function HomeHero({ template, backgroundImage }: HomeHeroProps) {
  const settings = useSiteSettings();
  const title = settings.header_title || "Câmara Municipal de Sumé";
  const subtitle = settings.header_subtitle || "Estado da Paraíba";
  const tagline =
    settings.footer_description ||
    "Notícias, transparência e participação ao alcance do cidadão.";

  /* ── MODERNO: editorial em duas colunas, sem foto gigante ── */
  if (template === "moderno") {
    return (
      <section className="border-b border-border bg-background">
        <div className="container py-8 lg:py-10">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="min-w-0" data-reveal="fade-right">
              <span className="text-xs font-bold uppercase tracking-widest text-navy dark:text-sky">
                {subtitle}
              </span>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                {title}
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                {tagline}
              </p>
              <div className="mt-6 flex flex-col gap-2 min-[400px]:flex-row">
                <Link
                  href="/noticias"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-primary-foreground no-underline transition-colors hover:bg-navy-dark"
                >
                  <Newspaper className="h-4 w-4" aria-hidden="true" />
                  Últimas notícias
                </Link>
                <Link
                  href="/transparencia"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground no-underline transition-colors hover:border-navy/30 hover:bg-muted"
                >
                  <Shield className="h-4 w-4" aria-hidden="true" />
                  Transparência
                </Link>
              </div>
            </div>

            <div className="relative min-w-0" data-reveal="fade-left">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
                {backgroundImage ? (
                  <img src={backgroundImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-navy/90 to-navy-dark/80" aria-hidden="true" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/50 to-transparent" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-muted/30">
          <div className="container py-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Serviços ao cidadão
            </p>
            <ServiceCards items={SERVICE_LINKS} />
          </div>
        </div>
      </section>
    );
  }

  /* ── COMPACTO: faixa curta + busca + atalhos densos ── */
  if (template === "compacto") {
    return (
      <section className="border-b border-border bg-muted/20">
        <div className="container space-y-5 py-6 lg:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <span className="text-xs font-bold uppercase tracking-widest text-navy dark:text-sky">
                {subtitle}
              </span>
              <h2 className="mt-1 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                Acesso rápido
              </h2>
            </div>
            <div className="w-full sm:max-w-md">
              <HeroSearch id="hero-q-compact" />
            </div>
          </div>
          <ServiceCards items={COMPACT_LINKS} compact />
        </div>
      </section>
    );
  }

  /* ── CLÁSSICO / GOVERNAMENTAL: claro, sóbrio, estilo gov.br ── */
  return (
    <section className="border-b border-border bg-card">
      <div className="h-1 bg-navy" aria-hidden="true" />
      <div className="container space-y-6 py-8 lg:py-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 max-w-2xl" data-reveal="fade-right">
            <span className="inline-block rounded bg-navy/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-navy dark:bg-primary-foreground/10 dark:text-primary-foreground">
              {subtitle}
            </span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Serviços e informações ao cidadão
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{tagline}</p>
          </div>
          <div className="w-full lg:max-w-sm lg:pt-1" data-reveal="fade-left">
            <HeroSearch id="hero-q-classico" />
          </div>
        </div>

        <div data-reveal="fade-up">
          <ServiceCards items={SERVICE_LINKS} />
        </div>
      </div>
    </section>
  );
}
