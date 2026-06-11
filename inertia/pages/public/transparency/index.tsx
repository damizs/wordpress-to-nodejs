import { useMemo, useState } from "react";
import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import {
  Search, ExternalLink, FileText, DollarSign, Users, Building, FileCheck,
  TrendingUp, TrendingDown, Wallet, Plane, HeartPulse, Gavel, FileSignature,
  Scale, BarChart3, FolderOpen, Car, Pill, Network, Database, Landmark, BookOpen,
} from "lucide-react";

interface TransparencyLink {
  id: number;
  title: string;
  url: string;
  icon?: string | null;
  is_external: boolean;
}

interface TransparencySection {
  id: number;
  title: string;
  slug: string;
  description?: string;
  icon?: string | null;
  links: TransparencyLink[];
}

interface Props {
  sections: TransparencySection[];
}

const iconMap: Record<string, any> = {
  DollarSign, Users, FileText, Building, FileCheck, Search, TrendingUp, TrendingDown,
  Wallet, Plane, HeartPulse, Gavel, FileSignature, Scale, BarChart3, FolderOpen,
  Car, Pill, Network, Database, Landmark, BookOpen,
};

/** Escolhe um ícone para o link com base em palavras-chave do título */
function pickLinkIcon(link: TransparencyLink) {
  if (link.icon && iconMap[link.icon]) return iconMap[link.icon];
  const t = link.title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (t.includes("diaria")) return Plane;
  if (t.includes("covid")) return HeartPulse;
  if (t.includes("folha")) return Wallet;
  if (t.includes("receita")) return TrendingUp;
  if (t.includes("despesa") || t.includes("empenho")) return TrendingDown;
  if (t.includes("pagamento")) return Wallet;
  if (t.includes("licitac") || t.includes("edital") || t.includes("aviso")) return Gavel;
  if (t.includes("contrato") || t.includes("ata")) return FileSignature;
  if (t.includes("lei") || t.includes("regulament") || t.includes("decreto") || t.includes("resolu") || t.includes("regimento") || t.includes("lai")) return Scale;
  if (t.includes("servidor") || t.includes("quadro funcional") || t.includes("pessoal")) return Users;
  if (t.includes("organograma")) return Network;
  if (t.includes("frota") || t.includes("veiculo")) return Car;
  if (t.includes("farmacia")) return Pill;
  if (t.includes("dados abertos")) return Database;
  if (t.includes("e-sic") || t.includes("esic")) return Search;
  if (t.includes("ppa") || t.includes("ldo") || t.includes("loa") || t.includes("rgf") || t.includes("rreo") || t.includes("demostrativ") || t.includes("demonstrativ") || t.includes("relatori") || t.includes("previsao")) return BarChart3;
  if (t.includes("tabela")) return BarChart3;
  return FileText;
}

function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function CardLink({ link }: { link: TransparencyLink }) {
  const Icon = pickLinkIcon(link);
  const className =
    "group flex flex-col items-center text-center gap-3 p-5 rounded-2xl bg-card border-2 border-border/70 no-underline transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg min-h-[150px]";
  const inner = (
    <>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="w-7 h-7" />
      </div>
      <span className="text-[13px] font-semibold text-foreground leading-snug">
        {link.title}
      </span>
      {link.is_external && (
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground -mt-1">
          <ExternalLink className="w-3 h-3" /> site externo
        </span>
      )}
    </>
  );
  return link.is_external ? (
    <a href={link.url} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <Link href={link.url} className={className}>
      {inner}
    </Link>
  );
}

