import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Link } from "@inertiajs/react";
import { Users, Gavel } from "lucide-react";

interface Member {
  id: number;
  name: string;
  slug: string;
  role?: string;
  party?: string;
  photo?: string | null;
}

interface Committee {
  id: number;
  name: string;
  type?: "permanente" | "temporaria" | "especial" | string;
  description?: string;
  legislature_name?: string;
  members?: Member[];
}

interface Props {
  committees: Committee[];
}

const ROLE_ORDER: Record<string, number> = {
  presidente: 0,
  "vice-presidente": 1,
  relator: 2,
  relatora: 2,
  membro: 3,
};

function roleWeight(role?: string) {
  if (!role) return 9;
  return ROLE_ORDER[role.toLowerCase().trim()] ?? 5;
}

function roleBadgeClass(role?: string) {
  const r = (role || "").toLowerCase();
  if (r.includes("presidente") && !r.includes("vice")) return "bg-gold/15 text-navy-dark dark:text-gold border-gold/30";
  if (r.includes("vice")) return "bg-primary/10 text-primary border-primary/20";
  if (r.includes("relator")) return "bg-sky/10 text-sky border-sky/20";
  return "bg-muted text-muted-foreground border-border";
}

const TYPE_LABELS: Record<string, string> = {
  permanente: "Permanente",
  temporaria: "Temporária",
  especial: "Especial",
};

export default function CommitteesIndex({ committees = [] }: Props) {
  return (
    <>
      <SeoHead
        title="Comissões Permanentes - Câmara Municipal de Sumé"
        description="Conheça as Comissões Permanentes da Câmara Municipal de Sumé, seus membros e atribuições."
        url="/comissoes"
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Comissões Permanentes" }]} />
        <PageHero badge="Legislativo" title="Comissões Permanentes" subtitle="Órgãos técnicos que analisam as matérias antes da deliberação em Plenário" centered />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
            {committees.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {committees.map((committee, i) => {
                  const members = [...(committee.members || [])].sort(
                    (a, b) => roleWeight(a.role) - roleWeight(b.role)
                  );
                  return (
                    <article
                      key={committee.id}
                      data-reveal="up"
                      data-reveal-delay={String(Math.min(i, 4) * 80)}
                      className="bg-card border border-border rounded-2xl flex flex-col shadow-sm transition-all duration-300 hover:shadow-md hover:border-gold/40 overflow-hidden"
                    >
                      {/* Cabeçalho */}
                      <div className="p-6 pb-5 border-b border-border">
                        <div className="flex items-start gap-4">
                          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Gavel className="w-5 h-5 text-primary" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h2 className="text-base font-bold text-foreground leading-snug">
                              {committee.name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              {committee.type && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-gold/15 text-navy-dark dark:text-gold border border-gold/25 text-[11px] font-bold uppercase tracking-wide">
                                  {TYPE_LABELS[committee.type] || committee.type}
                                </span>
                              )}
                              {committee.legislature_name && (
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-medium">
                                  {committee.legislature_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {committee.description && (
                          <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                            {committee.description}
                          </p>
                        )}
                      </div>

                      {/* Composição */}
                      {members.length > 0 && (
                        <div className="p-6 pt-5 mt-auto">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" aria-hidden="true" /> Composição
                          </p>
                          <ul className="space-y-1">
                            {members.map((member) => (
                              <li key={member.id}>
                                <Link
                                  href={`/vereadores/${member.slug}`}
                                  className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-muted transition-colors no-underline group"
                                >
                                  {member.photo ? (
                                    <img
                                      src={member.photo}
                                      alt={`Foto de ${member.name}`}
                                      loading="lazy"
                                      className="w-10 h-10 rounded-full object-cover ring-1 ring-border shrink-0"
                                    />
                                  ) : (
                                    <div
                                      className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
                                      aria-hidden="true"
                                    >
                                      <span className="text-primary text-sm font-bold">{member.name.charAt(0)}</span>
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                      {member.name}
                                    </p>
                                    {member.party && <p className="text-xs text-muted-foreground">{member.party}</p>}
                                  </div>
                                  {member.role && (
                                    <span className={`shrink-0 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${roleBadgeClass(member.role)}`}>
                                      {member.role}
                                    </span>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Gavel className="w-8 h-8 text-muted-foreground/40" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma comissão cadastrada</h3>
                <p className="text-muted-foreground text-sm">As comissões permanentes serão publicadas em breve</p>
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
