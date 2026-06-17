import { useMemo, useState } from "react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { SafeHtml } from "~/components/SafeHtml";
import { ChevronDown, HelpCircle, Search, SearchX } from "lucide-react";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category?: string | null;
}

interface FaqCategory {
  slug: string;
  name: string;
}

interface Props {
  faqs: FaqItem[];
  categories?: FaqCategory[];
}

/** Rótulos de fallback para slugs conhecidos, caso a categoria não exista em system_categories. */
const FALLBACK_LABELS: Record<string, string> = {
  "lai": "Acesso à Informação (LAI)",
  "transparencia": "Transparência",
  "sessoes": "Sessões",
  "participacao": "Participação",
  "sobre-a-camara": "Sobre a Câmara",
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ");
}

export default function FaqIndex({ faqs = [], categories = [] }: Props) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [query, setQuery] = useState("");

  // Tabs: categorias cadastradas + qualquer categoria "órfã" presente nos itens
  const tabs = useMemo(() => {
    const known = new Map<string, string>();
    for (const c of categories) known.set(c.slug, c.name);
    for (const f of faqs) {
      const slug = f.category || "geral";
      if (!known.has(slug)) known.set(slug, FALLBACK_LABELS[slug] || slug.charAt(0).toUpperCase() + slug.slice(1));
    }
    const counts: Record<string, number> = {};
    for (const f of faqs) {
      const slug = f.category || "geral";
      counts[slug] = (counts[slug] || 0) + 1;
    }
    // Só exibe abas de categorias que têm pelo menos um item ativo
    return Array.from(known.entries())
      .filter(([slug]) => (counts[slug] || 0) > 0)
      .map(([slug, name]) => ({ slug, name, count: counts[slug] || 0 }));
  }, [faqs, categories]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return faqs.filter((f) => {
      if (activeCategory && (f.category || "geral") !== activeCategory) return false;
      if (!q) return true;
      return normalize(`${f.question} ${stripHtml(f.answer)}`).includes(q);
    });
  }, [faqs, activeCategory, query]);

  return (
    <>
      <SeoHead title="Perguntas Frequentes - Câmara Municipal de Sumé" description="Encontre respostas para as dúvidas mais comuns sobre a Câmara Municipal de Sumé." url="/perguntas-frequentes" />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Perguntas Frequentes" }]} />
        <PageHero badge="Ajuda" title="Perguntas Frequentes" subtitle="Encontre respostas para as dúvidas mais comuns" centered />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
              <div>
                {faqs.length > 0 ? (
                  <>
                    {/* Busca */}
                    <div className="relative mb-6">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60 pointer-events-none" />
                      <input
                        type="search"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setOpenId(null); }}
                        placeholder="Buscar nas perguntas e respostas..."
                        aria-label="Buscar nas perguntas frequentes"
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border/60 bg-card text-foreground placeholder:text-muted-foreground/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-shadow"
                      />
                    </div>

                    {/* Abas de categoria com contador */}
                    {tabs.length > 1 && (
                      <div className="flex flex-wrap gap-2 mb-8 justify-center">
                        <button
                          onClick={() => { setActiveCategory(""); setOpenId(null); }}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${!activeCategory ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground"}`}
                        >
                          Todas
                          <span className={`ml-1.5 text-xs ${!activeCategory ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}>{faqs.length}</span>
                        </button>
                        {tabs.map((t) => (
                          <button
                            key={t.slug}
                            onClick={() => { setActiveCategory(activeCategory === t.slug ? "" : t.slug); setOpenId(null); }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${activeCategory === t.slug ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground"}`}
                          >
                            {t.name}
                            <span className={`ml-1.5 text-xs ${activeCategory === t.slug ? "text-primary-foreground/70" : "text-muted-foreground/60"}`}>{t.count}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Lista / acordeão */}
                    {filtered.length > 0 ? (
                      <div className="space-y-4">
                        {filtered.map((faq) => {
                          const isOpen = openId === faq.id;
                          const hasHtml = /<[a-z][\s\S]*>/i.test(faq.answer);
                          return (
                            <div key={faq.id} className="card-modern overflow-hidden !transform-none">
                              <button
                                onClick={() => setOpenId(isOpen ? null : faq.id)}
                                aria-expanded={isOpen}
                                className="w-full p-5 flex items-center justify-between gap-4 text-left"
                              >
                                <div className="flex items-center gap-3">
                                  <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                                  <span className="font-semibold text-foreground">{faq.question}</span>
                                </div>
                                <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                              </button>
                              <div
                                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                              >
                                <div className="overflow-hidden">
                                  <div className="px-5 pb-5 pl-[3.25rem]">
                                    {hasHtml ? (
                                      <SafeHtml html={faq.answer} className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground" />
                                    ) : (
                                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line m-0">{faq.answer}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-14">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                          <SearchX className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground mb-2">Nenhum resultado encontrado</h3>
                        <p className="text-muted-foreground text-sm">
                          Tente outros termos de busca{activeCategory ? " ou selecione outra categoria" : ""}.
                        </p>
                        <button
                          onClick={() => { setQuery(""); setActiveCategory(""); }}
                          className="mt-4 px-4 py-2 rounded-full text-sm font-medium border border-border/60 bg-card text-foreground hover:bg-muted transition-colors"
                        >
                          Limpar filtros
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <HelpCircle className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma pergunta cadastrada</h3>
                    <p className="text-muted-foreground text-sm max-w-md mx-auto">
                      As perguntas e respostas desta página são gerenciadas pela equipe da Câmara no painel administrativo,
                      na seção <span className="font-medium text-foreground">Painel &rsaquo; FAQ</span> (<code className="text-xs bg-muted px-1.5 py-0.5 rounded">/painel/faq</code>).
                      Em breve novas perguntas estarão disponíveis aqui.
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
