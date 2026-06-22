import { Link } from "@inertiajs/react";
import {
  Award, ExternalLink, FileText, HardHat, Plane,
  Coins, GraduationCap, Users, ClipboardList, Gavel, BarChart3, BookOpen,
  Briefcase, Building, Scale, FolderOpen,
} from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";
import { SectionHeading } from "~/components/SectionHeading";
import { InfiniteCarousel } from "~/components/InfiniteCarousel";

interface InfoCategory {
  id: number;
  name: string;
  slug: string;
}

interface TransparencySectionProps {
  categories?: InfoCategory[];
  title?: string;
  subtitle?: string;
}

/** Ícone por palavra-chave da categoria (padrão do portal WP) */
function categoryIcon(name: string) {
  const t = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (t.includes("obra")) return HardHat;
  if (t.includes("diaria")) return Plane;
  if (t.includes("verba")) return Coins;
  if (t.includes("estagiario")) return GraduationCap;
  if (t.includes("terceirizado")) return Briefcase;
  if (t.includes("servidor") || t.includes("pessoal")) return Users;
  if (t.includes("concurso") || t.includes("seletivo")) return ClipboardList;
  if (t.includes("julgamento") || t.includes("apreciacao")) return Gavel;
  if (t.includes("prestacao") || t.includes("contas") || t.includes("relatorio")) return BarChart3;
  if (t.includes("carta")) return BookOpen;
  if (t.includes("patrimonio") || t.includes("imovel")) return Building;
  if (t.includes("lei") || t.includes("norma")) return Scale;
  if (t.includes("dados")) return FolderOpen;
  return FileText;
}

/** Paleta restrita aos tokens do design system, alternando por índice */
const CATEGORY_PALETTE = [
  { circle: "bg-navy/10", icon: "text-navy dark:text-navy-light" },
  { circle: "bg-gold/15", icon: "text-amber-700 dark:text-amber-300" },
  { circle: "bg-sky/10", icon: "text-sky" },
  { circle: "bg-emerald-600/10", icon: "text-emerald-700 dark:text-emerald-300" },
] as const;

export const TransparencySection = ({
  categories = [],
  title = "Acesso à Informação",
  subtitle,
}: TransparencySectionProps) => {
  const settings = useSiteSettings();
  const radarUrl = settings.radar_atricon_url || "https://radardatransparencia.atricon.org.br/";

  return (
    <section className="section-block bg-muted/40">
      <div className="container">
        <SectionHeading
          badge="Portal da Transparência"
          title={title}
          subtitle={subtitle || "Acesse todas as informações sobre carta de serviço, obras, estagiários e muito mais"}
        />

        {/* Radar da Transparência ATRICON */}
        <div
          data-reveal="zoom"
          className="bg-gradient-hero rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 mb-8 sm:mb-10 flex flex-col md:flex-row items-center gap-5 sm:gap-6 text-primary-foreground shadow-xl"
        >
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shrink-0 shadow-lg">
            <Award className="w-10 h-10 text-navy" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-1.5">Radar da Transparência</h3>
            <p className="text-primary-foreground/80 text-sm md:text-base">
              Acompanhe nossa avaliação no Radar da Transparência ATRICON. Comprometidos com a
              transparência e a prestação de contas à população.
            </p>
          </div>
          <a
            href={radarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-navy rounded-xl text-sm font-semibold no-underline hover:bg-gold hover:text-navy-dark transition-colors"
          >
            Acessar Radar
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Carrossel infinito de categorias (páginas PNTP) */}
        {categories.length > 0 && (
          <div data-reveal>
            <InfiniteCarousel ariaLabel="Categorias de transparência" gapClass="gap-5" className="pb-1">
              {categories.map((cat, index) => {
                const Icon = categoryIcon(cat.name);
                const palette = CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];
                return (
                  <Link
                    key={cat.id}
                    href={`/${cat.slug}`}
                    className="carousel-slide-sm card-modern p-5 sm:p-6 flex flex-col items-center text-center gap-3 sm:gap-4 no-underline hover-lift min-h-[140px] sm:min-h-[150px] justify-center"
                  >
                    <div className={`w-14 h-14 rounded-full ${palette.circle} flex items-center justify-center`}>
                      <Icon className={`w-7 h-7 ${palette.icon}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm mb-1">{cat.name}</h3>
                    </div>
                  </Link>
                );
              })}
            </InfiniteCarousel>
          </div>
        )}
      </div>
    </section>
  );
};
