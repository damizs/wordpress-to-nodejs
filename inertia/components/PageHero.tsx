import { Breadcrumb } from "./Breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export const PageHero = ({ title, subtitle, breadcrumbs = [] }: PageHeroProps) => {
  return (
    <section className="relative bg-gradient-hero text-primary-foreground py-16 px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-sky/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto">
        {breadcrumbs.length > 0 && (
          <div className="mb-6">
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}
        <h1 className="text-3xl md:text-5xl font-bold mb-4">{title}</h1>
        {subtitle && (
          <p className="text-lg text-primary-foreground/80 max-w-2xl">{subtitle}</p>
        )}
      </div>
    </section>
  );
};
