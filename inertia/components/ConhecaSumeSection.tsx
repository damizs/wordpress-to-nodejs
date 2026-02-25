import { MapPin, Calendar, Users, Building2 } from "lucide-react";

interface ConhecaSumeSectionProps {
  title?: string | null;
  subtitle?: string | null;
}

export const ConhecaSumeSection = ({ title, subtitle }: ConhecaSumeSectionProps) => {
  const stats = [
    { icon: Calendar, value: "1951", label: "Ano de Emancipação" },
    { icon: Users, value: "16.000+", label: "Habitantes" },
    { icon: Building2, value: "838", label: "km² de Área" },
    { icon: MapPin, value: "Cariri", label: "Região" },
  ];

  return (
    <section className="py-16 px-4 section-gradient">
      <div className="container mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            Nossa Cidade
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            {title || 'Conheça Sumé'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {subtitle || 'Terra de gente acolhedora, rica em cultura e tradições do sertão paraibano.'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="card-modern p-6 text-center animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
