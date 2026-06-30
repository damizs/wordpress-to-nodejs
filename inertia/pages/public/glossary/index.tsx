import { useMemo, useState } from "react";
import { usePage } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { BookA, Search, SearchX } from "lucide-react";

interface GlossaryTerm {
  id: number;
  term: string;
  definition: string;
  letter?: string | null;
}

interface Props {
  terms: GlossaryTerm[];
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function letterOf(t: GlossaryTerm) {
  const source = (t.letter || t.term || "").trim();
  const c = source.charAt(0).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  return /[A-Z]/.test(c) ? c : "#";
}

export default function GlossaryIndex({ terms = [] }: Props) {
  const org = (usePage().props as { camara?: { nome?: string } }).camara?.nome || "Câmara Municipal";
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return terms;
    return terms.filter((t) => normalize(`${t.term} ${t.definition}`).includes(q));
  }, [terms, query]);

  // Agrupa por letra inicial (já vem ordenado por termo do servidor)
  const groups = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>();
    for (const t of filtered) {
      const l = letterOf(t);
      if (!map.has(l)) map.set(l, []);
      map.get(l)!.push(t);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, "pt-BR"));
  }, [filtered]);

  // Letras que possuem termos (para habilitar/desabilitar o índice alfabético)
  const lettersWithTerms = useMemo(() => new Set(terms.map(letterOf)), [terms]);

  return (
    <>
      <SeoHead
        title="Glossário Legislativo"
        description={`Significado de termos jurídicos, orçamentários e legislativos usados no dia a dia da ${org}.`}
        url="/glossario"
      />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Glossário" }]} />
        <PageHero
          badge="Ajuda"
          title="Glossário Legislativo"
          subtitle="Entenda os principais termos jurídicos, orçamentários e legislativos"
          centered
        />
        <main id="conteudo" tabIndex={-1} role="main">
          <section className="py-10 lg:py-14">
            <div className="container">
              {terms.length > 0 ? (
                <>
                  {/* Busca */}
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 pointer-events-none" />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Buscar um termo ou definição..."
                      aria-label="Buscar no glossário"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border/60 bg-card text-foreground placeholder:text-muted-foreground/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-shadow"
                    />
                  </div>

                  {/* Índice alfabético clicável */}
                  <nav aria-label="Índice alfabético" className="mb-8">
                    <ul className="flex flex-wrap gap-1.5 justify-center">
                      {ALPHABET.map((letter) => {
                        const has = lettersWithTerms.has(letter);
                        return (
                          <li key={letter}>
                            {has ? (
                              <a
                                href={`#letra-${letter}`}
                                className="flex items-center justify-center w-9 h-9 rounded-lg text-sm font-semibold bg-card border border-border/60 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                                aria-label={`Ir para a letra ${letter}`}
                              >
                                {letter}
                              </a>
                            ) : (
                              <span
                                className="flex items-center justify-center w-9 h-9 rounded-lg text-sm font-semibold bg-muted/40 border border-transparent text-muted-foreground/40 cursor-default select-none"
                                aria-hidden="true"
                              >
                                {letter}
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </nav>

                  {/* Listagem A–Z agrupada por letra */}
                  {groups.length > 0 ? (
                    <div className="space-y-10">
                      {groups.map(([letter, list]) => (
                        <div key={letter} id={`letra-${letter}`} className="scroll-mt-28">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10 text-primary text-xl font-bold shrink-0">
                              {letter}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {list.length} termo{list.length > 1 ? "s" : ""}
                            </span>
                            <div className="flex-1 h-px bg-border/60" />
                          </div>
                          <dl className="grid gap-4 sm:grid-cols-2">
                            {list.map((t) => (
                              <div
                                key={t.id}
                                className="card-modern !transform-none p-5 h-full"
                              >
                                <dt className="font-bold text-foreground mb-1.5">{t.term}</dt>
                                <dd className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line m-0">
                                  {t.definition}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-14">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <SearchX className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Nenhum termo encontrado
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Tente outros termos de busca.
                      </p>
                      <button
                        onClick={() => setQuery("")}
                        className="mt-4 px-4 py-2 rounded-full text-sm font-medium border border-border/60 bg-card text-foreground hover:bg-muted transition-colors"
                      >
                        Limpar busca
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <BookA className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Glossário em construção
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Os termos do glossário são gerenciados pela equipe da Câmara no painel
                    administrativo, na seção{" "}
                    <span className="font-medium text-foreground">Painel &rsaquo; Glossário</span>.
                    Em breve novos verbetes estarão disponíveis aqui.
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
