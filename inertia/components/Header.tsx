import { useEffect, useRef, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { Menu, X, ChevronDown, Sun, Moon, Search } from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";
import { DynamicTheme } from "~/components/DynamicTheme";
import { DynamicFavicon } from "~/components/DynamicFavicon";
import { ScrollReveal } from "~/components/ScrollReveal";
import { BackToTop } from "~/components/BackToTop";
import { AccessibilityBar, useDarkMode } from "~/components/AccessibilityBar";
import CampaignBanner from "~/components/CampaignBanner";
import { getSiteTemplate } from "~/lib/templates";

interface HeaderProps {
  logoUrl?: string | null;
}

interface NavSubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
  subItems?: NavSubItem[];
}

const camaraSubItems = [
  { label: "História da Câmara", href: "/historia-da-camara" },
  { label: "Vereadores", href: "/vereadores" },
  { label: "Mesa Diretora", href: "/mesa-diretora" },
  { label: "Comissões Permanentes", href: "/comissoes" },
  { label: "Atividades Legislativas", href: "/atividades-legislativas" },
  { label: "Atas das Sessões", href: "/atas" },
  { label: "Pautas", href: "/pautas" },
  { label: "Publicações Oficiais", href: "/publicacoes-oficiais" },
];

const cidadaoSubItems = [
  { label: "Ouvidoria", href: "/ouvidoria" },
  { label: "Perguntas Frequentes", href: "/perguntas-frequentes" },
  { label: "Pesquisa de Satisfação", href: "/pesquisa-de-satisfacao" },
  { label: "Política de Privacidade", href: "/politica-de-privacidade" },
  { label: "Mapa do Site", href: "/mapa-do-site" },
  { label: "Dados Abertos", href: "/dados-abertos" },
];

const defaultNavItems: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "A Câmara", href: "/historia-da-camara", hasDropdown: true, subItems: camaraSubItems },
  { label: "Transparência", href: "/transparencia" },
  { label: "Licitações", href: "/licitacoes" },
  { label: "Notícias", href: "/noticias" },
  { label: "Cidadão", href: "/ouvidoria", hasDropdown: true, subItems: cidadaoSubItems },
];

/** Menu editável no painel (/painel/menus); cai no padrão se a setting estiver vazia */
function parseNavItems(raw: string | null | undefined): NavItem[] {
  if (!raw) return defaultNavItems;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultNavItems;
    return parsed
      .filter((i: any) => i && i.label && i.href)
      .map((i: any) => ({
        label: String(i.label),
        href: String(i.href),
        hasDropdown: Array.isArray(i.children) && i.children.length > 0,
        subItems: Array.isArray(i.children)
          ? i.children
              .filter((c: any) => c && c.label && c.href)
              .map((c: any) => ({ label: String(c.label), href: String(c.href) }))
          : undefined,
      }));
  } catch {
    return defaultNavItems;
  }
}

