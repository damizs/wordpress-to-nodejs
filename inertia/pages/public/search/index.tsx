import { useState } from "react";
import { router } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import {
  Search,
  SearchX,
  Newspaper,
  FileText,
  ClipboardList,
  Gavel,
  ScrollText,
  Landmark,
  User,
  File,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

type ResultType =
  | "Notícia"
  | "Ata"
  | "Pauta"
  | "Licitação"
  | "Publicação"
  | "Atividade"
  | "Vereador"
  | "Página"
  | "FAQ";

interface SearchResult {
  type: ResultType;
  title: string;
  excerpt: string;
  url: string;
  date?: string | null;
}

interface Props {
  q: string;
  results: SearchResult[];
  total: number;
  byType: Record<string, number>;
}

const TYPE_ICONS: Record<ResultType, typeof Search> = {
  "Notícia": Newspaper,
  "Ata": FileText,
  "Pauta": ClipboardList,
  "Licitação": Gavel,
  "Publicação": ScrollText,
  "Atividade": Landmark,
  "Vereador": User,
  "Página": File,
  "FAQ": HelpCircle,
};

// Ordem fixa de exibição dos grupos
const TYPE_ORDER: ResultType[] = [
  "Notícia",
  "Atividade",
  "Pauta",
  "Ata",
  "Licitação",
  "Publicação",
  "Vereador",
  "Página",
  "FAQ",
];

function formatDate(iso?: string | null) {
  if (!iso) return null;
  // Aceita "YYYY-MM-DD" ou ISO completo
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

export default function SearchIndex({ q = "", results = [], total = 0 }: Props) {
  const [query, setQuery] = useState(q);
  const hasQuery = q.trim().length >= 2;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = query.trim();
    if (value.length < 2) return;
    router.get("/busca", { q: value }, { preserveScroll: false });
  };

  // Agrupa resultados por tipo, preservando a ordem definida
  const groups = TYPE_ORDER.map((type) => ({
    type,
    items: results.filter((r) => r.type === type),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <SeoHead
        title="Busca - Câmara Municipal de Sumé"
        description="Pesquise notícias, atas, pautas, licitações, publicações e mais no portal da Câmara Municipal de Sumé."
        url="/busca"
      />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Busca" }]} />
        <PageHero
          badge="Pesquisa"
          title="Busca no portal"
          subtitle="Encontre notícias, atas, pautas, licitações, publicações, vereadores e mais"
          centered
        />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
              <div>
                {/* Campo de busca */}
                <form onSubmit={submit} role="search" className="relative mb-8 flex flex-col gap-3 sm:block">
                  <Search
                    className="absolute left-4 top-6 h-5 w-5 -translate-y-1/2 text-muted-foreground/60 pointer-events-none sm:top-1/2"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="O que você procura?"
                    aria-label="Termo de busca"
                    autoFocus
                    className="w-full rounded-2xl border border-border/60 bg-card py-4 pl-12 pr-4 text-foreground shadow-sm transition-shadow placeholder:text-muted-foreground/60 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/40 sm:pr-32"
                  />
                  <button
                    type="submit"
                    className="inline-flex min-h-[2.75rem] w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:absolute sm:right-2 sm:top-1/2 sm:min-h-0 sm:w-auto sm:-translate-y-1/2"
                  >
                    Buscar
                  </button>
                </form>

                {/* Contador */}
                {hasQuery && (
                  <p className="text-sm text-muted-foreground mb-6">
                    {total > 0 ? (
                      <>
                        <span className="font-semibold text-foreground">{total}</span>{" "}
                        {total === 1 ? "resultado" : "resultados"} para{" "}
                        <span className="font-semibold text-foreground">“{q}”</span>
                      </>
                    ) : null}
                  </p>
                )}

                {/* Resultados */}
                {hasQuery && total > 0 && (
                  <div className="space-y-10">
                    {groups.map((group) => {
                      const Icon = TYPE_ICONS[group.type];
                      return (
                        <div key={group.type}>
                          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary mb-4">
                            <Icon className="w-4 h-4" aria-hidden="true" />
                            {group.type}
                            <span className="text-xs font-medium text-muted-foreground/70 normal-case tracking-normal">
                              ({group.items.length})
                            </span>
                          </h2>
                          <ul className="space-y-3">
                            {group.items.map((item, idx) => {
                              const date = formatDate(item.date);
                              return (
                                <li key={`${group.type}-${idx}`}>
                                  <a
                                    href={item.url}
                                    className="group block card-modern !transform-none p-5 no-underline hover:border-primary/40 transition-colors"
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="min-w-0">
                                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                          {item.title}
                                        </h3>
                                        {item.excerpt && (
                                          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                            {item.excerpt}
                                          </p>
                                        )}
                                        {date && (
                                          <p className="mt-2 text-xs text-muted-foreground/70">
                                            {date}
                                          </p>
                                        )}
                                      </div>
                                      <ArrowRight
                                        className="w-5 h-5 text-muted-foreground/40 shrink-0 mt-0.5 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                                        aria-hidden="true"
                                      />
                                    </div>
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Estado vazio (buscou mas nada encontrado) */}
                {hasQuery && total === 0 && (
                  <div className="text-center py-14">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <SearchX className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Nada encontrado para “{q}”
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                      Tente outros termos, verifique a ortografia ou use palavras mais gerais.
                    </p>
                  </div>
                )}

                {/* Estado inicial (sem termo) */}
                {!hasQuery && (
                  <div className="text-center py-14">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Search className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Digite um termo para pesquisar
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                      A busca abrange notícias, atas, pautas, licitações, publicações oficiais,
                      atividades legislativas, vereadores, páginas e perguntas frequentes. Use ao
                      menos 2 caracteres.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
