import { Link } from "@inertiajs/react";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1 no-underline">
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Página Inicial</span>
          </Link>
          {items.map((item, index) => (
            <span key={index} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4" />
              {item.href ? (
                <Link href={item.href} className="hover:text-primary transition-colors no-underline">
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </div>
  );
};
