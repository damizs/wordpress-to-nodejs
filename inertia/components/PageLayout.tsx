import { type ReactNode } from "react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeroProps {
  title: string;
  subtitle?: string;
  badge?: string;
  centered?: boolean;
}

interface SeoProps {
  title: string;
  description?: string;
  url?: string;
}

interface PageLayoutProps {
  /** Metadados de SEO. Renderiza o <SeoHead> padrão do portal. */
  seo: SeoProps;
  /** Trilha de navegação. O último item (sem href) é a página atual. */
  breadcrumb?: BreadcrumbItem[];
  /** Faixa de destaque com o <h1> da página. Fica DENTRO do <main> (e-MAG). */
  hero?: HeroProps;
  /**
   * Largura do conteúdo:
   * - 'default' (padrão): container cheio — ideal para grades/listagens.
   * - 'reading': limita a `max-w-4xl mx-auto` — ideal para texto corrido (§3).
   */
  width?: "default" | "reading";
  /**
   * Quando true, NÃO envolve os filhos em `section`/`container` — a página
   * controla a própria estrutura (ex.: layouts com sidebar/colunas).
   */
  bare?: boolean;
  children: ReactNode;
}

/**
 * Esqueleto padrão das páginas internas públicas (CLAUDE.md §3/§5):
 * `TopBar + Header → <main id="conteudo"> → Breadcrumb + PageHero +
 * <section className="py-10 lg:py-14"><div className="container"> → Footer`.
 *
 * Centraliza a semântica de acessibilidade: o `<main id="conteudo">` é o alvo
 * real do skip-link (sem patch imperativo no Header) e o `<h1>` do PageHero
 * fica dentro do landmark principal.
 */
export const PageLayout = ({
  seo,
  breadcrumb,
  hero,
  width = "default",
  bare = false,
  children,
}: PageLayoutProps) => {
  return (
    <>
      <SeoHead title={seo.title} description={seo.description} url={seo.url} />
      <div className="min-h-screen bg-background flex flex-col">
        <TopBar />
        <Header />
        <main id="conteudo" tabIndex={-1} role="main" className="flex-1">
          {breadcrumb && <Breadcrumb items={breadcrumb} />}
          {hero && <PageHero {...hero} />}
          {bare ? (
            children
          ) : (
            <section className="py-10 lg:py-14">
              <div className="container">
                <div className={width === "reading" ? "max-w-4xl mx-auto" : undefined}>
                  {children}
                </div>
              </div>
            </section>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};
