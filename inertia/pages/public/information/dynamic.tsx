import { Link, router } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { FileText, Download, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

interface InfoRecord {
  id: number;
  title: string;
  year: number;
  content?: string | null;
  reference_date?: string | null;
  file_url?: string | null;
}

interface Category { id: number; name: string; slug: string; }

interface Props {
  records: {
    data: InfoRecord[];
    meta?: { currentPage?: number; current_page?: number; lastPage?: number; last_page?: number; total?: number };
  };
  category: Category;
  allCategories?: Category[];
  filters?: { year?: string };
}

export default function DynamicInfoPage({ records, category, allCategories = [], filters = {} }: Props) {
  const items = records?.data || [];
  const meta = records?.meta;
  const currentPage = meta?.currentPage || meta?.current_page || 1;
  const lastPage = meta?.lastPage || meta?.last_page || 1;

  const years = [...new Set(items.map((r) => r.year))].sort((a, b) => b - a);
  const currentYear = new Date().getFullYear();
  const filterYears = years.length > 0 ? years : Array.from({ length: 5 }, (_, i) => currentYear - i);

  function applyYear(year: string) {
    router.get(`/${category.slug}`, year ? { ano: year } : {}, { preserveScroll: true });
  }

  return (
    <>
      <SeoHead title={`${category.name} - Câmara Municipal de Sumé`} url={`/${category.slug}`} />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Acesso à Informação" }, { label: category.name }]} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-3">Acesso à Informação</span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{category.name}</h1>
            </div>

            {/* Filtro por ano */}
            <div className="max-w-3xl mx-auto mb-8 flex flex-wrap items-center justify-center gap-2">
              {filterYears.map((y) => (
                <button
                  key={y}
                  onClick={() => applyYear(String(y))}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.year === String(y)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  {y}
                </button>
              ))}
              {filters.year && (
                <button onClick={() => applyYear('')} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm text-red-500 hover:bg-red-50 transition-colors">
                  <X className="w-3 h-3" /> Limpar
                </button>
              )}
            </div>

            {items.length > 0 ? (
              <div className="max-w-3xl mx-auto space-y-4">
                {items.map((record) => (
                  <div key={record.id} className="card-modern p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground">{record.title}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {record.reference_date
                            ? new Date(record.reference_date).toLocaleDateString('pt-BR')
                            : record.year}
                        </p>
                        {record.content && (
                          <div className="text-sm text-muted-foreground mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: record.content }} />
                        )}
                      </div>
                    </div>
                    {record.file_url && (
                      <a href={record.file_url} target="_blank" rel="noopener noreferrer" className="btn-modern bg-primary/10 text-primary p-2 no-underline flex-shrink-0" title="Baixar documento">
                        <Download className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum registro encontrado{filters.year ? ` para ${filters.year}` : ''}.</p>
              </div>
            )}

            {/* Paginação */}
            {lastPage > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                {currentPage > 1 && (
                  <Link href={`/${category.slug}?page=${currentPage - 1}${filters.year ? `&ano=${filters.year}` : ''}`} className="btn-modern bg-muted p-2 no-underline text-foreground">
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                )}
                <span className="px-4 py-2 text-sm text-muted-foreground">Página {currentPage} de {lastPage}</span>
                {currentPage < lastPage && (
                  <Link href={`/${category.slug}?page=${currentPage + 1}${filters.year ? `&ano=${filters.year}` : ''}`} className="btn-modern bg-muted p-2 no-underline text-foreground">
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            )}

            {/* Outras categorias */}
            {allCategories.length > 1 && (
              <div className="max-w-3xl mx-auto mt-12 pt-8 border-t border-border">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-4 text-center">Outras informações</h2>
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
        </main>
        <Footer />
      </div>
    </>
  );
}
