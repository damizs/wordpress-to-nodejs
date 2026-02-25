import { ArrowRight, Users } from "lucide-react";
import { Link } from "@inertiajs/react";

interface Councilor {
  id: number;
  name: string;
  slug: string;
  party?: string;
  photo_url?: string;
  position?: string;
}

interface VereadoresSectionProps {
  councilors?: Councilor[];
  title?: string | null;
  subtitle?: string | null;
  badge?: string | null;
}

const defaultPhoto = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face";

export const VereadoresSection = ({ 
  councilors = [], 
  title, 
  subtitle, 
  badge 
}: VereadoresSectionProps) => {
  if (councilors.length === 0) return null;
  
  // Show max 8 councilors on homepage
  const displayedCouncilors = councilors.slice(0, 8);

  return (
    <section className="py-16 px-4 section-gradient">
      <div className="container mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            {badge || 'Poder Legislativo'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {title || 'Nossos Vereadores'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {subtitle || 'Conheça os representantes eleitos pela população para defender os interesses da comunidade sumeense'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedCouncilors.map((councilor, index) => (
            <Link
              key={councilor.id}
              href={`/vereadores/${councilor.slug}`}
              className="group card-modern p-5 text-center animate-fade-in no-underline"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative mx-auto w-24 h-24 md:w-28 md:h-28 mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-navy-light opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
                <img
                  src={councilor.photo_url || defaultPhoto}
                  alt={councilor.name}
                  className="relative w-full h-full rounded-full object-cover border-4 border-card group-hover:border-gold transition-all duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-bold text-foreground text-sm md:text-base group-hover:text-primary transition-colors duration-300 mb-1">
                {councilor.name}
              </h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {councilor.party || 'Vereador(a)'}
              </p>
              {councilor.position && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-gold/20 text-gold text-xs rounded-full">
                  {councilor.position}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/vereadores"
            className="btn-modern inline-flex items-center gap-3 bg-gradient-to-r from-primary to-navy-light text-primary-foreground shadow-lg hover:shadow-xl hover:gap-4 no-underline"
          >
            <Users className="w-5 h-5" />
            Ver todos os vereadores
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
