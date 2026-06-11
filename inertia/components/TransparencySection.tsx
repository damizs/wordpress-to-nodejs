import { Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
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

/** Ícone + cor por palavra-chave da categoria (padrão do portal WP) */
function categoryVisual(name: string): { icon: any; color: string } {
  const t = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (t.includes("obra")) return { icon: HardHat, color: "bg-sky-500" };
  if (t.includes("diaria")) return { icon: Plane, color: "bg-yellow-500" };
  if (t.includes("verba")) return { icon: Coins, color: "bg-emerald-500" };
  if (t.includes("estagiario")) return { icon: GraduationCap, color: "bg-purple-500" };
  if (t.includes("terceirizado")) return { icon: Briefcase, color: "bg-orange-500" };
  if (t.includes("servidor") || t.includes("pessoal")) return { icon: Users, color: "bg-blue-500" };
  if (t.includes("concurso") || t.includes("seletivo")) return { icon: ClipboardList, color: "bg-rose-500" };
  if (t.includes("julgamento") || t.includes("apreciacao")) return { icon: Gavel, color: "bg-indigo-500" };
  if (t.includes("prestacao") || t.includes("contas") || t.includes("relatorio")) return { icon: BarChart3, color: "bg-green-600" };
  if (t.includes("carta")) return { icon: BookOpen, color: "bg-pink-500" };
  if (t.includes("patrimonio") || t.includes("imovel")) return { icon: Building, color: "bg-teal-500" };
  if (t.includes("lei") || t.includes("norma")) return { icon: Scale, color: "bg-cyan-600" };
  if (t.includes("dados")) return { icon: FolderOpen, color: "bg-violet-500" };
  return { icon: FileText, color: "bg-primary" };
}

function useItemsPerPage() {
  const [count, setCount] = useState(4);
  useEffect(() => {
    const update = () => setCount(window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 4);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return count;
}

export const TransparencySection = ({
  categories = [],
  title = "Acesso à Informação",
  subtitle,
}: TransparencySectionProps) => {
  const settings = useSiteSettings();
  const radarUrl = settings.radar_atricon_url || "https://radardatransparencia.atricon.org.br/";
  const itemsPerPage = useItemsPerPage();
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(categories.length / itemsPerPage));

  useEffect(() => {
    if (page >= totalPages) setPage(0);
  }, [totalPages, page]);

  const visible = categories.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage);

  return (
    <section className="py-20 px-4 section-gradient">
      <div className="container mx-auto">
        <div className="text-center mb-12" data-reveal>
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            Portal da Transparência
          </span>
          <h2 className="heading-accent text-3xl md:text-5xl font-bold text-foreground mb-4">
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
            <Award className="w-10 h-10 text-primary" />
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
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary rounded-xl text-sm font-semibold no-underline hover:bg-gold hover:text-navy-dark transition-colors"
          >
            Acessar Radar
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Carrossel de categorias (páginas PNTP) */}
        {categories.length > 0 && (
          <div className="relative" data-reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 px-12">
              {visible.map((cat) => {
                const { icon: Icon, color } = categoryVisual(cat.name);
                return (
                  <Link
                    key={cat.id}
                    href={`/${cat.slug}`}
                    className="card-modern card-shine p-6 flex flex-col items-center text-center gap-4 no-underline hover-lift min-h-[150px] justify-center"
                  >
                    <div className={`w-14 h-14 rounded-full ${color} flex items-center justify-center shadow-md`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm mb-1">{cat.name}</h3>
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <>
                <button
                  onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
                  aria-label="Anterior"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage((p) => (p + 1) % totalPages)}
                  aria-label="Próximo"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="flex justify-center gap-1.5 mt-8">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      aria-label={`Página ${i + 1}`}
                      className={`h-2 rounded-full transition-all ${i === page ? "bg-primary w-5" : "bg-border w-2 hover:bg-muted-foreground/40"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
