import { 
  FileCheck, 
  Gavel, 
  ClipboardList, 
  Building2, 
  Wallet, 
  Receipt, 
  GraduationCap, 
  Users2, 
  BarChart3,
  ExternalLink,
  Award,
  ArrowRight
} from "lucide-react";

const transparencyItems = [
  { icon: FileCheck, title: "Concursos e Seleções Públicas", color: "from-blue-500 to-indigo-600" },
  { icon: Gavel, title: "Apreciação e/ou Julgamento", color: "from-purple-500 to-violet-600" },
  { icon: ClipboardList, title: "Prestação de Contas da Gestão", color: "from-emerald-500 to-green-600" },
  { icon: Building2, title: "Obras", color: "from-amber-500 to-orange-600" },
  { icon: Wallet, title: "Diárias", color: "from-pink-500 to-rose-600" },
  { icon: Receipt, title: "Verbas Indenizatórias", color: "from-cyan-500 to-teal-600" },
  { icon: GraduationCap, title: "Relação de Estagiários", color: "from-red-500 to-rose-600" },
  { icon: Users2, title: "Funcionários Terceirizados", color: "from-indigo-500 to-purple-600" },
  { icon: BarChart3, title: "Relatório de Gestão", color: "from-sky-500 to-blue-600" },
];

export const TransparencySection = () => {
  return (
    <section id="transparencia" className="py-20 px-4 section-gradient">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-14 animate-fade-in">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            Portal da Transparência
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Acesso à Informação
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Acesse todas as informações sobre carta de serviço, obras, estagiários e muito mais
          </p>
        </div>

        {/* Radar da Transparência Banner */}
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 mb-12 text-primary-foreground animate-fade-in">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-navy" />
          <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-sky/10" />
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-gold/10 rounded-full blur-3xl animate-float" />
          
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-2xl bg-gradient-gold flex items-center justify-center shrink-0 shadow-glow animate-pulse-glow">
              <Award className="w-12 h-12 text-navy-dark" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="text-2xl font-serif font-bold mb-3">
                Radar da Transparência
              </h3>
              <p className="text-base opacity-80 mb-6 max-w-xl">
                Acompanhe nossa avaliação no Radar da Transparência ATRICON. 
                Comprometidos com a transparência e prestação de contas à população.
              </p>
              <a
                href="#"
                className="btn-modern inline-flex items-center gap-3 bg-gold text-navy-dark shadow-lg hover:shadow-glow"
              >
                Acessar Radar
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Transparency Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {transparencyItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className="group card-modern flex items-center gap-5 p-6 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}>
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <span className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                {item.title}
              </span>
              <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
