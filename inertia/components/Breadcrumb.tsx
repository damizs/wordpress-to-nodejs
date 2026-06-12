import { Link } from "@inertiajs/react";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /**
   * Quando true, alinha a trilha ao mesmo wrapper `max-w-4xl mx-auto`
   * usado pelo conteúdo de páginas "estreitas" (FAQ, Política de Privacidade),
   * para que a margem esquerda do breadcrumb case com a do conteúdo.
   */
  narrow?: boolean;
}

export const Breadcrumb = ({ items, narrow = false }: BreadcrumbProps) => {
  return (
    <div className="bg-muted/60 border-b border-border/60">
      <nav
        aria-label="Trilha de navegação"
        className="container py-2.5 overflow-x-auto"
      >
        <div
          className={`flex items-center gap-1.5 text-[13px] text-muted-foreground whitespace-nowrap ${narrow ? "max-w-4xl mx-auto" : ""}`}
        >
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1 no-underline shrink-0">
            <Home className="w-3.5 h-3.5" />
            <span>Início</span>
          </Link>
          {items.map((item, index) => (
            <span key={index} className="flex items-center gap-1.5 shrink-0">
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
              {item.href ? (
                <Link href={item.href} className="hover:text-primary transition-colors no-underline">
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-semibold">{item.label}</span>
              )}
            </span>
          ))}
        </div>
      </nav>
    </div>
  );
};
