import { Link } from "@inertiajs/react";
import { FileText, Users, DollarSign, FileSearch, Building, Shield, ArrowRight } from "lucide-react";

interface TransparencyLink {
  id: number;
  icon: string;
  title: string;
  description: string;
  href: string;
}

interface TransparencySectionProps {
  links?: TransparencyLink[];
}

const iconMap: Record<string, any> = {
  FileText,
  Users,
  DollarSign,
  FileSearch,
  Building,
  Shield,
};

const defaultLinks: TransparencyLink[] = [
  { id: 1, icon: "FileText", title: "Receitas e Despesas", description: "Acompanhe a execução orçamentária em tempo real", href: "/transparencia" },
  { id: 2, icon: "Users", title: "Servidores", description: "Quadro de pessoal e remunerações", href: "/transparencia" },
  { id: 3, icon: "DollarSign", title: "Licitações", description: "Processos licitatórios e contratos", href: "/licitacoes" },
  { id: 4, icon: "FileSearch", title: "Contratos", description: "Contratos e convênios vigentes", href: "/transparencia" },
  { id: 5, icon: "Building", title: "Diárias e Passagens", description: "Despesas com viagens e deslocamentos", href: "/transparencia" },
  { id: 6, icon: "Shield", title: "Informações Institucionais", description: "Organograma, competências e estrutura", href: "/historia-da-camara" },
];

export const TransparencySection = ({ links = defaultLinks }: TransparencySectionProps) => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-14 animate-fade-in">
          <span className="inline-block px-4 py-1.5 bg-gold/10 text-gold rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            Portal da Transparência
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Transparência Pública
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Acesso à informação pública como direito fundamental do cidadão.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link, index) => {
            const IconComponent = iconMap[link.icon] || FileText;
            return (
              <Link
                key={link.id}
                href={link.href}
                className="group card-modern p-6 animate-fade-in no-underline"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-6 h-6 text-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/transparencia"
            className="btn-modern inline-flex items-center gap-3 bg-gradient-to-r from-gold to-gold-light text-navy-dark shadow-lg hover:shadow-glow hover:gap-4 no-underline"
          >
            Acessar Portal Completo
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
