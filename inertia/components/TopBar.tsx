import { Search, HelpCircle, FileText, MessageSquare, Map, Shield } from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";

export const TopBar = () => {
  const { get } = useSiteSettings();
  const esicUrl = get('esic_new_url', '#');

  const topLinks = [
    { icon: Search, label: "Portal da Transparência", href: "/transparencia" },
    { icon: FileText, label: "E-SIC", href: esicUrl },
    { icon: MessageSquare, label: "Ouvidoria", href: "#" },
    { icon: HelpCircle, label: "Perguntas Frequentes", href: "/perguntas-frequentes" },
    { icon: Map, label: "Mapa do Site", href: "#" },
    { icon: Shield, label: "Política de Privacidade", href: "/politica-de-privacidade" },
  ];

  return (
    <div className="bg-navy-dark text-primary-foreground py-2">
      <div className="container mx-auto px-4">
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs md:text-sm">
          {topLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity duration-200"
            >
              <link.icon className="w-3 h-3" />
              <span>{link.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};
