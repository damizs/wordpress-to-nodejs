import { Link, usePage } from "@inertiajs/react";
import { Search, HelpCircle, FileText, MessageSquare, Shield, Map, Database } from "lucide-react";

export const TopBar = () => {
  const { url: currentUrl } = usePage();
  const isEmbed = /[?&]embed=1/.test(currentUrl);

  const topLinks = [
    { icon: Search, label: "Portal da Transparência", href: "/transparencia", external: false },
    { icon: FileText, label: "E-Sic", href: "/esic", external: false },
    { icon: MessageSquare, label: "Ouvidoria", href: "/ouvidoria", external: false },
    { icon: HelpCircle, label: "Perguntas Frequentes", href: "/perguntas-frequentes", external: false },
    { icon: Shield, label: "Política de Privacidade", href: "/politica-de-privacidade", external: false },
    { icon: Map, label: "Mapa do Site", href: "/mapa-do-site", external: false },
    { icon: Database, label: "Dados Abertos", href: "/dados-abertos", external: false },
  ];

  const linkClass =
    "group flex items-center gap-1.5 text-white/70 hover:text-gold transition-colors duration-200 no-underline py-2";

  if (isEmbed) return null;

  return (
    <div className="bg-navy-dark text-primary-foreground border-b border-white/5">
      <div className="container">
        <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-0 text-[11px] md:text-xs font-medium tracking-wide">
          {topLinks.map((link, index) =>
            link.external ? (
              <a key={index} href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                <link.icon className="w-3 h-3 text-gold/70 group-hover:text-gold transition-colors" />
                <span>{link.label}</span>
              </a>
            ) : (
              <Link key={index} href={link.href} className={linkClass}>
                <link.icon className="w-3 h-3 text-gold/70 group-hover:text-gold transition-colors" />
                <span>{link.label}</span>
              </Link>
            )
          )}
        </nav>
      </div>
    </div>
  );
};
