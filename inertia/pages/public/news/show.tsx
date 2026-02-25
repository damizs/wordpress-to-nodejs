import { Link, usePage } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, User, Tag, ArrowLeft, Share2, Facebook, Twitter } from "lucide-react";

interface Props {
  news: {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featured_image?: string;
    coverImageUrl?: string;
    cover_image_url?: string;
    published_at?: string;
    publishedAt?: string;
    author?: { name: string };
    category?: { name: string };
  };
  related?: any[];
}

export default function NewsShow({ news, related = [] }: Props) {
  const { url } = usePage();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://node.camaradesume.pb.gov.br';
  const fullUrl = `${baseUrl}${url}`;
  
  // Helpers para campos que podem vir em camelCase ou snake_case
  const featuredImage = news.featured_image || news.coverImageUrl || news.cover_image_url;
  const publishedAt = news.published_at || news.publishedAt || new Date().toISOString();
  return (
    <>
      <SeoHead
        title={`${news.title} - Câmara Municipal de Sumé`}
        description={news.excerpt || news.title}
        url={`/noticias/${news.slug}`}
        image={featuredImage}
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Notícias", href: "/noticias" }, { label: news.title }]} />

        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Back Link */}
              <Link
                href="/noticias"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 no-underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para notícias
              </Link>

              {/* Article */}
              <article className="card-modern overflow-hidden">
                {/* Featured Image */}
                {featuredImage && (
                  <div className="relative h-64 md:h-96 overflow-hidden">
                    <img
                      src={featuredImage}
                      alt={news.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/60 via-transparent to-transparent" />
                  </div>
                )}

                <div className="p-6 md:p-10">
                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(publishedAt).toLocaleDateString('pt-BR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                    {news.author && (
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        {news.author.name}
                      </span>
                    )}
                    {news.category && (
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-4 h-4" />
                        {news.category.name}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-6">
                    {news.title}
                  </h1>

                  {/* Content */}
                  <div
                    className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary"
                    dangerouslySetInnerHTML={{ __html: news.content }}
                  />

                  {/* Share */}
                  <div className="mt-10 pt-6 border-t border-border">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-foreground">Compartilhar:</span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors no-underline"
                        >
                          <Facebook className="w-5 h-5" />
                        </a>
                        <a
                          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(news.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors no-underline"
                        >
                          <Twitter className="w-5 h-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Related News */}
              {related.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Notícias Relacionadas</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {related.map((item: any) => (
                      <Link
                        key={item.id}
                        href={`/noticias/${item.slug}`}
                        className="group card-modern p-4 flex gap-4 no-underline"
                      >
                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                          {item.featured_image ? (
                            <img
                              src={item.featured_image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                              <span className="text-2xl">📰</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">
                            {new Date(item.published_at).toLocaleDateString('pt-BR')}
                          </p>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
