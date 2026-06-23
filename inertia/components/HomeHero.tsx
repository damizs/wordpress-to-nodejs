import { Link } from "@inertiajs/react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  FileCheck2,
  Gavel,
  Landmark,
  MessageSquare,
  Newspaper,
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
  { title: "e-SIC", description: "Pedidos de informação (LAI).", href: "/esic", icon: FileCheck2 },
  { title: "Ouvidoria", description: "Manifestações e sugestões.", href: "/ouvidoria", icon: MessageSquare },
  { title: "Licitações", description: "Editais e contratos.", href: "/licitacoes", icon: Gavel },
];

/** Tiles do modelo Modular (bento colorido) — cores sólidas alternadas. */
const BENTO_LINKS = [
  { title: "Transparência", description: "Receitas, despesas, contratos e dados públicos.", href: "/transparencia", icon: Shield, tone: "navy" },
  { title: "e-SIC", description: "Solicite informações com base na LAI.", href: "/esic", icon: FileCheck2, tone: "gold" },
  { title: "Ouvidoria", description: "Manifestações, sugestões e pedidos.", href: "/ouvidoria", icon: MessageSquare, tone: "white" },
  { title: "Licitações", description: "Editais, atas e documentos oficiais.", href: "/licitacoes", icon: Gavel, tone: "sky" },
  { title: "Vereadores", description: "Conheça quem representa Sumé.", href: "/vereadores", icon: Users, tone: "white" },
  { title: "Agenda", description: "Sessões e eventos da Câmara.", href: "/agenda", icon: CalendarDays, tone: "navy" },
] as const;

const BENTO_TONE: Record<string, string> = {
  navy: "bg-navy text-white border-transparent [&_.bento-ico]:bg-white/15 [&_.bento-ico]:text-white [&_.bento-desc]:text-white/75 [&_.bento-arrow]:text-gold",
  gold: "bg-gradient-gold text-navy-dark border-transparent [&_.bento-ico]:bg-navy/15 [&_.bento-ico]:text-navy-dark [&_.bento-desc]:text-navy-dark/75 [&_.bento-arrow]:text-navy-dark",
  sky: "bg-sky text-navy-dark border-transparent [&_.bento-ico]:bg-navy/15 [&_.bento-ico]:text-navy-dark [&_.bento-desc]:text-navy-dark/75 [&_.bento-arrow]:text-navy-dark",
  white: "bg-card text-foreground border-border [&_.bento-ico]:bg-navy/10 [&_.bento-ico]:text-navy dark:[&_.bento-ico]:bg-primary-foreground/10 dark:[&_.bento-ico]:text-sky [&_.bento-desc]:text-muted-foreground [&_.bento-arrow]:text-navy dark:[&_.bento-arrow]:text-sky",
};

function HeroSearch() {
  return (
    <form action="/busca" method="get" role="search" className="flex w-full items-stretch overflow-hidden rounded-xl border-2 border-border bg-card focus-within:border-navy">
      <label htmlFor="hero-q" className="sr-only">Buscar no portal</label>
      <input id="hero-q" name="q" type="search" className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-foreground outline-none" placeholder="O que você procura no portal?" />
      <button type="submit" aria-label="Buscar" className="m-1 flex items-center gap-2 rounded-lg bg-navy px-4 text-sm font-semibold text-white transition-colors hover:bg-navy-dark">
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Buscar</span>
      </button>
    </form>
  );
}

