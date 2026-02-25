import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <div className="container mx-auto px-4 py-3 border-b border-border">
      <nav className="flex items-center gap-2 text-sm flex-wrap">
        <a href="/" className="text-primary hover:underline">
          Página Inicial
        </a>
        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            {item.href ? (
              <a href={item.href} className="text-primary hover:underline">
                {item.label}
              </a>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </div>
  );
};
