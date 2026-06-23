import { Link } from "@inertiajs/react";
import {
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
import { NewsHeroPanel, type NewsItem } from "~/components/NewsSection";
import { SectionHeading } from "~/components/SectionHeading";
import { useSiteSettings } from "~/hooks/use_site_settings";

interface HomeHeroProps {
  template: string;
  backgroundImage?: string | null;
  news?: NewsItem[];
  newsLimit?: number;
}

interface QuickLink {
  title: string;
  href: string;
  icon: LucideIcon;
}

const COMPACT_LINKS: QuickLink[] = [
  { title: "Transparência", href: "/transparencia", icon: Shield },
  { title: "e-SIC", href: "/esic", icon: FileCheck2 },
  { title: "Ouvidoria", href: "/ouvidoria", icon: MessageSquare },
  { title: "Licitações", href: "/licitacoes", icon: Gavel },
  { title: "Vereadores", href: "/vereadores", icon: Users },
  { title: "Agenda", href: "/agenda", icon: CalendarDays },
];

/** Orbes decorativos iguais ao header institucional. */
function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-1/2 -right-1/4 h-96 w-96 rounded-full bg-gold/[0.04] blur-3xl" />
      <div className="absolute -bottom-1/2 -left-1/4 h-96 w-96 rounded-full bg-sky/[0.04] blur-3xl" />
    </div>
  );
}

/** Busca para fundos claros (modelo compacto). */
function HeroSearchLight({ id = "hero-q" }: { id?: string }) {
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
        className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
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

/** Busca no padrão glass do header institucional (fundos escuros). */
function HeroSearchGlass({ id = "hero-q" }: { id?: string }) {
  return (
    <form
      action="/busca"
      method="get"
      role="search"
      className="glass flex w-full max-w-2xl items-center gap-3 rounded-2xl px-4 py-3"
    >
      <label htmlFor={id} className="sr-only">
        Buscar no portal
      </label>
      <Search className="h-5 w-5 shrink-0 text-primary-foreground/70" aria-hidden="true" />
      <input
        id={id}
        name="q"
        type="search"
        className="min-w-0 flex-1 bg-transparent text-sm text-primary-foreground outline-none placeholder:text-primary-foreground/50"
        placeholder="Buscar no portal… (ex.: licitação, ata, vereador)"
      />
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-navy-dark transition-colors hover:bg-gold-light"
      >
        Buscar
      </button>
    </form>
  );
}

function CompactQuickLinks({ items }: { items: QuickLink[] }) {
  const colors = ["bg-navy", "bg-gold", "bg-sky", "bg-emerald-600", "bg-navy-light", "bg-gold"];
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
      {items.map((item, index) => (
        <Link
          key={item.href}
          href={item.href}
          className="card-modern group flex flex-col items-center p-3 text-center no-underline min-h-[100px] sm:min-h-[126px]"
          data-reveal
          data-reveal-delay={index * 50}
        >
          <div
            className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full shadow-sm sm:h-12 sm:w-12 ${colors[index % colors.length]}`}
          >
            <item.icon className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <span className="text-xs font-bold leading-tight text-foreground group-hover:text-primary sm:text-sm">
            {item.title}
          </span>
        </Link>
      ))}
    </div>
  );
}

/** Quantas notícias o hero moderno consome (destaque + grade). */
export const MODERNO_HERO_NEWS_COUNT = 5;

export function HomeHero({ template, backgroundImage, news = [], newsLimit = 5 }: HomeHeroProps) {
  const settings = useSiteSettings();
  const title = settings.header_title || "Câmara Municipal de Sumé";
  const subtitle = settings.header_subtitle || "Estado da Paraíba";
  const tagline =
    settings.footer_description ||
    "Notícias, transparência e participação ao alcance do cidadão.";

  /* ── MODERNO: mesma faixa navy + notícias do institucional, com intro à esquerda ── */
  if (template === "moderno") {
    const heroNews = news.slice(0, newsLimit);

    return (
      <section className="relative overflow-hidden border-b border-primary-foreground/10 bg-gradient-hero text-primary-foreground">
        <HeroBackdrop />

        <div className="relative container py-8 lg:py-10">
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
            <div className="min-w-0" data-reveal="fade-right">
              <SectionHeading
                tone="dark"
                align="left"
                badge={subtitle}
                title={
                  <>
                    {title.split(" ")[0]}{" "}
                    <span className="text-gradient-gold">{title.split(" ").slice(1).join(" ")}</span>
                  </>
                }
                subtitle={tagline}
                className="!mb-6 sm:!mb-8"
              />

              <HeroSearchGlass id="hero-q-moderno" />

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/noticias"
                  className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-navy-dark no-underline transition-colors hover:bg-gold-light"
                >
                  <Newspaper className="h-4 w-4" aria-hidden="true" />
                  Todas as notícias
                </Link>
                <Link
                  href="/transparencia"
                  className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/20 px-5 py-2.5 text-sm font-semibold text-primary-foreground no-underline transition-colors hover:border-gold/40 hover:bg-primary-foreground/10"
                >
                  <Shield className="h-4 w-4" aria-hidden="true" />
                  Transparência
                </Link>
              </div>
            </div>

            {heroNews.length > 0 ? (
              <NewsHeroPanel news={heroNews} limit={newsLimit} />
            ) : backgroundImage ? (
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-primary-foreground/15 shadow-2xl"
                data-reveal="fade-left"
              >
                <img src={backgroundImage} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/70 to-transparent" />
              </div>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  /* ── COMPACTO: denso; ícones coloridos como Acesso Rápido ── */
  if (template === "compacto") {
    return (
      <section className="section-block border-b border-border bg-background">
        <div className="container space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              align="left"
              badge={subtitle}
              title="Acesso rápido"
              className="!mb-0"
            />
            <div className="w-full sm:max-w-md shrink-0">
              <HeroSearchLight id="hero-q-compact" />
            </div>
          </div>
          <CompactQuickLinks items={COMPACT_LINKS} />
        </div>
      </section>
    );
  }

  /* ── CLÁSSICO: gradiente institucional + busca glass; atalhos no Acesso Rápido ── */
  return (
    <section className="relative overflow-hidden border-b border-primary-foreground/10 bg-gradient-hero text-primary-foreground">
      <HeroBackdrop />

      <div className="relative container py-10 lg:py-12">
        <SectionHeading
          tone="dark"
          align="left"
          badge={subtitle}
          title="Portal do Cidadão"
          subtitle={tagline}
          className="!mb-8"
        />

        <div data-reveal="fade-up">
          <HeroSearchGlass id="hero-q-classico" />
          <p className="mt-3 max-w-2xl text-xs text-primary-foreground/60">
            Pesquise por notícias, atas, licitações, vereadores e documentos oficiais.
          </p>
        </div>
      </div>
    </section>
  );
}
