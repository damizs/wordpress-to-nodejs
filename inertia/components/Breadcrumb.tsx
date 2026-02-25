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
    <div className="bg-gray-100 border-b border-gray-200">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-sm text-gray-600 py-3">
        <Link href="/" className="hover:text-navy transition-colors flex items-center gap-1 no-underline">
          <Home className="w-4 h-4" />
          <span>Início</span>
        </Link>
        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {item.href ? (
              <Link href={item.href} className="hover:text-navy transition-colors no-underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-800 font-medium">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
    </div>
  );
};
