import { Link } from "@inertiajs/react";
import {
  ArrowRight,
  ArrowUpRight,
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

/** Serviços principais ao cidadão (acesso rápido do hero). */
const SERVICE_LINKS = [
  { title: "Portal da Transparência", description: "Receitas, despesas, contratos e dados públicos.", href: "/transparencia", icon: Shield },
  { title: "e-SIC", description: "Solicite informações com base na LAI.", href: "/esic", icon: FileCheck2 },
  { title: "Ouvidoria", description: "Manifestações, sugestões e pedidos.", href: "/ouvidoria", icon: MessageSquare },
  { title: "Licitações", description: "Editais, atas e documentos oficiais.", href: "/licitacoes", icon: Gavel },
];

/** Campo de busca do hero → /busca?q= (mesmo parâmetro do Header). */
function HeroSearch({ size = "lg" }: { size?: "lg" | "sm" }) {
  const lg = size === "lg";
  return (
    <form
      action="/busca"
      method="get"
      role="search"
      className={`flex items-stretch overflow-hidden rounded-xl border-2 border-border bg-card focus-within:border-navy ${lg ? "max-w-md" : "w-full lg:w-64"}`}
    >
      <label htmlFor="hero-q" className="sr-only">Buscar no portal</label>
      <input
        id="hero-q"
        name="q"
        type="search"
        className={`min-w-0 flex-1 bg-transparent text-foreground outline-none ${lg ? "px-4 py-3 text-sm" : "px-3.5 py-2.5 text-sm"}`}
        placeholder={lg ? "O que você procura no portal?" : "Buscar no portal..."}
      />
      <button
        type="submit"
        className={`m-1 flex items-center gap-2 rounded-lg bg-navy font-semibold text-white transition-colors hover:bg-navy-dark ${lg ? "px-4 text-sm" : "px-3"}`}
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

  /* ===================== MODERNO / DESTAQUE — imagem em destaque ===================== */
  if (template === "moderno") {
    return (
      <section className="relative overflow-hidden bg-navy-dark text-primary-foreground">
        {backgroundImage ? (
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <img src={backgroundImage} alt="" className="h-full w-full object-cover" />
            {/* Escurece SÓ a esquerda (texto); a direita mostra a imagem */}
            <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/85 to-navy-dark/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/70 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-navy" aria-hidden="true" />
        )}

        <div className="relative container py-14 lg:py-20">
          <div className="max-w-xl" data-reveal="fade-right">
            {resolvedLogo && (
              <img src={resolvedLogo} alt="" className="mb-6 h-16 w-auto max-w-[240px] object-contain drop-shadow-2xl sm:h-20" />
            )}
            <div className="mb-4 flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">{subtitle}</span>
              <span className="h-px w-12 bg-gradient-to-r from-gold/70 to-transparent" aria-hidden="true" />
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              {titleFirstWord} <span className="text-gradient-gold">{titleTail}</span>
            </h1>
            <p className="mt-4 text-base text-primary-foreground/90 sm:text-lg">{tagline}</p>
            <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row">
              <Link href="/noticias" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-sm font-bold text-navy-dark no-underline shadow-lg transition-opacity hover:opacity-90">
                <Newspaper className="h-4 w-4" aria-hidden="true" /> Últimas notícias
              </Link>
              <Link href="/agenda" className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-foreground/40 bg-primary-foreground/5 px-5 py-3 text-sm font-bold text-primary-foreground no-underline backdrop-blur transition-colors hover:bg-primary-foreground/10">
                <CalendarDays className="h-4 w-4" aria-hidden="true" /> Agenda da Câmara
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-reveal="fade-up">
            {SERVICE_LINKS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl border border-primary-foreground/15 bg-navy-dark/55 p-3.5 text-primary-foreground no-underline shadow-lg backdrop-blur-md transition-all hover:-translate-y-1 hover:border-gold/55"
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-navy-dark shadow ${i % 2 === 0 ? "bg-gradient-gold" : "bg-sky"}`}>
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold leading-tight transition-colors group-hover:text-gold">{item.title}</span>
                  <span className="mt-0.5 block line-clamp-1 text-xs text-primary-foreground/75">{item.description}</span>
                </span>
                <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ===================== COMPACTO / NOTÍCIAS — faixa slim ===================== */
  if (template === "compacto") {
    return (
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="container py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              {resolvedLogo ? (
                <img src={resolvedLogo} alt="" className="h-10 w-auto max-w-[150px] object-contain sm:h-12" />
              ) : null}
              <div className="hidden min-w-0 border-l border-border pl-3 sm:block">
                <p className="truncate text-sm font-extrabold leading-tight text-foreground">{title}</p>
                <p className="truncate text-xs text-muted-foreground">Notícias e serviços do Legislativo</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <nav className="hidden items-center gap-1 md:flex">
                {SERVICE_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-navy dark:hover:text-sky"
                  >
                    <item.icon className="h-3.5 w-3.5 text-navy dark:text-sky" aria-hidden="true" />
                    {item.title.replace("Portal da ", "")}
                  </Link>
                ))}
              </nav>
              <HeroSearch size="sm" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ===================== CLÁSSICO / GOVERNAMENTAL — claro, sóbrio ===================== */
  return (
    <section className="relative border-b border-border bg-gradient-to-b from-secondary/40 to-background">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-navy via-gold to-navy" aria-hidden="true" />
      <div className="container py-12 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.92fr]">
          {/* Identidade + busca */}
          <div data-reveal="fade-right">
            {resolvedLogo && (
              <img src={resolvedLogo} alt="" className="mb-5 h-16 w-auto max-w-[240px] object-contain sm:h-20" />
            )}
            <span className="inline-flex items-center rounded-full bg-navy/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-navy dark:bg-primary-foreground/10 dark:text-primary-foreground">
              {subtitle}
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight text-navy dark:text-primary-foreground sm:text-5xl">
              {titleFirstWord} <span className="block sm:inline">{titleTail}</span>
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground sm:text-lg">{tagline}</p>
            <div className="mt-6">
              <HeroSearch size="lg" />
            </div>
          </div>

          {/* Serviços ao cidadão — grade 2×2, ícones coloridos */}
          <div data-reveal="fade-up">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Serviços ao cidadão</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {SERVICE_LINKS.map((item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 text-foreground no-underline shadow-sm transition-all hover:-translate-y-1 hover:border-navy/30 hover:shadow-md"
                >
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ${i % 2 === 0 ? "bg-navy text-white" : "bg-gradient-gold text-navy-dark"}`}>
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold leading-tight text-foreground group-hover:text-navy dark:group-hover:text-sky">{item.title}</span>
                    <span className="mt-1 block text-xs leading-snug text-muted-foreground">{item.description}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-navy transition-transform group-hover:translate-x-1 dark:text-sky" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
