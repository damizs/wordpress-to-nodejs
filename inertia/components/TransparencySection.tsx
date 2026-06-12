import { Link } from "@inertiajs/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Award, ChevronLeft, ChevronRight, ExternalLink, FileText, HardHat, Plane,
  Coins, GraduationCap, Users, ClipboardList, Gavel, BarChart3, BookOpen,
  Briefcase, Building, Scale, FolderOpen,
} from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";

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
  { circle: "bg-navy/10", icon: "text-navy" },
  { circle: "bg-gold/15", icon: "text-amber-700" },
  { circle: "bg-sky/10", icon: "text-sky" },
  { circle: "bg-emerald-600/10", icon: "text-emerald-700" },
] as const;

export const TransparencySection = ({
  categories = [],
  title = "Acesso à Informação",
  subtitle,
}: TransparencySectionProps) => {
  const settings = useSiteSettings();
  const radarUrl = settings.radar_atricon_url || "https://radardatransparencia.atricon.org.br/";
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 1);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges, categories.length]);

  const scrollByPage = useCallback((direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  }, []);

  return (
    <section className="py-14 lg:py-20 px-4 bg-muted/40">
      <div className="container mx-auto">
        <div className="text-center mb-12" data-reveal>
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            Portal da Transparência
          </span>
          <h2 className="heading-accent text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {subtitle || "Acesse todas as informações sobre carta de serviço, obras, estagiários e muito mais"}
          </p>
        </div>

        {/* Radar da Transparência ATRICON */}
        <div
          data-reveal="zoom"
          className="bg-gradient-hero rounded-3xl p-8 md:p-10 mb-10 flex flex-col md:flex-row items-center gap-6 text-primary-foreground shadow-xl"
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
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-navy rounded-xl text-sm font-semibold no-underline hover:bg-gold hover:text-navy-dark transition-colors"
          >
            Acessar Radar
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Carrossel de categorias (páginas PNTP) */}
        {categories.length > 0 && (
          <div className="relative px-12" data-reveal>
            <div
              ref={scrollerRef}
              className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {categories.map((cat, index) => {
                const Icon = categoryIcon(cat.name);
                const palette = CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];
                return (
                  <Link
                    key={cat.id}
                    href={`/${cat.slug}`}
                    className="snap-start shrink-0 w-[85%] sm:w-[45%] lg:w-[23.5%] card-modern p-6 flex flex-col items-center text-center gap-4 no-underline hover-lift min-h-[150px] justify-center"
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
            </div>

            {categories.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => scrollByPage(-1)}
                  disabled={!canPrev}
                  aria-label="Categorias anteriores"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollByPage(1)}
                  disabled={!canNext}
                  aria-label="Próximas categorias"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
