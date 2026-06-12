import { useEffect, useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { Menu, X, ChevronDown, Sun, Moon } from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";
import { DynamicTheme } from "~/components/DynamicTheme";
import { DynamicFavicon } from "~/components/DynamicFavicon";
import { ScrollReveal } from "~/components/ScrollReveal";
import { BackToTop } from "~/components/BackToTop";
import { AccessibilityBar, useDarkMode } from "~/components/AccessibilityBar";
import CampaignBanner from "~/components/CampaignBanner";

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
  const [dark, toggleDark] = useDarkMode();
  const settings = useSiteSettings();
  const navItems = parseNavItems(settings.header_menu);
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

  // Alvo do skip-link: as páginas públicas definem cada uma o próprio <main>,
  // então o id "conteudo" é aplicado aqui ao <main> da página atual.
  useEffect(() => {
    const main = document.querySelector("main");
    if (main) {
      if (!main.id) main.id = "conteudo";
      if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
    }
  }, []);

  const handleLinkClick = (href: string) => {
    setMobileMenuOpen(false);
    setMobileExpandedItem(null);
    router.visit(href);
  };

  if (isEmbed) return null;

  return (
    <header className="relative z-50 bg-gradient-hero text-primary-foreground overflow-visible">
      {/* Skip-link: visível apenas ao receber foco (teclado) — requisito e-MAG */}
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

      {/* Navegação compacta fixa (aparece ao rolar) */}
      <div
        className={`fixed top-0 left-0 right-0 z-[60] hidden md:block transition-all duration-300 ${
          scrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="glass-dark shadow-lg">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5 no-underline min-w-0">
              {resolvedLogo ? (
                <img src={resolvedLogo} alt={headerTitle} className="h-9 w-auto object-contain" />
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
                    <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute top-full right-0 mt-1 min-w-[220px] rounded-xl shadow-xl z-[9999] transition-all duration-200 py-2 bg-background text-foreground border border-border">
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
                  onClick={toggleDark}
                  aria-pressed={dark}
                  aria-label={dark ? "Desativar modo escuro" : "Ativar modo escuro"}
                  title={dark ? "Modo claro" : "Modo escuro"}
                  className="flex items-center justify-center p-2 ml-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {dark ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-sky/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Logo and Title */}
        <Link href="/" className="flex items-center justify-center gap-5 mb-8 animate-fade-in no-underline">
          {resolvedLogo ? (
            /* Logo Image */
            <img 
              src={resolvedLogo} 
              alt={headerTitle} 
              className="h-24 md:h-32 w-auto object-contain"
            />
          ) : (
            /* Fallback: Text Logo */
            <>
              <div className="relative group">
                <div className="absolute inset-0 rounded-full bg-gold/20 blur-xl group-hover:bg-gold/30 transition-all duration-500" />
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full glass flex items-center justify-center border-2 border-primary-foreground/20 group-hover:border-gold/50 transition-all duration-500 group-hover:scale-105">
                  <div className="text-3xl md:text-4xl font-bold text-gradient-gold">{titleFirstWord.charAt(0)}</div>
                </div>
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-primary-foreground">
                  {titleFirstWord}
                </h1>
                <p className="text-2xl md:text-4xl text-gradient-gold">{titleRest.join(" ")}</p>
                <p className="text-xs md:text-sm opacity-60 mt-2 tracking-wider uppercase text-primary-foreground">
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
                    <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute top-full left-0 mt-1 min-w-[220px] rounded-xl shadow-xl z-[9999] transition-all duration-200 py-2 bg-background text-foreground border border-border">
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
            </ul>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex justify-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-3 glass rounded-xl hover:bg-primary-foreground/10 transition-all duration-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-6 glass rounded-2xl p-4 animate-fade-in">
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

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-sky" />
    </header>
  );
};
