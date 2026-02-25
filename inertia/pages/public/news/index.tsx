import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image?: string;
  published_at: string;
  category?: { name: string };
}

interface Props {
  news: NewsItem[];
  pagination?: {
    currentPage: number;
    lastPage: number;
    total: number;
  };
}

export default function NewsIndex({ news = [], pagination }: Props) {
  return (
    <>
      <SeoHead
        title="Notícias - Câmara Municipal de Sumé"
        description="Acompanhe as últimas notícias e acontecimentos da Câmara Municipal de Sumé."
        url="/noticias"
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Notícias" }]} />

        <main className="py-12">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="mb-10">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
                Imprensa
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Notícias</h1>
              <p className="mt-2 text-muted-foreground">
                Acompanhe as últimas notícias e acontecimentos da Câmara Municipal
              </p>
            </div>

            {/* News Grid */}
            {news.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item) => (
                  <Link
                    key={item.id}
                    href={`/noticias/${item.slug}`}
                    className="group no-underline"
                  >
                    <div className="card-modern overflow-hidden h-full">
                      <div className="relative h-48 overflow-hidden">
                        {item.featured_image ? (
                          <img
                            src={item.featured_image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-gold/20 flex items-center justify-center">
                            <span className="text-4xl text-primary/30">📰</span>
                          </div>
                        )}
                        {item.category && (
                          <span className="absolute top-3 left-3 px-2 py-1 bg-gold text-navy-dark text-xs font-semibold rounded-full">
                            {item.category.name}
                          </span>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.published_at).toLocaleDateString('pt-BR')}
                        </div>
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                          {item.title}
                        </h3>
                        {item.excerpt && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.excerpt}
                          </p>
                        )}
                        <div className="mt-4 flex items-center gap-1 text-sm text-primary font-medium">
                          Ler mais
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Nenhuma notícia encontrada.</p>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.lastPage > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                {pagination.currentPage > 1 && (
                  <Link
                    href={`/noticias?page=${pagination.currentPage - 1}`}
                    className="btn-modern bg-muted text-foreground p-2 no-underline"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Link>
                )}
                <span className="px-4 py-2 text-sm text-muted-foreground">
                  Página {pagination.currentPage} de {pagination.lastPage}
                </span>
                {pagination.currentPage < pagination.lastPage && (
                  <Link
                    href={`/noticias?page=${pagination.currentPage + 1}`}
                    className="btn-modern bg-muted text-foreground p-2 no-underline"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
