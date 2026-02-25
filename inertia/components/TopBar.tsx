import { Link } from "@inertiajs/react";
import { Search, HelpCircle, FileText, MessageSquare, Map, Shield } from "lucide-react";

const topLinks = [
  { icon: Search, label: "Portal da Transparência", href: "/transparencia" },
  { icon: FileText, label: "E-Sic", href: "/e-sic" },
  { icon: MessageSquare, label: "Ouvidoria", href: "/ouvidoria" },
  { icon: HelpCircle, label: "Perguntas Frequentes", href: "/perguntas-frequentes" },
  { icon: Map, label: "Mapa do Site", href: "/mapa-do-site" },
  { icon: Shield, label: "Política de Privacidade", href: "/politica-de-privacidade" },
];

export const TopBar = () => {
  return (
    <div className="bg-navy-dark text-primary-foreground py-2">
      <div className="container mx-auto px-4">
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs md:text-sm">
          {topLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity duration-200 no-underline"
            >
              <link.icon className="w-3 h-3" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};
