import { 
  Play, 
  Users, 
  FileText, 
  BookOpen, 
  UserCheck, 
  ScrollText, 
  MessageCircle, 
  Scale, 
  Eye, 
  Calendar,
  ArrowRight
} from "lucide-react";

const quickAccessItems = [
  { icon: Play, title: "Sessões Plenárias", description: "Acompanhe as sessões ordinárias e extraordinárias", color: "from-red-500 to-rose-600" },
  { icon: Users, title: "Mesa Diretora", description: "Presidente, vice e demais membros da Mesa", color: "from-blue-500 to-indigo-600" },
  { icon: FileText, title: "Comissões", description: "Comissões técnicas e suas atribuições", color: "from-green-500 to-emerald-600" },
  { icon: BookOpen, title: "Regimento Interno", description: "Normas de funcionamento da Casa Legislativa", color: "from-amber-500 to-orange-600" },
  { icon: UserCheck, title: "Vereadores", description: "Integrantes do Poder Legislativo Municipal", color: "from-teal-500 to-cyan-600" },
  { icon: ScrollText, title: "Atas e Resumos", description: "Documentos oficiais das sessões realizadas", color: "from-purple-500 to-violet-600" },
  { icon: MessageCircle, title: "Ouvidoria", description: "Atendimento de demandas do público", color: "from-pink-500 to-rose-600" },
  { icon: Scale, title: "Leis Municipais", description: "Normas e regulamentos da cidade", color: "from-sky-500 to-blue-600" },
  { icon: Eye, title: "Transparência", description: "Portal de acesso a informações públicas", color: "from-emerald-500 to-green-600" },
  { icon: Calendar, title: "Ordem do Dia", description: "Pauta das próximas sessões parlamentares", color: "from-indigo-500 to-purple-600" },
];

export const QuickAccessSection = () => {
  return (
    <section className="py-20 px-4 section-gradient">
      <div className="container mx-auto">
        <div className="text-center mb-14 animate-fade-in">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            Navegação Rápida
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Acesso Rápido
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Acompanhe as funções legislativa, fiscalizadora e deliberativa da Casa do Povo.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {quickAccessItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className="group card-modern p-6 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}>
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-foreground text-sm mb-2 group-hover:text-primary transition-colors duration-300">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </a>
          ))}
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
