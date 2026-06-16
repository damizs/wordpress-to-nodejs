import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, router } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { LinkModal } from "~/components/LinkModal";
import {
  Search, ExternalLink, FileText, DollarSign, Users, Building, FileCheck,
  TrendingUp, TrendingDown, Wallet, Plane, HeartPulse, Gavel, FileSignature,
  Scale, BarChart3, FolderOpen, Car, Pill, Network, Database, Landmark, BookOpen,
} from "lucide-react";

interface TransparencyLink {
  id: number;
  title: string;
  slug?: string | null;
  url: string;
  icon?: string | null;
  is_external: boolean;
  open_mode?: string | null;
  hide_chrome?: boolean | null;
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
  /** Link a abrir no modal ao acessar /transparencia/<slug> diretamente */
  openLink?: TransparencyLink | null;
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

function CardLink({
  link,
  onOpenModal,
}: {
  link: TransparencyLink;
  onOpenModal: (link: TransparencyLink) => void;
}) {
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
  if (link.open_mode === "modal") {
    return (
      <button type="button" onClick={() => onOpenModal(link)} className={className}>
        {inner}
      </button>
    );
  }
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

export default function TransparenciaIndex({ sections = [], openLink = null }: Props) {
  const [query, setQuery] = useState("");
  // openLink inicial = acesso direto a /transparencia/<slug>: modal já aberto no mount
  const [modalLink, setModalLink] = useState<TransparencyLink | null>(openLink);
  const [activeSection, setActiveSection] = useState<string | null>(
    sections[0]?.slug ?? null
  );

  // Deep-link: a prop openLink (rota /transparencia/<slug>) controla o modal —
  // também cobre voltar/avançar do navegador entre /transparencia e o slug.
  useEffect(() => {
    setModalLink(openLink ?? null);
  }, [openLink]);

  /** Abre o modal e leva a URL para /transparencia/<slug> (sem remontar a página) */
  const openModal = useCallback((link: TransparencyLink) => {
    setModalLink(link);
    if (link.slug) {
      router.visit(`/transparencia/${link.slug}`, {
        preserveScroll: true,
        preserveState: true,
      });
    }
  }, []);

  /** Fecha o modal e devolve a URL para /transparencia */
  const closeModal = useCallback(() => {
    setModalLink(null);
    if (typeof window !== "undefined" && window.location.pathname !== "/transparencia") {
      router.visit("/transparencia", { preserveScroll: true, preserveState: true });
    }
  }, []);

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

  // Scrollspy: observa os headings das seções do conteúdo e marca na sidebar
  // a seção que está na faixa superior do viewport durante o scroll.
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    const elements = filtered
      .map((s) => document.getElementById(`secao-${s.slug}`))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id.replace(/^secao-/, ""));
          }
        }
      },
      // Faixa entre 20% do topo e 30% da base: só uma seção "ativa" por vez
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filtered]);

  return (
    <>
      <SeoHead
        title="Portal da Transparência - Câmara Municipal de Sumé"
        description="Acesse informações sobre a gestão dos recursos públicos da Câmara Municipal de Sumé. Transparência e acesso à informação."
        url="/transparencia"
      />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Transparência" }]} />
        <PageHero
          badge="Acesso à Informação"
          title="Portal da Transparência"
          subtitle="Em cumprimento à Lei de Acesso à Informação (Lei nº 12.527/2011), disponibilizamos informações sobre a gestão dos recursos públicos da Câmara Municipal."
          centered
        />

        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
            <div className="lg:flex lg:items-start lg:gap-12 xl:gap-16">
              {/* Sidebar de navegação (padrão dos portais) — fixa, acompanha a
                  rolagem (sticky) sem rolagem interna própria. */}
              <aside className="hidden lg:block w-[280px] shrink-0 self-start sticky top-24 rounded-2xl">
                <nav className="bg-card rounded-2xl shadow-md border border-border/60 overflow-hidden">
                  {filtered.map((section) => {
                    const Icon = iconMap[section.icon || ""] || FolderOpen;
                    const isActive = activeSection === section.slug;
                    return (
                      <div key={section.id} className="border-b border-border/60 last:border-b-0">
                        <a
                          href={`#secao-${section.slug}`}
                          aria-current={isActive ? "true" : undefined}
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveSection(section.slug);
                            document
                              .getElementById(`secao-${section.slug}`)
                              ?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          className={`flex items-center gap-2.5 px-4 py-3.5 border-l-4 no-underline transition-colors ${
                            isActive
                              ? "bg-muted/60 border-primary"
                              : "border-transparent hover:bg-muted/60"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? "text-primary" : "text-muted-foreground"
                            }`}
                          />
                          <span
                            className={`text-[12px] font-bold uppercase tracking-wide transition-colors ${
                              isActive ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {section.title}
                          </span>
                        </a>
                        <div className="py-2 pl-11 pr-4">
                          {section.links.map((link) =>
                            link.open_mode === "modal" ? (
                              <button
                                key={link.id}
                                type="button"
                                onClick={() => openModal(link)}
                                className="block w-full text-left py-1.5 px-2 rounded-md text-[13px] text-muted-foreground transition-all hover:text-primary hover:bg-muted hover:pl-3"
                              >
                                {link.title}
                              </button>
                            ) : link.is_external ? (
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

                        <div className="grid gap-3 sm:gap-4 grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))]">
                          {section.links.map((link) => (
                            <CardLink key={link.id} link={link} onOpenModal={openModal} />
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
                    href="/#esic"
                    className="inline-flex items-center gap-2 btn-modern bg-gold text-navy-dark no-underline"
                  >
                    <Search className="w-5 h-5" />
                    Acessar e-SIC
                  </Link>
                </div>
              </div>
            </div>
            </div>
          </section>
        </main>

        <Footer />
        <LinkModal link={modalLink} onClose={closeModal} />
      </div>
    </>
  );
}
