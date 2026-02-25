import { useState } from "react";
import { Link } from "@inertiajs/react";
import { Menu, X, ChevronDown } from "lucide-react";

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

const navItems = [
  { label: "Início", href: "/" },
  { label: "A Câmara", href: "/historia-da-camara", hasDropdown: true, subItems: camaraSubItems },
  { label: "Transparência", href: "/transparencia" },
  { label: "Licitações", href: "/licitacoes" },
  { label: "Notícias", href: "/noticias" },
  { label: "Cidadão", href: "/ouvidoria", hasDropdown: true, subItems: cidadaoSubItems },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedItem, setMobileExpandedItem] = useState<string | null>(null);

  return (
    <header className="relative z-50 bg-gradient-hero text-primary-foreground overflow-visible">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-sky/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Logo and Title */}
        <Link href="/" className="flex items-center justify-center gap-5 mb-8 animate-fade-in no-underline">
          <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-gold/20 blur-xl group-hover:bg-gold/30 transition-all duration-500" />
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full glass flex items-center justify-center border-2 border-primary-foreground/20 group-hover:border-gold/50 transition-all duration-500 group-hover:scale-105">
              <div className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold">C</div>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-primary-foreground">
              CÂMARA
            </h1>
            <p className="text-2xl md:text-4xl font-serif text-gradient-gold">MUNICIPAL DE SUMÉ</p>
            <p className="text-xs md:text-sm opacity-60 mt-2 tracking-wider uppercase text-primary-foreground">
              Estado da Paraíba
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:block relative z-40">
          <div className="glass rounded-2xl px-6 py-3 mx-auto max-w-3xl">
            <ul className="flex items-center justify-center gap-1">
              {navItems.map((item, index) => (
                <li key={index} className="relative group">
                  <Link
                    href={item.href}
                    className="relative flex items-center gap-1 px-4 py-2.5 text-sm font-medium tracking-wide rounded-xl hover:bg-primary-foreground/10 transition-all duration-300 text-primary-foreground no-underline"
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
                          className="block w-full text-left px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground transition-colors duration-200 no-underline text-foreground"
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
                  {item.hasDropdown ? (
                    <>
                      <button
                        onClick={() => setMobileExpandedItem(mobileExpandedItem === item.label ? null : item.label)}
                        className="flex items-center justify-between w-full py-3 px-4 text-sm font-medium hover:bg-primary-foreground/10 rounded-xl transition-all duration-300"
                      >
                        {item.label}
                        <ChevronDown className={`w-4 h-4 opacity-60 transition-transform duration-300 ${mobileExpandedItem === item.label ? "rotate-180" : ""}`} />
                      </button>
                      {item.subItems && mobileExpandedItem === item.label && (
                        <ul className="ml-4 border-l border-primary-foreground/20 pl-4 py-1">
                          {item.subItems.map((sub, subIndex) => (
                            <li key={subIndex}>
                              <Link
                                href={sub.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block w-full text-left py-2 px-3 text-sm opacity-80 hover:opacity-100 hover:bg-primary-foreground/10 rounded-lg transition-all duration-200 no-underline text-primary-foreground"
                              >
                                {sub.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center w-full py-3 px-4 text-sm font-medium hover:bg-primary-foreground/10 rounded-xl transition-all duration-300 no-underline text-primary-foreground"
                    >
                      {item.label}
                    </Link>
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
