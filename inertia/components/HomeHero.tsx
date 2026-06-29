import { Link } from "@inertiajs/react";
import {
  ArrowRight,
  Calendar,
  Eye,
  FileText,
  Gavel,
  MailOpen,
  Users,
  type LucideIcon,
} from "lucide-react";
import { QuickAccessSection } from "~/components/QuickAccessSection";
import { SectionHeading } from "~/components/SectionHeading";
import { useSiteSettings } from "~/hooks/use_site_settings";

interface QuickLinkItem {
  title: string;
  url: string;
  icon: string | null;
  color: string | null;
  open_mode?: string | null;
  hide_chrome?: boolean | null;
}

interface HomeHeroLegislativo {
  totalMateriasAno: number;
  totalSessoesAno: number;
  ano: number;
}

interface HomeHeroProps {
  template: string;
  quickLinks?: QuickLinkItem[];
  legislativo?: HomeHeroLegislativo | null;
  legislatura?: string;
  /** Título/subtítulo do Banner Principal editáveis no painel (homepage_hero_*). */
  title?: string;
  subtitle?: string;
}

/** Atalhos nobres da abertura do modelo Moderno (transparência + serviços). */
const MODERNO_SHORTCUTS: { title: string; url: string; icon: LucideIcon; description: string }[] = [
  { title: "Transparência", url: "/transparencia", icon: Eye, description: "Receitas, despesas e contratos" },
  { title: "e-SIC", url: "/esic", icon: MailOpen, description: "Pedidos de acesso à informação" },
  { title: "Sessões e Pautas", url: "/pautas", icon: Calendar, description: "Agenda do plenário" },
  { title: "Vereadores", url: "/vereadores", icon: Users, description: "Conheça os parlamentares" },
];

/**
 * Abertura nobre da home. Renderizada quando o modelo tem `homeHero: true`:
 *  - Compacto → delega ao QuickAccessSection (faixa de atalhos + busca).
 *  - Moderno  → atalhos de transparência/serviços + indicadores do Legislativo,
 *    em fundo claro/institucional (as notícias têm a seção própria abaixo).
 */
export function HomeHero({
  template,
  quickLinks = [],
  legislativo = null,
  legislatura,
  title,
  subtitle,
}: HomeHeroProps) {
  const settings = useSiteSettings();
  const badge = settings.header_subtitle || "Estado da Paraíba";

  if (template === "compacto") {
    return (
      <QuickAccessSection
        variant="compact"
        quickLinks={quickLinks}
        badge={badge}
        title={title || "Acesso rápido"}
        showSearch
        itemLimit={6}
        showTransparenciaCta={false}
      />
    );
  }

  if (template !== "moderno") return null;

  const indicators = legislativo
    ? [
        { icon: Gavel, value: legislativo.totalSessoesAno, label: `sessões em ${legislativo.ano}` },
        { icon: FileText, value: legislativo.totalMateriasAno, label: `matérias em ${legislativo.ano}` },
      ]
    : [];

  return (
    <section className="section-block bg-muted/40 border-b border-border relative">
      {/* Aurora institucional sóbria atrás do conteúdo (decorativa, sem foco) */}
      <div className="hero-aurora" aria-hidden="true" />
      <div className="container relative z-10">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-stretch">
          {/* Coluna principal: boas-vindas + atalhos nobres */}
          <div className="min-w-0" data-reveal>
            <SectionHeading
              align="left"
              badge={badge}
              title={
                title ? (
                  title
                ) : (
                  <>
                    Portal oficial da <span className="text-primary">Câmara Municipal</span>
                  </>
                )
              }
              subtitle={
                subtitle ||
                "Acesso rápido à transparência, aos serviços ao cidadão e à atividade legislativa."
              }
              className="!mb-6 sm:!mb-8"
            />

            <ul className="grid grid-cols-2 gap-3 sm:gap-4">
              {MODERNO_SHORTCUTS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.url}>
                    <Link
                      href={item.url}
                      className="group card-modern flex h-full items-center gap-3 p-4 no-underline transition-colors duration-200 hover:border-navy/30 sm:gap-4 sm:p-5"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy shadow-sm sm:h-12 sm:w-12">
                        <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors sm:text-base">
                          {item.title}
                        </span>
                        <span className="mt-0.5 hidden text-xs text-muted-foreground leading-snug sm:block">
                          {item.description}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Aside institucional: indicadores do Legislativo + CTA */}
          <aside
            className="card-modern flex flex-col gap-5 p-6 sm:p-7"
            data-reveal
            data-reveal-delay="120"
          >
            <div>
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                Legislativo em números
              </span>
              {legislatura && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Legislatura <span className="font-semibold text-foreground">{legislatura}</span>
                </p>
              )}
            </div>

            {indicators.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {indicators.map((ind) => {
                  const Icon = ind.icon;
                  return (
                    <div
                      key={ind.label}
                      className="rounded-xl border border-border/60 bg-background/60 p-4"
                    >
                      <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gold/15">
                        <Icon className="h-[18px] w-[18px] text-gold" aria-hidden />
                      </span>
                      <span className="block text-2xl font-bold tabular-nums text-foreground">
                        {ind.value}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">{ind.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Acompanhe a produção legislativa, as sessões e as pautas da Casa.
              </p>
            )}

            <Link
              href="/transparencia"
              className="btn-modern mt-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-navy-light text-primary-foreground shadow-lg hover:gap-3 no-underline"
            >
              Acessar transparência
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