export default function TransparenciaIndex({ sections = [] }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return sections;
    return sections
      .map((s) => ({
        ...s,
        // Filtra item a item pelo título do link (o título da seção não "libera" a seção inteira)
        links: s.links.filter((l) => normalize(l.title).includes(q)),
      }))
      .filter((s) => s.links.length > 0);
  }, [sections, query]);

  const totalLinks = useMemo(
    () => sections.reduce((acc, s) => acc + s.links.length, 0),
    [sections]
  );

  return (
    <>
      <SeoHead
        title="Portal da Transparência - Câmara Municipal de Sumé"
        description="Acesse informações sobre a gestão dos recursos públicos da Câmara Municipal de Sumé. Transparência e acesso à informação."
        url="/transparencia"
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Transparência" }]} />
        <PageHero
          badge="Acesso à Informação"
          title="Portal da Transparência"
          subtitle="Em cumprimento à Lei de Acesso à Informação (Lei nº 12.527/2011), disponibilizamos informações sobre a gestão dos recursos públicos da Câmara Municipal."
          centered
        />

        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="lg:flex lg:items-start lg:gap-10">
              {/* Sidebar de navegação (padrão dos portais) — fixa, com rolagem própria */}
              <aside className="hidden lg:block w-[280px] shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain rounded-2xl [scrollbar-width:thin]">
                <nav className="bg-card rounded-2xl shadow-md border border-border/60 overflow-hidden">
                  {filtered.map((section) => {
                    const Icon = iconMap[section.icon || ""] || FolderOpen;
                    return (
                      <div key={section.id} className="border-b border-border/60 last:border-b-0">
                        <a
                          href={`#secao-${section.slug}`}
                          className="flex items-center gap-2.5 px-4 py-3.5 bg-muted/60 border-l-4 border-primary no-underline hover:bg-muted transition-colors"
                        >
                          <Icon className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-[12px] font-bold uppercase tracking-wide text-foreground">
                            {section.title}
                          </span>
                        </a>
                        <div className="py-2 pl-11 pr-4">
                          {section.links.map((link) =>
                            link.is_external ? (
                              <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block py-1.5 px-2 rounded-md text-[13px] text-muted-foreground no-underline transition-all hover:text-primary hover:bg-muted hover:pl-3"
                              >
                                {link.title}
                              </a>
                            ) : (
                              <Link
                                key={link.id}
                                href={link.url}
                                className="block py-1.5 px-2 rounded-md text-[13px] text-muted-foreground no-underline transition-all hover:text-primary hover:bg-muted hover:pl-3"
                              >
                                {link.title}
                              </Link>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </nav>
              </aside>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                {/* Busca */}
                <div data-reveal="up" className="mb-10">
                  <div className="flex max-w-xl">
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={`Procurar entre ${totalLinks} itens...`}
                      className="flex-1 px-5 py-3.5 rounded-l-xl border-2 border-r-0 border-border bg-card text-sm text-foreground outline-none focus:border-primary transition-colors"
                      aria-label="Buscar no Portal da Transparência"
                    />
                    <span className="px-6 rounded-r-xl bg-primary text-primary-foreground flex items-center justify-center">
                      <Search className="w-5 h-5" />
                    </span>
                  </div>
                </div>

                {filtered.length > 0 ? (
                  filtered.map((section, i) => {
                    const Icon = iconMap[section.icon || ""] || FolderOpen;
                    return (
                      <section
                        key={section.id}
                        id={`secao-${section.slug}`}
                        data-reveal="up"
                        data-reveal-delay={String(Math.min(i, 4) * 60)}
                        className="mb-12 scroll-mt-28"
                      >
                        <header className="flex items-center gap-4 mb-6 pb-4 border-b-[3px] border-primary">
                          <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-xl font-bold text-foreground leading-tight">
                              {section.title}
                            </h2>
                            {section.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                            )}
                          </div>
                          <span className="ml-auto shrink-0 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                            {section.links.length}
                          </span>
                        </header>

                        <div className="grid gap-4 grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))]">
                          {section.links.map((link) => (
                            <CardLink key={link.id} link={link} />
                          ))}
                        </div>
                      </section>
                    );
                  })
                ) : (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Search className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      {query ? `Nada encontrado para "${query}"` : "Seções em atualização"}
                    </h3>
                    {query && (
                      <button
                        onClick={() => setQuery("")}
                        className="text-sm text-primary hover:underline"
                      >
                        Limpar busca
                      </button>
                    )}
                  </div>
                )}

                {/* E-SIC */}
                <div data-reveal="zoom" className="mt-4 p-8 bg-gradient-hero rounded-3xl text-primary-foreground text-center">
                  <h2 className="text-2xl font-bold mb-2">Não encontrou o que procura?</h2>
                  <p className="opacity-80 mb-6">
                    Utilize o Sistema Eletrônico de Informação ao Cidadão para solicitar informações
                  </p>
                  <Link
                    href="/esic"
                    className="inline-flex items-center gap-2 btn-modern bg-gold text-navy-dark no-underline"
                  >
                    <Search className="w-5 h-5" />
                    Acessar e-SIC
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