export const Header = ({ logoUrl }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedItem, setMobileExpandedItem] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [dark, toggleDark] = useDarkMode();
  const settings = useSiteSettings();
  const navItems = parseNavItems(settings.header_menu);
  const template = getSiteTemplate(settings.site_template).key;
  // Modo embed (?embed=1): página renderizada dentro de um modal/iframe — sem cabeçalho
  const { url: currentUrl } = usePage();
  const isEmbed = /[?&]embed=1/.test(currentUrl);

  const resolvedLogo = logoUrl ?? settings.logo_url ?? null;
  const headerTitle = settings.header_title || "CÂMARA MUNICIPAL DE SUMÉ";
  const headerSubtitle = settings.header_subtitle || "Estado da Paraíba";
  const [titleFirstWord, ...titleRest] = headerTitle.split(" ");

  // Barra de navegação compacta que aparece ao rolar a página
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    setMobileExpandedItem(null);
    router.visit(href);
  };

  // Foco automático no campo de busca quando o overlay abre
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Fecha o overlay de busca com a tecla Escape
  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const value = searchTerm.trim();
    if (value.length < 2) return;
    setSearchOpen(false);
    setMobileMenuOpen(false);
    setSearchTerm("");
    router.get("/busca", { q: value });
  };

  if (isEmbed) return null;

  /* ---------------------------------------------------------------------------
   * Widgets globais (renderizados uma vez, em qualquer modelo): skip-link,
   * barra de acessibilidade, banner de campanha, tema/favicon dinâmicos,
   * reveal no scroll e botão "voltar ao topo".
   * ------------------------------------------------------------------------- */
  const widgets = (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-gold focus:text-navy-dark focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold focus:no-underline focus:shadow-lg"
      >
        Pular para o conteúdo
      </a>
      <AccessibilityBar />
      <CampaignBanner />
      <DynamicTheme />
      <DynamicFavicon />
      <ScrollReveal />
      <BackToTop />
    </>
  );

  /* Barra compacta fixa que surge ao rolar (desktop). Compartilhada pelos
     modelos que têm cabeçalho "alto"; o modelo compacto já é sticky e dispensa. */
  const compactBar = (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] hidden md:block transition-all duration-300 ${
        scrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      <div className="glass-dark shadow-lg">
        <div className="container h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 no-underline min-w-0">
            {resolvedLogo ? (
              <img src={resolvedLogo} alt={headerTitle} className="h-11 w-auto object-contain" />
            ) : (
              <span className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-navy-dark font-extrabold text-sm shrink-0">
                {titleFirstWord.charAt(0)}
              </span>
            )}
            <span className="text-sm font-bold text-white truncate">{headerTitle}</span>
          </Link>
          <ul className="flex items-center gap-0.5">
            {navItems.map((item, index) => (
              <li key={index} className="relative group">
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-3 py-2 text-[13px] font-medium rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors no-underline"
                >
                  {item.label}
                  {item.hasDropdown && <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-300" />}
                </Link>
                {item.hasDropdown && item.subItems && (
                  <div className="invisible group-hover:visible group-focus-within:visible opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 absolute top-full right-0 mt-1 min-w-[220px] rounded-xl shadow-xl z-[9999] transition-all duration-200 py-2 bg-background text-foreground border border-border">
                    {item.subItems.map((sub, subIndex) => (
                      <Link
                        key={subIndex}
                        href={sub.href}
                        className="block w-full text-left px-4 py-2.5 text-sm hover:bg-muted hover:text-primary transition-colors duration-200 no-underline"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                aria-expanded={searchOpen}
                aria-label="Abrir busca"
                title="Buscar"
                className="flex items-center justify-center p-2 ml-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={toggleDark}
                aria-pressed={dark}
                aria-label={dark ? "Desativar modo escuro" : "Ativar modo escuro"}
                title={dark ? "Modo claro" : "Modo escuro"}
                className="flex items-center justify-center p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                {dark ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  /* Itens de navegação (desktop) reutilizados pelos modelos novos — sempre
     sobre superfície escura (navy/gradiente), então tom claro. */
  const renderNavLinks = (dropdownAlign: "left" | "right" = "left") =>
    navItems.map((item, index) => (
      <li key={index} className="relative group">
        <Link
          href={item.href}
          className="flex items-center gap-1 px-3.5 py-2.5 text-sm font-medium rounded-lg text-primary-foreground/85 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors no-underline"
        >
          {item.label}
          {item.hasDropdown && (
            <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover:rotate-180 transition-transform duration-300" />
          )}
        </Link>
        {item.hasDropdown && item.subItems && (
          <div
            className={`invisible group-hover:visible group-focus-within:visible opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 absolute top-full ${
              dropdownAlign === "right" ? "right-0" : "left-0"
            } mt-1 min-w-[220px] rounded-xl shadow-xl z-[9999] transition-all duration-200 py-2 bg-background text-foreground border border-border`}
          >
            {item.subItems.map((sub, subIndex) => (
              <Link
                key={subIndex}
                href={sub.href}
                className="block w-full text-left px-4 py-2.5 text-sm hover:bg-muted hover:text-primary transition-colors duration-200 no-underline"
              >
                {sub.label}
              </Link>
            ))}
          </div>
        )}
      </li>
    ));

  const searchButtonDark = (
    <button
      type="button"
      onClick={() => setSearchOpen((v) => !v)}
      aria-expanded={searchOpen}
      aria-label="Abrir busca"
      title="Buscar"
      className="flex items-center justify-center p-2.5 rounded-lg text-primary-foreground/85 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
    >
      <Search className="w-5 h-5" aria-hidden="true" />
    </button>
  );

  /* Faixa de busca neutra (legível sobre qualquer fundo) — modelos novos. */
  const searchStripNeutral = searchOpen && (
    <div className="hidden md:block bg-card border-b border-border animate-fade-in">
      <form onSubmit={submitSearch} role="search" className="container py-3 flex items-center gap-3">
        <Search className="w-5 h-5 text-muted-foreground shrink-0" aria-hidden="true" />
        <input
          ref={searchInputRef}
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar no portal… (ex.: licitação, ata, lei)"
          aria-label="Termo de busca"
          className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
        >
          Buscar
        </button>
        <button
          type="button"
          onClick={() => setSearchOpen(false)}
          aria-label="Fechar busca"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );

  const mobileButton = (tone: "dark" | "light") => (
    <button
      type="button"
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      aria-expanded={mobileMenuOpen}
      aria-controls="menu-mobile"
      aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
      className={
        tone === "dark"
          ? "p-2.5 rounded-xl text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
          : "p-2.5 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
      }
    >
      {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
    </button>
  );

  /* Menu mobile neutro (bg-card) — modelos novos. */
  const mobileNavNeutral = mobileMenuOpen && (
    <nav id="menu-mobile" className="md:hidden bg-card border-t border-border p-4 animate-fade-in">
      <form onSubmit={submitSearch} role="search" className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar no portal…"
            aria-label="Termo de busca"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          aria-label="Buscar"
          className="px-3 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Buscar
        </button>
      </form>
      <ul className="flex flex-col gap-1">
        {navItems.map((item, index) => (
          <li key={index}>
            <button
              onClick={() => {
                if (item.hasDropdown) {
                  setMobileExpandedItem(mobileExpandedItem === item.label ? null : item.label);
                } else {
                  handleLinkClick(item.href);
                }
              }}
              className="flex items-center justify-between w-full py-3 px-4 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              {item.label}
              {item.hasDropdown && (
                <ChevronDown className={`w-4 h-4 opacity-60 transition-transform duration-300 ${mobileExpandedItem === item.label ? "rotate-180" : ""}`} />
              )}
            </button>
            {item.hasDropdown && item.subItems && mobileExpandedItem === item.label && (
              <ul className="ml-4 border-l border-border pl-4 py-1">
                {item.subItems.map((sub, subIndex) => (
                  <li key={subIndex}>
                    <button
                      onClick={() => handleLinkClick(sub.href)}
                      className="block w-full text-left py-2 px-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      {sub.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );

  const logoOrInitial = (imgClass: string) =>
    resolvedLogo ? (
      <img src={resolvedLogo} alt={headerTitle} className={imgClass} />
    ) : (
      <span className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-navy-dark font-extrabold shrink-0">
        {titleFirstWord.charAt(0)}
      </span>
    );

  const goldBottomLine = (
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
  );

  /* ===========================================================================
   * MODELO: CLÁSSICO / GOVERNAMENTAL
   * Faixa de identificação + barra de identidade clara + menu sólido (navy).
   * ========================================================================= */
  if (template === "classico") {
    return (
      <header className="relative z-50">
        {widgets}
        {compactBar}

        <div className="bg-navy-dark text-primary-foreground">
          <div className="container flex items-center justify-between h-8 text-xs">
            <span className="opacity-90">{headerSubtitle}</span>
            <span className="hidden sm:inline opacity-70">Portal Oficial</span>
          </div>
        </div>

        <div className="bg-card border-b border-border">
          <div className="container flex items-center justify-between gap-4 py-3">
            <Link href="/" className="flex items-center gap-3 no-underline min-w-0">
              {logoOrInitial("h-14 md:h-16 w-auto object-contain")}
              {!resolvedLogo && (
                <span className="min-w-0">
                  <span className="block text-base md:text-lg font-bold text-foreground leading-tight truncate">
                    {headerTitle}
                  </span>
                  <span className="block text-xs text-muted-foreground">{headerSubtitle}</span>
                </span>
              )}
            </Link>
            <div className="md:hidden">{mobileButton("light")}</div>
          </div>
        </div>

        <nav className="hidden md:block bg-navy text-primary-foreground border-b-2 border-gold">
          <div className="container flex items-center gap-0.5">
            <ul className="flex items-center gap-0.5">{renderNavLinks("left")}</ul>
            <div className="ml-auto">{searchButtonDark}</div>
          </div>
        </nav>

        {searchStripNeutral}
        {mobileNavNeutral}
      </header>
    );
  }

  /* ===========================================================================
   * MODELO: MODERNO / DESTAQUE
   * Cabeçalho enxuto em gradiente: logo à esquerda, navegação + busca à direita.
   * (O hero amplo da home é renderizado por HomeHero.)
   * ========================================================================= */
  if (template === "moderno") {
    return (
      <header className="relative z-50 bg-gradient-hero text-primary-foreground overflow-visible">
        {widgets}
        {compactBar}

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-sky/5 rounded-full blur-3xl" />
        </div>

        <div className="relative container flex items-center justify-between gap-4 py-4">
          <Link href="/" className="flex items-center gap-3 no-underline min-w-0">
            {logoOrInitial("h-12 md:h-16 w-auto object-contain")}
            {!resolvedLogo && (
              <span className="text-lg md:text-xl font-bold text-primary-foreground truncate">
                {headerTitle}
              </span>
            )}
          </Link>

          <nav className="hidden md:block">
            <ul className="flex items-center gap-0.5">
              {renderNavLinks("right")}
              <li>{searchButtonDark}</li>
            </ul>
          </nav>

          <div className="md:hidden">{mobileButton("dark")}</div>
        </div>

        {searchStripNeutral}
        {mobileNavNeutral}
        {goldBottomLine}
      </header>
    );
  }

  /* ===========================================================================
   * MODELO: COMPACTO / NOTÍCIAS
   * Barra slim sticky em navy: logo + título, menu e busca em uma única linha.
   * ========================================================================= */
  if (template === "compacto") {
    return (
      <header className="sticky top-0 z-50 bg-navy text-primary-foreground shadow-md">
        {widgets}

        <div className="container flex items-center justify-between gap-3 h-16">
          <Link href="/" className="flex items-center gap-2.5 no-underline min-w-0">
            {logoOrInitial("h-10 w-auto object-contain")}
            <span className="text-sm md:text-base font-bold text-primary-foreground truncate">
              {headerTitle}
            </span>
          </Link>

          <nav className="hidden md:block ml-auto">
            <ul className="flex items-center gap-0.5">{renderNavLinks("right")}</ul>
          </nav>

          <div className="hidden md:block">{searchButtonDark}</div>
          <div className="md:hidden">{mobileButton("dark")}</div>
        </div>

        {searchStripNeutral}
        {mobileNavNeutral}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold/70" />
      </header>
    );
  }

  /* ===========================================================================
   * MODELO: INSTITUCIONAL (padrão) — markup original preservado.
   * ========================================================================= */
  return (
    <header className="relative z-50 bg-gradient-hero text-primary-foreground overflow-visible">
      {widgets}
      {compactBar}
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-gold/[0.04] rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-sky/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="relative container py-8 md:py-10">
        {/* Logo and Title */}
        <Link href="/" className="flex items-center justify-center gap-4 mb-7 animate-fade-in no-underline">
          {resolvedLogo ? (
            <img src={resolvedLogo} alt={headerTitle} className="h-24 md:h-32 w-auto object-contain" />
          ) : (
            <>
              <div className="relative w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl glass flex items-center justify-center border border-primary-foreground/15 group-hover:border-gold/40 transition-colors duration-300">
                <span className="text-2xl md:text-3xl font-bold text-gradient-gold">{titleFirstWord.charAt(0)}</span>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight leading-tight text-primary-foreground">
                  {titleFirstWord}{" "}
                  <span className="text-gradient-gold">{titleRest.join(" ")}</span>
                </h1>
                <p className="text-[11px] md:text-xs opacity-60 mt-1.5 tracking-[0.18em] uppercase text-primary-foreground">
                  {headerSubtitle}
                </p>
              </div>
            </>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:block relative z-40">
          <div className="glass rounded-2xl px-6 py-3 mx-auto max-w-3xl">
            <ul className="flex items-center justify-center gap-1">
              {navItems.map((item, index) => (
                <li key={index} className="relative group">
                  <Link
                    href={item.href}
                    className="relative flex items-center gap-1 px-4 py-2.5 text-sm font-medium tracking-wide rounded-xl hover:bg-primary-foreground/10 transition-all duration-300 no-underline text-primary-foreground"
                  >
                    {item.label}
                    {item.hasDropdown && (
                      <ChevronDown className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-300" />
                    )}
                    <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
                  </Link>
                  {/* Desktop Dropdown */}
                  {item.hasDropdown && item.subItems && (
                    <div className="invisible group-hover:visible group-focus-within:visible opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 absolute top-full left-0 mt-1 min-w-[220px] rounded-xl shadow-xl z-[9999] transition-all duration-200 py-2 bg-background text-foreground border border-border">
                      {item.subItems.map((sub, subIndex) => (
                        <Link
                          key={subIndex}
                          href={sub.href}
                          className="block w-full text-left px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors duration-200 no-underline"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => setSearchOpen((v) => !v)}
                  aria-expanded={searchOpen}
                  aria-label="Abrir busca"
                  title="Buscar"
                  className="flex items-center justify-center p-2.5 ml-1 rounded-xl hover:bg-primary-foreground/10 transition-all duration-300 text-primary-foreground"
                >
                  <Search className="w-5 h-5" aria-hidden="true" />
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Overlay de busca (desktop): aparece abaixo da navegação ao clicar na lupa */}
        {searchOpen && (
          <div className="hidden md:block relative z-40 mt-4 animate-fade-in">
            <form
              onSubmit={submitSearch}
              role="search"
              className="glass rounded-2xl px-4 py-3 mx-auto max-w-2xl flex items-center gap-3"
            >
              <Search className="w-5 h-5 text-primary-foreground/70 shrink-0" aria-hidden="true" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar no portal… (ex.: licitação, ata, lei)"
                aria-label="Termo de busca"
                className="flex-1 bg-transparent border-0 outline-none text-primary-foreground placeholder:text-primary-foreground/50 text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gold text-navy-dark text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
              >
                Buscar
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Fechar busca"
                className="p-1.5 rounded-lg text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu Button */}
        <div className="md:hidden flex justify-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="menu-mobile"
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            className="p-3 glass rounded-xl hover:bg-primary-foreground/10 transition-all duration-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav id="menu-mobile" className="md:hidden mt-6 glass rounded-2xl p-4 animate-fade-in">
            <form onSubmit={submitSearch} role="search" className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/50 pointer-events-none" aria-hidden="true" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar no portal…"
                  aria-label="Termo de busca"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm outline-none focus:border-gold/60"
                />
              </div>
              <button
                type="submit"
                aria-label="Buscar"
                className="px-3 py-2.5 rounded-xl bg-gold text-navy-dark text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Buscar
              </button>
            </form>
            <ul className="flex flex-col gap-1">
              {navItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => {
                      if (item.hasDropdown) {
                        setMobileExpandedItem(mobileExpandedItem === item.label ? null : item.label);
                      } else {
                        handleLinkClick(item.href);
                      }
                    }}
                    className="flex items-center justify-between w-full py-3 px-4 text-sm font-medium hover:bg-primary-foreground/10 rounded-xl transition-all duration-300"
                  >
                    {item.label}
                    {item.hasDropdown && (
                      <ChevronDown className={`w-4 h-4 opacity-60 transition-transform duration-300 ${mobileExpandedItem === item.label ? "rotate-180" : ""}`} />
                    )}
                  </button>
                  {item.hasDropdown && item.subItems && mobileExpandedItem === item.label && (
                    <ul className="ml-4 border-l border-primary-foreground/20 pl-4 py-1">
                      {item.subItems.map((sub, subIndex) => (
                        <li key={subIndex}>
                          <button
                            onClick={() => handleLinkClick(sub.href)}
                            className="block w-full text-left py-2 px-3 text-sm opacity-80 hover:opacity-100 hover:bg-primary-foreground/10 rounded-lg transition-all duration-200"
                          >
                            {sub.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {goldBottomLine}
    </header>
  );
};