export function HomeHero({ template, backgroundImage, legislativo }: HomeHeroProps) {
  const settings = useSiteSettings();
  const title = settings.header_title || "Câmara Municipal de Sumé";
  const subtitle = settings.header_subtitle || "Estado da Paraíba";
  const tagline =
    settings.footer_description ||
    "Notícias, transparência e participação ao alcance do cidadão.";

  /* ===================== MODERNO → VISUAL & IMERSIVO (hero com foto) ===================== */
  if (template === "moderno") {
    return (
      <section className="relative">
        {/* Foto em destaque, ocupando a abertura */}
        <div className="relative min-h-[420px] overflow-hidden text-primary-foreground lg:min-h-[500px]">
          {backgroundImage ? (
            <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-navy" aria-hidden="true" />
          )}
          <div className="absolute inset-0 bg-gradient-to-tr from-navy-dark via-navy-dark/75 to-navy-dark/25" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/90 to-transparent" aria-hidden="true" />

          <div className="relative container flex min-h-[420px] flex-col justify-center py-14 lg:min-h-[500px] lg:py-20">
            <div className="max-w-2xl" data-reveal="fade-right">
              <span className="inline-flex items-center gap-2 rounded-full bg-gold/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-navy-dark">
                {subtitle}
              </span>
              <h1 className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-tight drop-shadow-sm sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="mt-4 max-w-xl text-base text-primary-foreground/90 drop-shadow sm:text-lg">{tagline}</p>
              <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row">
                <Link href="/transparencia" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-bold text-navy-dark no-underline shadow-lg transition-opacity hover:opacity-90">
                  <Shield className="h-4 w-4" aria-hidden="true" /> Transparência
                </Link>
                <Link href="/noticias" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-5 py-3 text-sm font-bold text-white no-underline backdrop-blur transition-colors hover:bg-white/20">
                  <Newspaper className="h-4 w-4" aria-hidden="true" /> Últimas notícias
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Serviços em cards flutuando sobre a borda inferior da foto */}
        <div className="bg-background">
          <div className="container">
            <div className="relative z-10 -mt-12 grid gap-3 pb-2 sm:grid-cols-2 lg:-mt-16 lg:grid-cols-4" data-reveal="fade-up">
              {SERVICE_LINKS.map((item, i) => (
                <Link key={item.href} href={item.href} className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-foreground no-underline shadow-xl transition-all hover:-translate-y-1 hover:border-navy/30">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-navy-dark shadow ${i % 2 === 0 ? "bg-gradient-gold" : "bg-sky"}`}>
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold leading-tight group-hover:text-navy dark:group-hover:text-sky">{item.title}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.description}</span>
                  </span>
                  <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-navy transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-sky" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ===================== COMPACTO → ORGANIZADO & MODULAR (bento colorido) ===================== */
  if (template === "compacto") {
    return (
      <section className="border-b border-border bg-background">
        <div className="container py-10 lg:py-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-navy dark:text-sky">{subtitle}</span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Serviços e acesso rápido</h2>
            </div>
            <div className="hidden w-72 sm:block">
              <HeroSearch />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BENTO_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex flex-col gap-3 rounded-2xl border p-5 no-underline shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${BENTO_TONE[item.tone]}`}
              >
                <span className="bento-ico flex h-12 w-12 items-center justify-center rounded-xl">
                  <item.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block text-base font-bold leading-tight">{item.title}</span>
                    <span className="bento-desc mt-1 block text-xs leading-snug">{item.description}</span>
                  </span>
                  <ArrowUpRight className="bento-arrow mt-0.5 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ===================== CLÁSSICO → IMERSIVA / REFINADA (claro, cards sólidos) ===================== */
  const stats = legislativo
    ? [
        { icon: Scale, value: legislativo.totalMateriasAno, label: `Matérias em ${legislativo.ano}` },
        { icon: Landmark, value: legislativo.totalSessoesAno, label: `Sessões em ${legislativo.ano}` },
        { icon: Users, value: legislativo.vereadores?.length ?? 0, label: "Vereadores" },
      ].filter((s) => Number(s.value) > 0)
    : [];

  return (
    <section className="border-b border-border bg-gradient-to-b from-secondary/30 to-background">
      <div className="h-1 bg-gradient-to-r from-navy via-gold to-navy" aria-hidden="true" />
      <div className="container py-10 lg:py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center rounded-full bg-navy/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-navy dark:bg-primary-foreground/10 dark:text-primary-foreground">
              {subtitle}
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-navy dark:text-primary-foreground sm:text-3xl">
              Serviços e informações ao cidadão
            </h2>
          </div>
          <div className="w-full sm:max-w-sm">
            <HeroSearch />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_LINKS.map((item, i) => (
            <Link key={item.href} href={item.href} className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-foreground no-underline shadow-sm transition-all hover:-translate-y-1 hover:border-navy/30 hover:shadow-md">
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

        {stats.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {stats.map((s) => (
              <div key={s.label} className="flex min-w-[180px] flex-1 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
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
