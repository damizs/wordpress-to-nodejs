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

// Cor institucional ÚNICA dos círculos de ícone do Acesso Rápido.
// Antes os ícones recebiam cor por item (colorMap/fallback alternado), gerando
// efeito "arco-íris" com cara de template genérico. Agora todos usam navy fixo —
// consistente, institucional e com contraste AA (ícone branco sobre navy).
const ICON_CIRCLE_CLASS = "bg-navy";

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
  const sourceItems = quickLinks.length > 0 ? quickLinks : defaultItems;
  // Deduplica atalhos pelo título (ex.: 'Sessões Plenárias'/'Ouvidoria' repetidos
  // no banco com URLs diferentes) — mantém só a 1ª ocorrência. Não usa a URL na
  // chave porque há destinos distintos que compartilham rota (ex.: Regimento
  // Interno e Leis Municipais → /publicacoes-oficiais).
  const seen = new Set<string>();
  const allItems = sourceItems.filter((item) => {
    const key = (item.title || "").trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const items = itemLimit ? allItems.slice(0, itemLimit) : allItems;
  const [modalLink, setModalLink] = useState<LinkModalLink | null>(null);

  const defaultSubtitle = isCompact
    ? "Principais serviços e informações ao cidadão."
    : "Acompanhe as funções legislativa, fiscalizadora e deliberativa da Casa do Povo.";

  const gridClass = isCompact
    ? "grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6"
    : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-5";

  const searchForm = (
    <form
      action="/busca"
      method="get"
      role="search"
      className="flex w-full items-stretch overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-colors duration-200 focus-within:border-navy focus-within:ring-1 focus-within:ring-navy/20"
    >
      <label htmlFor="quickaccess-search" className="sr-only">
        Buscar no portal
      </label>
      <input
        id="quickaccess-search"
        name="q"
        type="search"
        className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-sm"
        placeholder="O que você procura no portal?"
      />
      <button
        type="submit"
        className="flex min-h-[2.75rem] cursor-pointer items-center gap-2 bg-navy px-4 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-navy-dark"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Buscar</span>
      </button>
    </form>
  );

  return (
    <section className={`section-block bg-background ${isCompact ? "border-b border-border" : ""}`}>
      <div className="container">
        {isCompact ? (
          <SectionHeading
            align="left"
            badge={badge}
            title={title}
            subtitle={subtitle || defaultSubtitle}
            action={<div className="w-full sm:max-w-sm">{searchForm}</div>}
            className="!mb-6 sm:!items-end"
          />
        ) : (
          <>
            <SectionHeading
              badge={badge}
              title={title}
              subtitle={subtitle || defaultSubtitle}
            />
            {showSearch && <div className="mx-auto mb-8 max-w-xl">{searchForm}</div>}
          </>
        )}

        <div className={gridClass}>
          {items.map((item, index) => {
            const IconComponent = iconMap[item.icon || ""] || FileText;
            const description = descriptionMap[item.title.toLowerCase().trim()];
            const cardClass =
              "group card-modern flex min-h-[126px] cursor-pointer flex-col items-center p-3 text-center no-underline transition-colors duration-200 hover:border-navy/30 sm:min-h-0 sm:p-6";
            const cardStyle = {};
            const inner = (
              <>
                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full ${ICON_CIRCLE_CLASS} flex items-center justify-center mb-2.5 sm:mb-4 shadow-sm`}>
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
