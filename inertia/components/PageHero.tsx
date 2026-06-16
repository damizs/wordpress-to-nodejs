interface PageHeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  centered?: boolean;
}

export const PageHero = ({ title, subtitle, badge, centered = false }: PageHeroProps) => {
  return (
    <section className="relative bg-gradient-hero text-primary-foreground py-8 sm:py-12 md:py-16 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-sky/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className={`relative container ${centered ? 'text-center' : ''}`}>
        {badge && (
          <span
            data-reveal="fade"
            className="inline-block px-4 py-1.5 bg-gold text-navy-dark rounded-full text-xs font-semibold tracking-wider uppercase mb-4 border border-transparent"
          >
            {badge}
          </span>
        )}
        <h1 data-reveal="up" className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-bold mb-3 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p
            data-reveal="up"
            data-reveal-delay="100"
            className={`text-base md:text-lg text-primary-foreground/75 ${centered ? 'max-w-2xl mx-auto' : 'max-w-2xl'}`}
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
