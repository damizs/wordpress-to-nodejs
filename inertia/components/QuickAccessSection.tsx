import { useState } from "react";
import { Link } from "@inertiajs/react";
import { LinkModal, type LinkModalLink } from "~/components/LinkModal";
import { SectionHeading } from "~/components/SectionHeading";
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
  /** `compact` = abertura do modelo Compacto (6 cols, busca, sem CTA extra). */
  variant?: "default" | "compact";
  showSearch?: boolean;
  itemLimit?: number;
  showTransparenciaCta?: boolean;
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
  // Aliases para valores legados gravados como gradiente Tailwind pelo form
  "from-red-500 to-rose-600": "bg-navy",
  "from-blue-500 to-indigo-600": "bg-navy-light",
  "from-green-500 to-emerald-600": "bg-emerald-600",
  "from-amber-500 to-orange-600": "bg-gold",
  "from-teal-500 to-cyan-600": "bg-emerald-600",
  "from-purple-500 to-violet-600": "bg-navy-light",
  "from-pink-500 to-rose-600": "bg-gold",
  "from-sky-500 to-blue-600": "bg-sky",
  "from-emerald-500 to-green-600": "bg-emerald-600",
  "from-indigo-500 to-purple-600": "bg-navy",
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
  variant = "default",
  showSearch = false,
  itemLimit,
  showTransparenciaCta = true,
}: QuickAccessSectionProps) => {
  const isCompact = variant === "compact";
  const allItems = quickLinks.length > 0 ? quickLinks : defaultItems;
  const items = itemLimit ? allItems.slice(0, itemLimit) : allItems;
  const [modalLink, setModalLink] = useState<LinkModalLink | null>(null);

  const defaultSubtitle = isCompact
    ? "Principais serviços e informações ao cidadão."
    : "Acompanhe as funções legislativa, fiscalizadora e deliberativa da Casa do Povo.";

  const gridClass = isCompact
    ? "grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6"
    : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-5";

  return (
    <section className={`section-block bg-background ${isCompact ? "border-b border-border" : ""}`}>
      <div className="container">
        <SectionHeading
          badge={badge}
          title={title}
          subtitle={subtitle || defaultSubtitle}
        />

        {showSearch && (
          <form
            action="/busca"
            method="get"
            role="search"
            className="mx-auto mb-8 flex max-w-xl items-stretch overflow-hidden rounded-lg border border-border bg-card shadow-sm focus-within:border-navy focus-within:ring-1 focus-within:ring-navy/20"
          >
            <label htmlFor="quickaccess-search" className="sr-only">
              Buscar no portal
            </label>
            <input
              id="quickaccess-search"
              name="q"
              type="search"
              className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              placeholder="O que você procura no portal?"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-navy px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-navy-dark"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Buscar</span>
            </button>
          </form>
        )}

        <div className={gridClass}>
          {items.map((item, index) => {
            const IconComponent = iconMap[item.icon || ""] || FileText;
            const color = colorMap[item.color || ""] || fallbackColors[index % fallbackColors.length];
            const description = descriptionMap[item.title.toLowerCase().trim()];
            const cardClass =
              "group card-modern p-3 sm:p-6 no-underline flex flex-col items-center text-center min-h-[126px] sm:min-h-0";
            const cardStyle = {};
            const inner = (
              <>
                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full ${color} flex items-center justify-center mb-2.5 sm:mb-4 shadow-sm`}>
                  <IconComponent className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="font-bold text-foreground text-[13px] sm:text-sm leading-snug group-hover:text-primary transition-colors duration-300">
                  {item.title}
                </h3>
                {description && !isCompact && (
                  <p className="hidden sm:block text-xs text-muted-foreground mt-2 leading-snug">{description}</p>
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

        {showTransparenciaCta && (
          <div className="text-center mt-10 sm:mt-12">
            <Link
              href="/transparencia"
              className="btn-modern inline-flex items-center justify-center gap-3 w-full sm:w-auto bg-gradient-to-r from-primary to-navy-light text-primary-foreground shadow-lg hover:shadow-xl hover:gap-4 no-underline"
            >
              Acessar portal transparência
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>

      <LinkModal link={modalLink} onClose={() => setModalLink(null)} />
    </section>
  );
};
