import { Link } from "@inertiajs/react";
import {
  ArrowRight,
  Calendar,
  FileCheck2,
  Gavel,
  Landmark,
  MessageSquare,
  Scale,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";

interface HeroNews {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string | null;
  slug: string;
  featured?: boolean;
}

interface HeroLegislativo {
  totalMateriasAno: number;
  totalSessoesAno: number;
  ano: number;
  vereadores?: { id: number }[];
}

interface HomeHeroProps {
  template: string;
  backgroundImage?: string | null;
  news?: HeroNews[];
  legislativo?: HeroLegislativo | null;
}

const SERVICE_LINKS = [
  { title: "Transparência", description: "Receitas, despesas e contratos.", href: "/transparencia", icon: Shield },
  { title: "e-SIC", description: "Pedidos com base na LAI.", href: "/esic", icon: FileCheck2 },
  { title: "Ouvidoria", description: "Manifestações e sugestões.", href: "/ouvidoria", icon: MessageSquare },
  { title: "Licitações", description: "Editais e contratos.", href: "/licitacoes", icon: Gavel },
];

/** Busca do hero → /busca?q= */
function HeroSearch() {
  return (
    <form action="/busca" method="get" role="search" className="flex w-full items-stretch overflow-hidden rounded-xl border-2 border-border bg-card focus-within:border-navy">
      <label htmlFor="hero-q" className="sr-only">Buscar no portal</label>
      <input
        id="hero-q"
        name="q"
        type="search"
        className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-foreground outline-none"
        placeholder="O que você procura no portal?"
      />
      <button type="submit" aria-label="Buscar" className="m-1 flex items-center gap-2 rounded-lg bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy-dark">
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Buscar</span>
      </button>
    </form>
  );
}


function Cover({ image, className = "" }: { image: string | null; className?: string }) {
  if (image) {
    return <img src={image} alt="" className={`h-full w-full object-cover ${className}`} />;
  }
  return <div className={`h-full w-full bg-gradient-to-br from-navy via-navy-light to-navy-dark ${className}`} />;
}

export function HomeHero({ template, backgroundImage, news = [], legislativo }: HomeHeroProps) {
  const settings = useSiteSettings();
  const subtitle = settings.header_subtitle || "Estado da Paraíba";
  const featured = news.find((n) => n.featured) || news[0] || null;
  const recent = news.filter((n) => n.id !== featured?.id).slice(0, 3);

  /* ============================ MODERNO / DESTAQUE ============================ */
  if (template === "moderno") {
    return (
      <section className="relative overflow-hidden bg-navy-dark text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-navy" aria-hidden="true" />
        <div className="relative container py-9 lg:py-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Em destaque</span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Notícias da Câmara</h2>
            </div>
            <Link href="/noticias" className="hidden shrink-0 items-center gap-1.5 text-sm font-bold text-gold no-underline hover:gap-2.5 transition-all sm:inline-flex">
              Todas as notícias <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-stretch">
            {/* Destaque principal — estica para a altura da coluna de recentes */}
            {featured ? (
              <Link href={`/noticias/${featured.slug}`} className="group relative block min-h-[300px] overflow-hidden rounded-3xl no-underline lg:min-h-0 lg:h-full">
                <Cover image={featured.image} className="transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/55 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-navy-dark">
                    <Calendar className="h-3 w-3" aria-hidden="true" /> {featured.date}
                  </span>
                  <h3 className="mt-3 max-w-2xl text-2xl font-extrabold leading-tight text-white sm:text-3xl">{featured.title}</h3>
                  {featured.excerpt && (
                    <p className="mt-2 line-clamp-2 max-w-xl text-sm text-white/85 sm:text-base">{featured.excerpt}</p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-gold">
                    Ler notícia <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex min-h-[300px] flex-col justify-center rounded-3xl bg-primary-foreground/5 p-8">
                <h3 className="text-3xl font-extrabold">{settings.header_title || "Câmara Municipal de Sumé"}</h3>
                <p className="mt-3 max-w-md text-primary-foreground/80">{settings.footer_description || "Transparência e serviço ao cidadão."}</p>
              </div>
            )}

            {/* Coluna: últimas notícias (cada item cresce para casar com o destaque) */}
            <div className="flex flex-col gap-3">
              {recent.map((item) => (
                <Link key={item.id} href={`/noticias/${item.slug}`} className="group flex flex-1 items-center gap-3 overflow-hidden rounded-2xl border border-primary-foreground/12 bg-primary-foreground/[0.06] p-2.5 no-underline transition-colors hover:border-gold/40 hover:bg-primary-foreground/[0.1]">
                  <div className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl sm:w-32">
                    <Cover image={item.image} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold text-gold">{item.date}</span>
                    <p className="mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-primary-foreground group-hover:text-gold">{item.title}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ============================ CLÁSSICO / GOVERNAMENTAL ============================ */
  const stats = legislativo
    ? [
        { icon: Scale, value: legislativo.totalMateriasAno, label: `Matérias em ${legislativo.ano}` },
        { icon: Landmark, value: legislativo.totalSessoesAno, label: `Sessões em ${legislativo.ano}` },
        { icon: Users, value: legislativo.vereadores?.length ?? 0, label: "Vereadores" },
      ].filter((s) => Number(s.value) > 0)
    : [];

  return (
    <section className="relative overflow-hidden border-b border-border text-primary-foreground">
      {backgroundImage ? (
        <div className="absolute inset-0" aria-hidden="true">
          <img src={backgroundImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 via-navy-dark/85 to-navy-dark/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/85 to-navy-dark/35" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-hero" aria-hidden="true" />
      )}
      <div className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-gold to-gold/0" aria-hidden="true" />
      <div className="relative container py-9 lg:py-12">
        {/* Busca + título institucional sobre a imagem */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-navy-dark">
              {subtitle}
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white drop-shadow sm:text-3xl">
              Serviços e informações ao cidadão
            </h2>
          </div>
          <div className="w-full sm:max-w-sm">
            <HeroSearch />
          </div>
        </div>

        {/* Tiles de serviço — linha única, densa */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_LINKS.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-foreground no-underline shadow-sm transition-all hover:-translate-y-1 hover:border-navy/30 hover:shadow-md"
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ${i % 2 === 0 ? "bg-navy text-white" : "bg-gradient-gold text-navy-dark"}`}>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-bold leading-tight text-foreground group-hover:text-navy dark:group-hover:text-sky">{item.title}</span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.description}</span>
              </span>
              <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-navy transition-transform group-hover:translate-x-1 dark:text-sky" aria-hidden="true" />
            </Link>
          ))}
        </div>

        {/* Indicadores do Legislativo */}
        {stats.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/10 text-navy dark:bg-primary-foreground/10 dark:text-sky">
                  <s.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xl font-extrabold leading-none tabular-nums text-foreground">{s.value}</span>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
