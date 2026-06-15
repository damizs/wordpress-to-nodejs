import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { LinkModal } from "~/components/LinkModal";
import { FileText, Download, Calendar, ChevronLeft, ChevronRight, X, Search, Eye } from "lucide-react";

interface InfoRecord {
  id: number;
  title: string;
  year: number;
  content?: string | null;
  reference_date?: string | null;
  file_url?: string | null;
  open_mode?: string | null;
  hide_chrome?: boolean | null;
}

interface Category { id: number; name: string; slug: string; }

interface Props {
  records: {
    data: InfoRecord[];
    meta?: { currentPage?: number; current_page?: number; lastPage?: number; last_page?: number; total?: number };
  };
  category: Category;
  allCategories?: Category[];
  years?: number[];
  filters?: { year?: string; search?: string };
}

export default function DynamicInfoPage({ records, category, allCategories = [], years = [], filters = {} }: Props) {
  const items = records?.data || [];
  const meta = records?.meta;
  const currentPage = meta?.currentPage || meta?.current_page || 1;
  const lastPage = meta?.lastPage || meta?.last_page || 1;
  const total = meta?.total ?? items.length;

  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [modalRecord, setModalRecord] = useState<InfoRecord | null>(null);

  function applyFilters(patch: Record<string, string>) {
    const params: Record<string, string> = {};
    const year = patch.ano ?? filters.year ?? "";
    const search = patch.busca ?? filters.search ?? "";
    if (year) params.ano = year;
    if (search) params.busca = search;
    router.get(`/${category.slug}`, params, { preserveScroll: true });
  }

  const hasFilters = !!(filters.year || filters.search);
  const queryString = `${filters.year ? `&ano=${filters.year}` : ""}${filters.search ? `&busca=${encodeURIComponent(filters.search)}` : ""}`;

  // Agrupa por ano para leitura mais fácil (como o cidadão espera encontrar)
  const groupedByYear = items.reduce<Record<number, InfoRecord[]>>((acc, record) => {
    (acc[record.year] ||= []).push(record);
    return acc;
  }, {});
  const sortedYears = Object.keys(groupedByYear).map(Number).sort((a, b) => b - a);

  return (
    <>
      <SeoHead title={`${category.name} - Câmara Municipal de Sumé`} url={`/${category.slug}`} />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Acesso à Informação" }, { label: category.name }]} />
        <PageHero badge="Acesso à Informação" title={category.name} subtitle="Documentos publicados em cumprimento à Lei de Acesso à Informação" />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
            {/* Toolbar */}
            <div data-reveal="up" className="mb-6 card-modern p-4 flex flex-col sm:flex-row gap-3">
              <form className="relative flex-1" onSubmit={(e) => { e.preventDefault(); applyFilters({ busca: searchTerm }); }}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar nesta seção..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </form>
              <select
                value={filters.year || ""}
                onChange={(e) => applyFilters({ ano: e.target.value })}
                className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="">Todos os anos</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              {hasFilters && (
                <button onClick={() => { setSearchTerm(""); router.get(`/${category.slug}`); }} className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <X className="w-4 h-4" /> Limpar
                </button>
              )}
            </div>

            <p data-reveal="fade" className="mb-8 text-sm text-muted-foreground text-right">
              {total} {total === 1 ? "registro encontrado" : "registros encontrados"}
            </p>

            {items.length > 0 ? (
              <div className="space-y-8">
                {sortedYears.map((year) => (
                  <section key={year}>
                    <div data-reveal="up" className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <h2 className="text-lg font-bold text-foreground">{category.name} — {year}</h2>
                      <span className="text-xs text-muted-foreground">{groupedByYear[year].length} registro(s)</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <div className="space-y-3">
                      {groupedByYear[year].map((record, i) => (
                        <div key={record.id} data-reveal="up" data-reveal-delay={String(Math.min(i, 5) * 60)} className="card-modern p-4 flex items-center justify-between gap-4 hover-lift group">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{record.title}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Ano: {record.year}
                                {record.reference_date && ` · Data: ${new Date(record.reference_date).toLocaleDateString('pt-BR')}`}
                              </p>
                              {record.content && (
                                <div className="text-sm text-muted-foreground mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: record.content }} />
                              )}
                            </div>
                          </div>
                          {record.file_url && (
                            record.open_mode === "modal" ? (
                              <button type="button" onClick={() => setModalRecord(record)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-primary/20 text-primary text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors shrink-0">
                                <Eye className="w-4 h-4" /> <span className="hidden sm:inline">Visualizar</span>
                                <Download className="w-4 h-4 sm:hidden" />
                              </button>
                            ) : (
                              <a href={record.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-primary/20 text-primary text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors no-underline shrink-0">
                                <Eye className="w-4 h-4" /> <span className="hidden sm:inline">Visualizar</span>
                                <Download className="w-4 h-4 sm:hidden" />
                              </a>
                            )
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhum registro encontrado</h3>
                <p className="text-muted-foreground text-sm">{hasFilters ? "Tente ajustar os filtros de busca" : "Em breve novos documentos"}</p>
              </div>
            )}

            {/* Paginação */}
            {lastPage > 1 && (
              <div className="mt-10 flex justify-center items-center gap-2">
                {currentPage > 1 && (
                  <Link href={`/${category.slug}?page=${currentPage - 1}${queryString}`} className="p-2.5 card-modern text-foreground hover:text-primary no-underline transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                )}
                <span className="px-4 py-2 text-sm text-muted-foreground">Página {currentPage} de {lastPage}</span>
                {currentPage < lastPage && (
                  <Link href={`/${category.slug}?page=${currentPage + 1}${queryString}`} className="p-2.5 card-modern text-foreground hover:text-primary no-underline transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            )}

            {/* Outras categorias */}
            {allCategories.length > 1 && (
              <div className="mt-14 pt-8 border-t border-border">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 text-center">Outras informações</h2>
                <div className="flex flex-wrap justify-center gap-2">
                  {allCategories
                    .filter((c) => c.slug !== category.slug)
                    .map((c) => (
                      <Link key={c.id} href={`/${c.slug}`} className="px-4 py-2 rounded-xl bg-muted text-sm text-foreground hover:bg-primary/10 hover:text-primary transition-colors no-underline">
                        {c.name}
                      </Link>
                    ))}
                </div>
              </div>
            )}
            </div>
          </section>
        </main>
        <Footer />
        <LinkModal
          link={
            modalRecord && modalRecord.file_url
              ? {
                  title: modalRecord.title,
                  url: modalRecord.file_url,
                  open_mode: modalRecord.open_mode,
                  hide_chrome: modalRecord.hide_chrome,
                }
              : null
          }
          onClose={() => setModalRecord(null)}
        />
      </div>
    </>
  );
}
