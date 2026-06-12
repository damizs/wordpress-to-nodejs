import { useState } from "react";
import { Link } from "@inertiajs/react";
import { LinkModal, type LinkModalLink } from "~/components/LinkModal";
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
  open_mode?: string | null;
  hide_chrome?: boolean | null;
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

// Cores vindas do banco (quick_links.color) -> tokens institucionais (navy/gold/sky/emerald)
const colorMap: Record<string, string> = {
  navy: "bg-navy",
  blue: "bg-navy-light",
  gold: "bg-gold",
  sky: "bg-sky",
  emerald: "bg-emerald-600",
  green: "bg-emerald-600",
  red: "bg-navy",
  rose: "bg-gold",
  purple: "bg-navy-light",
  indigo: "bg-navy",
  teal: "bg-emerald-600",
  orange: "bg-gold",
};

const fallbackColors = [
  "bg-navy",
  "bg-gold",
  "bg-sky",
  "bg-emerald-600",
];

// Descrições curtas exibidas abaixo do título (igual ao portal WP)
const descriptionMap: Record<string, string> = {
  "sessões plenárias": "Acompanhe as sessões ordinárias e extraordinárias",
  "mesa diretora": "Presidente, vice e demais membros da Mesa",
  "comissões": "Comissões técnicas e suas atribuições",
  "regimento interno": "Normas de funcionamento da Casa legislativa",
  "vereadores": "Integrantes do Poder Legislativo Municipal",
  "atas e resumos": "Documentos oficiais das sessões realizadas",
  "ouvidoria": "Comunicação entre o cidadão e o Poder Legislativo",
  "leis municipais": "Normas e regulamentos da cidade",
  "transparência": "Portal de acesso a informações públicas",
  "ordem do dia": "Pauta das próximas sessões parlamentares",
  "lei orgânica": "Lei Orgânica do Município",
  "e-sic": "Serviço de Informações ao Cidadão",
  "pautas": "Pauta das próximas sessões parlamentares",
  "diário oficial": "Publicações e atos oficiais do município",
  "licitações": "Processos licitatórios e contratos",
  "a câmara": "História e estrutura do Poder Legislativo",
  "contra cheque": "Acesso ao contracheque dos servidores",
};

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
  const [modalLink, setModalLink] = useState<LinkModalLink | null>(null);

  return (
    <section className="py-14 lg:py-20 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-14" data-reveal>
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            {badge}
          </span>
          <h2 className="heading-accent text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {subtitle || "Acompanhe as funções legislativa, fiscalizadora e deliberativa da Casa do Povo."}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {items.map((item, index) => {
            const IconComponent = iconMap[item.icon || ""] || FileText;
            const color = colorMap[item.color || ""] || fallbackColors[index % fallbackColors.length];
            const description = descriptionMap[item.title.toLowerCase().trim()];
            const cardClass =
              "group card-modern p-6 no-underline flex flex-col items-center text-center";
            const cardStyle = {};
            const inner = (
              <>
                <div className={`w-14 h-14 rounded-full ${color} flex items-center justify-center mb-4 shadow-sm`}>
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors duration-300">
                  {item.title}
                </h3>
                {description && (
                  <p className="text-xs text-muted-foreground mt-2 leading-snug">{description}</p>
                )}
              </>
            );
            return item.open_mode === "modal" ? (
              <button
                key={item.id ?? index}
                type="button"
                onClick={() => setModalLink(item)}
                className={cardClass}
                style={cardStyle}
                data-reveal
                data-reveal-delay={index * 60}
              >
                {inner}
              </button>
            ) : isExternal(item.url) ? (
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
            Acessar portal transparência
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <LinkModal link={modalLink} onClose={() => setModalLink(null)} />
    </section>
  );
};
