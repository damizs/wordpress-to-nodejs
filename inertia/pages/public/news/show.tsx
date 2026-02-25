import { Link, usePage } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, User, Tag, ArrowLeft, Facebook, Link2, Check } from "lucide-react";
import { useState } from "react";

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
  const [copied, setCopied] = useState(false);
  
  // Helpers para campos que podem vir em camelCase ou snake_case
  const featuredImage = news.featured_image || news.coverImageUrl || news.cover_image_url;
  const publishedAt = news.published_at || news.publishedAt || new Date().toISOString();

  // Copy link function
  const copyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="text-sm font-medium text-foreground">Compartilhar:</span>
                      <div className="flex items-center gap-2">
                        {/* WhatsApp */}
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(news.title + ' ' + fullUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-xl bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors no-underline"
                          title="Compartilhar no WhatsApp"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </a>
                        {/* Facebook */}
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors no-underline"
                          title="Compartilhar no Facebook"
                        >
                          <Facebook className="w-5 h-5" />
                        </a>
                        {/* X (Twitter) */}
                        <a
                          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(news.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors no-underline"
                          title="Compartilhar no X"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                        </a>
                        {/* Copy Link */}
                        <button
                          onClick={copyLink}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            copied ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          title={copied ? "Link copiado!" : "Copiar link"}
                        >
                          {copied ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Related News Grid */}
              {related.length > 0 && (
                <div className="mt-12">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Notícias Relacionadas</h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {related.slice(0, 6).map((item: any) => {
                      const image = item.cover_image_url || item.coverImageUrl || item.featured_image;
                      return (
                        <Link
                          key={item.id}
                          href={`/noticias/${item.slug}`}
                          className="group no-underline"
                        >
                          <div className="relative h-48 rounded-xl overflow-hidden mb-3">
                            {image ? (
                              <img
                                src={image}
                                alt={item.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-navy to-navy-dark flex items-center justify-center">
                                <span className="text-gold text-4xl font-bold">C</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.published_at || item.publishedAt || new Date()).toLocaleDateString('pt-BR')}
                          </span>
                          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mt-1">
                            {item.title}
                          </h3>
                        </Link>
                      );
                    })}
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
