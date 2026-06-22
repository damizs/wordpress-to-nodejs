import { Link, usePage } from "@inertiajs/react";
import {
  ChevronDown,
  Database,
  FileText,
  HelpCircle,
  Map,
  MessageSquare,
  Search,
  Shield,
} from "lucide-react";

export const TopBar = () => {
  const { url: currentUrl } = usePage();
  const isEmbed = /[?&]embed=1/.test(currentUrl);

  const topLinks = [
    { icon: Search, label: "Portal da Transparência", shortLabel: "Transparência", href: "/transparencia", external: false },
    { icon: FileText, label: "E-Sic", shortLabel: "E-Sic", href: "/#esic", external: false },
    { icon: MessageSquare, label: "Ouvidoria", shortLabel: "Ouvidoria", href: "/ouvidoria", external: false },
    { icon: HelpCircle, label: "Perguntas Frequentes", shortLabel: "FAQ", href: "/perguntas-frequentes", external: false },
    { icon: Shield, label: "Política de Privacidade", shortLabel: "Privacidade", href: "/politica-de-privacidade", external: false },
    { icon: Map, label: "Mapa do Site", shortLabel: "Mapa", href: "/mapa-do-site", external: false },
    { icon: Database, label: "Dados Abertos", shortLabel: "Dados", href: "/dados-abertos", external: false },
  ];

  const primaryMobileLinks = topLinks.slice(0, 2);
  const tabletLinks = topLinks.slice(0, 5);

  const renderTopLink = (link: (typeof topLinks)[number], index: number, compact = false) => {
    const Icon = link.icon;
    const className = compact
      ? "group flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-semibold text-white/75 no-underline transition-colors hover:bg-white/5 hover:text-gold"
      : "group flex items-center gap-1.5 py-2 text-white/70 no-underline transition-colors duration-200 hover:text-gold";
    const content = (
      <>
        <Icon className="h-3.5 w-3.5 shrink-0 text-gold/70 transition-colors group-hover:text-gold" />
        <span className={compact ? "min-w-0 truncate" : undefined}>
          {compact ? link.shortLabel : link.label}
        </span>
      </>
    );

    return link.external ? (
      <a key={index} href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    ) : (
      <Link key={index} href={link.href} className={className}>
        {content}
      </Link>
    );
  };

  const renderMoreMenu = (links: typeof topLinks) => (
    <details className="group relative justify-self-end">
      <summary className="flex min-h-[2.25rem] cursor-pointer list-none items-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-semibold text-white/75 transition-colors hover:bg-white/5 hover:text-gold [&::-webkit-details-marker]:hidden">
        <span>Mais</span>
        <ChevronDown className="h-3 w-3 shrink-0 text-gold/70 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute right-0 top-full z-[70] mt-1 w-[min(16rem,calc(100vw-3rem))] rounded-xl border border-border bg-card p-2 text-card-foreground shadow-xl">
        {links.map((link, index) => {
          const Icon = link.icon;
          const className =
            "flex min-h-[2.5rem] items-center gap-2 rounded-lg px-3 py-2 text-xs text-foreground no-underline hover:bg-muted";
          const content = (
            <>
              <Icon className="h-3.5 w-3.5 shrink-0 text-gold" />
              <span className="min-w-0 truncate">{link.label}</span>
            </>
          );

          return link.external ? (
            <a key={index} href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
              {content}
            </a>
          ) : (
            <Link key={index} href={link.href} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </details>
  );

  if (isEmbed) return null;

  return (
    <div className="border-b border-white/5 bg-navy-dark text-primary-foreground">
      <div className="container">
        <nav className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-center gap-1 py-1.5 tracking-wide md:hidden">
          {primaryMobileLinks.map((link, index) => renderTopLink(link, index, true))}
          {renderMoreMenu(topLinks.slice(primaryMobileLinks.length))}
        </nav>

        <nav className="hidden items-center justify-center gap-x-4 py-2 text-xs font-medium tracking-wide whitespace-nowrap md:flex xl:hidden">
          {tabletLinks.map((link, index) => renderTopLink(link, index))}
          {renderMoreMenu(topLinks.slice(tabletLinks.length))}
        </nav>

        <nav className="hidden items-center justify-center gap-x-7 py-2 text-xs font-medium tracking-wide whitespace-nowrap xl:flex">
          {topLinks.map((link, index) => renderTopLink(link, index))}
        </nav>
      </div>
    </div>
  );
};
