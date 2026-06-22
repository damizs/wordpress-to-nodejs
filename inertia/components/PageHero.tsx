interface PageHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  centered?: boolean;
  size?: "default" | "compact";
}

export const PageHero = ({ title, subtitle, badge, centered = false, size = "compact" }: PageHeroProps) => {
  const isCompact = size === "compact";

  return (
    <section
      className={`relative bg-gradient-hero text-primary-foreground overflow-hidden ${
        isCompact ? "py-6 sm:py-8 md:py-10" : "py-8 sm:py-12 md:py-16"
      }`}
    >
      {/* Decoração sutil — um único brilho dourado (dieta de efeitos) */}
      <div
        className="absolute -top-24 -right-16 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className={`relative container ${centered ? 'text-center' : ''}`}>
        {badge && (
          <span
            data-reveal="fade"
            className="inline-block px-4 py-1.5 bg-gold text-navy-dark rounded-full text-xs font-semibold tracking-wider uppercase mb-4 border border-transparent"
          >
            {badge}
          </span>
        )}
        <h1
          data-reveal="up"
          className={`font-bold mb-3 leading-tight ${
            isCompact ? "text-2xl sm:text-3xl md:text-[2.35rem]" : "text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem]"
          }`}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            data-reveal="up"
            data-reveal-delay="100"
            className={`text-base md:text-lg text-primary-foreground/85 ${centered ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Faixa dourada inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
    </section>
  );
};
