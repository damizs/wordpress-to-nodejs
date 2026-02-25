interface PageHeroProps {
  title: string;
  subtitle?: string;
}

export const PageHero = ({ title, subtitle }: PageHeroProps) => {
  return (
    <section className="relative bg-gradient-hero text-primary-foreground py-12 md:py-16">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-sky/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{title}</h1>
        {subtitle && (
          <p className="text-base md:text-lg text-primary-foreground/80 max-w-2xl">{subtitle}</p>
        )}
      </div>
    </section>
  );
};
