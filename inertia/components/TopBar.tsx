import { Link } from "@inertiajs/react";
import { Search, HelpCircle, FileText, MessageSquare, Shield } from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";

export const TopBar = () => {
  const settings = useSiteSettings();
  const esicUrl = settings.esic_new_url && settings.esic_new_url !== "#" ? settings.esic_new_url : "/transparencia";

  const topLinks = [
    { icon: Search, label: "Portal da Transparência", href: "/transparencia", external: false },
    { icon: FileText, label: "E-Sic", href: esicUrl, external: esicUrl.startsWith("http") },
    { icon: MessageSquare, label: "Ouvidoria", href: "/ouvidoria", external: false },
    { icon: HelpCircle, label: "Perguntas Frequentes", href: "/perguntas-frequentes", external: false },
    { icon: Shield, label: "Política de Privacidade", href: "/politica-de-privacidade", external: false },
  ];

  return (
    <div className="bg-navy-dark text-primary-foreground py-2">
      <div className="container mx-auto px-4">
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs md:text-sm">
          {topLinks.map((link, index) =>
            link.external ? (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity duration-200 no-underline"
              >
                <link.icon className="w-3 h-3" />
                <span>{link.label}</span>
              </a>
            ) : (
              <Link
                key={index}
                href={link.href}
                className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity duration-200 no-underline"
              >
                <link.icon className="w-3 h-3" />
                <span>{link.label}</span>
              </Link>
            )
          )}
        </nav>
      </div>
    </div>
  );
};
