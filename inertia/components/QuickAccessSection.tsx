import {
  Play, Users, FileText, BookOpen, UserCheck, ScrollText, MessageCircle,
  Scale, Eye, Calendar, ArrowRight, Shield, Phone, Building2, Search,
  Download, ExternalLink, Globe, Mail, MapPin, Gavel, Link2,
} from "lucide-react";

const iconMap: Record<string, any> = {
  Play, Users, FileText, BookOpen, UserCheck, ScrollText, MessageCircle,
  Scale, Eye, Calendar, Shield, Phone, Building2, Search, Download,
  ExternalLink, Globe, Mail, MapPin, Gavel, Link2, ArrowRight,
};

const defaultColors = [
  "from-red-500 to-rose-600", "from-blue-500 to-indigo-600", "from-green-500 to-emerald-600",
  "from-amber-500 to-orange-600", "from-teal-500 to-cyan-600", "from-purple-500 to-violet-600",
  "from-pink-500 to-rose-600", "from-sky-500 to-blue-600", "from-emerald-500 to-green-600",
  "from-indigo-500 to-purple-600",
];

interface QuickAccessSectionProps {
  quickLinks?: any[];
  title?: string | null;
  subtitle?: string | null;
  badge?: string | null;
}

export const QuickAccessSection = ({ quickLinks, title, subtitle, badge }: QuickAccessSectionProps) => {
  const links = quickLinks && quickLinks.length > 0 ? quickLinks : [];

  if (links.length === 0) return null;

  return (
    <section className="py-20 px-4 section-gradient">
      <div className="container mx-auto">
        <div className="text-center mb-14 animate-fade-in">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            {badge || 'Navegação Rápida'}
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
            {title || 'Acesso Rápido'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {subtitle || 'Acompanhe as funções legislativa, fiscalizadora e deliberativa da Casa do Povo.'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {links.map((item: any, index: number) => {
            const IconComponent = iconMap[item.icon] || Globe;
            const color = item.color || defaultColors[index % defaultColors.length];

            return (
              <a
                key={item.id || index}
                href={item.url || '#'}
                className="group card-modern p-6 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                target={item.url?.startsWith('http') ? '_blank' : undefined}
                rel={item.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}>
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-foreground text-sm mb-2 group-hover:text-primary transition-colors duration-300">
                  {item.title}
                </h3>
              </a>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <a
            href="#transparencia"
            className="btn-modern inline-flex items-center gap-3 bg-gradient-to-r from-primary to-navy-light text-primary-foreground shadow-lg hover:shadow-xl hover:gap-4"
          >
            Acessar Portal Completo
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};
