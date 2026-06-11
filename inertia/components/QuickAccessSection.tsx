import { Link } from "@inertiajs/react";
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
  ArrowRight,
  Video,
  Building2,
  Landmark,
  Award,
  Table,
  HardHat,
  DollarSign,
  Coins,
  GraduationCap,
  BadgeCheck,
  ClipboardList,
  Handshake,
  FileSignature,
  Network,
  PieChart,
  MailOpen,
  ClipboardCheck,
  TrendingUp,
  AlertCircle,
  Gavel,
  Search,
  Shield,
  Link as LinkIcon,
  type LucideIcon
} from "lucide-react";

interface QuickLinkItem {
  id?: number;
  title: string;
  url: string;
  icon: string | null;
  color: string | null;
}

interface QuickAccessSectionProps {
  quickLinks?: QuickLinkItem[];
  badge?: string;
  title?: string;
  subtitle?: string;
}

const iconMap: Record<string, LucideIcon> = {
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
  Video,
  Building2,
  Landmark,
  Award,
  Table,
  HardHat,
  DollarSign,
  Coins,
  GraduationCap,
  BadgeCheck,
  ClipboardList,
  Handshake,
  FileSignature,
  Network,
  PieChart,
  MailOpen,
  ClipboardCheck,
  TrendingUp,
  AlertCircle,
  Gavel,
  Search,
  Shield,
  Link: LinkIcon,
};

// Cores vindas do banco (quick_links.color) -> gradientes do design system
const colorMap: Record<string, string> = {
  navy: "from-blue-700 to-indigo-800",
  blue: "from-blue-500 to-indigo-600",
  gold: "from-amber-500 to-orange-600",
  sky: "from-sky-500 to-blue-600",
  emerald: "from-emerald-500 to-green-600",
  green: "from-green-500 to-emerald-600",
  red: "from-red-500 to-rose-600",
  rose: "from-pink-500 to-rose-600",
  purple: "from-purple-500 to-violet-600",
  indigo: "from-indigo-500 to-purple-600",
  teal: "from-teal-500 to-cyan-600",
  orange: "from-amber-500 to-orange-600",
};

const fallbackGradients = [
  "from-red-500 to-rose-600",
  "from-blue-500 to-indigo-600",
  "from-green-500 to-emerald-600",
  "from-amber-500 to-orange-600",
  "from-teal-500 to-cyan-600",
  "from-purple-500 to-violet-600",
  "from-pink-500 to-rose-600",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-green-600",
  "from-indigo-500 to-purple-600",
];

const defaultItems: QuickLinkItem[] = [
  { title: "Sessões Plenárias", url: "/atas", icon: "Play", color: "red" },
  { title: "Mesa Diretora", url: "/mesa-diretora", icon: "Users", color: "blue" },
  { title: "Comissões", url: "/comissoes", icon: "FileText", color: "green" },
  { title: "Regimento Interno", url: "/publicacoes-oficiais", icon: "BookOpen", color: "gold" },
  { title: "Vereadores", url: "/vereadores", icon: "UserCheck", color: "teal" },
  { title: "Atas e Resumos", url: "/atas", icon: "ScrollText", color: "purple" },
  { title: "Ouvidoria", url: "/ouvidoria", icon: "MessageCircle", color: "rose" },
  { title: "Leis Municipais", url: "/publicacoes-oficiais", icon: "Scale", color: "sky" },
  { title: "Transparência", url: "/transparencia", icon: "Eye", color: "emerald" },
  { title: "Pautas", url: "/pautas", icon: "Calendar", color: "indigo" },
];

const isExternal = (url: string) => /^https?:\/\//i.test(url);

export const QuickAccessSection = ({
  quickLinks = [],
  badge = "Navegação Rápida",
  title = "Acesso Rápido",
  subtitle,
}: QuickAccessSectionProps) => {
  const items = quickLinks.length > 0 ? quickLinks : defaultItems;

  return (
    <section className="py-20 px-4 section-gradient">
      <div className="container mx-auto">
        <div className="text-center mb-14" data-reveal>
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            {badge}
          </span>
          <h2 className="heading-accent text-3xl md:text-5xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {subtitle || "Acompanhe as funções legislativa, fiscalizadora e deliberativa da Casa do Povo."}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {items.map((item, index) => {
            const IconComponent = iconMap[item.icon || ""] || FileText;
            const gradient =
              colorMap[item.color || ""] || fallbackGradients[index % fallbackGradients.length];
            const cardClass = "group card-modern card-shine p-6 no-underline";
            const cardStyle = {};
            const inner = (
              <>
                <div className={`icon-pop w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg group-hover:shadow-xl`}>
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors duration-300">
                  {item.title}
                </h3>
              </>
            );
            return isExternal(item.url) ? (
              <a
                key={item.id ?? index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClass}
                style={cardStyle}
                data-reveal
                data-reveal-delay={index * 60}
              >
                {inner}
              </a>
            ) : (
              <Link
                key={item.id ?? index}
                href={item.url}
                className={cardClass}
                style={cardStyle}
                data-reveal
                data-reveal-delay={index * 60}
              >
                {inner}
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/transparencia"
            className="btn-modern inline-flex items-center gap-3 bg-gradient-to-r from-primary to-navy-light text-primary-foreground shadow-lg hover:shadow-xl hover:gap-4 no-underline"
          >
            Acessar Portal Completo
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
