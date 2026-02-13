import { useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";

const navItems = [
  { label: "Início", href: "/" },
  { label: "Notícias", href: "/noticias" },
  { label: "Vereadores", href: "/vereadores" },
  { label: "Transparência", href: "/transparencia" },
  { label: "Legislativo", href: "/atividades-legislativa" },
  { label: "Licitações", href: "/licitacoes" },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { get } = useSiteSettings();

  const title = get('header_title', 'CÂMARA MUNICIPAL DE SUMÉ');
  const subtitle = get('header_subtitle', 'Estado da Paraíba');
  const logoUrl = get('logo_url', '');

  const titleParts = title.includes('CÂMARA')
    ? { top: 'CÂMARA', bottom: title.replace('CÂMARA', '').replace('MUNICIPAL', '').trim() }
    : { top: title, bottom: '' };

  return (
    <header className="relative bg-gradient-hero text-primary-foreground overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-sky/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <a href="/" className="flex items-center justify-center gap-5 mb-8 animate-fade-in no-underline text-inherit">
          <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-gold/20 blur-xl group-hover:bg-gold/30 transition-all duration-500" />
            {logoUrl ? (
              <img src={logoUrl} alt={title} className="relative w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-primary-foreground/20" />
            ) : (
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full glass flex items-center justify-center border-2 border-primary-foreground/20 group-hover:border-gold/50 transition-all duration-500 group-hover:scale-105">
                <div className="text-3xl md:text-4xl font-serif font-bold text-gradient-gold">C</div>
              </div>
            )}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight">{titleParts.top}</h1>
            {titleParts.bottom && <p className="text-2xl md:text-4xl font-serif text-gradient-gold">{titleParts.bottom}</p>}
            <p className="text-xs md:text-sm opacity-60 mt-2 tracking-wider uppercase">{subtitle}</p>
          </div>
        </a>

        <nav className="hidden md:block">
          <div className="glass rounded-2xl px-6 py-3 mx-auto max-w-3xl">
            <ul className="flex items-center justify-center gap-1">
              {navItems.map((item, i) => (
                <li key={i}>
                  <a href={item.href} className="relative flex items-center gap-1 px-4 py-2.5 text-sm font-medium tracking-wide rounded-xl hover:bg-primary-foreground/10 transition-all duration-300 group">
                    {item.label}
                    <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="md:hidden flex justify-center">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-3 glass rounded-xl hover:bg-primary-foreground/10 transition-all duration-300">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-6 glass rounded-2xl p-4 animate-fade-in">
            <ul className="flex flex-col gap-1">
              {navItems.map((item, i) => (
                <li key={i}>
                  <a href={item.href} className="flex items-center justify-between py-3 px-4 text-sm font-medium hover:bg-primary-foreground/10 rounded-xl transition-all duration-300">{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold to-sky" />
    </header>
  );
};
