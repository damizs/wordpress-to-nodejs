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
  if (r.includes("presidente") && !r.includes("vice")) return "bg-gold/15 text-gold border-gold/30";
  if (r.includes("vice")) return "bg-primary/10 text-primary border-primary/20";
  if (r.includes("relator")) return "bg-sky/10 text-sky border-sky/20";
  return "bg-muted text-muted-foreground border-border";
}

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
        <main className="py-12">
          <div className="container mx-auto px-4">
            {committees.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {committees.map((committee, i) => {
                  const members = [...(committee.members || [])].sort(
                    (a, b) => roleWeight(a.role) - roleWeight(b.role)
                  );
                  return (
                    <div
                      key={committee.id}
                      data-reveal="up"
                      data-reveal-delay={String(Math.min(i, 4) * 80)}
                      className="card-modern card-shine p-6 flex flex-col hover-lift"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 icon-pop">
                          <Gavel className="w-6 h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-foreground leading-snug">{committee.name}</h3>
                          {committee.legislature_name && (
                            <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                              {committee.legislature_name}
                            </span>
                          )}
                        </div>
                      </div>

                      {committee.description && (
                        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{committee.description}</p>
                      )}

                      {members.length > 0 && (
                        <div className="mt-auto space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" /> Composição
                          </p>
                          {members.map((member) => (
                            <Link
                              key={member.id}
                              href={`/vereadores/${member.slug}`}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors no-underline group"
                            >
                              {member.photo ? (
                                <img
                                  src={member.photo}
                                  alt={member.name}
                                  loading="lazy"
                                  className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
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
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Gavel className="w-8 h-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma comissão cadastrada</h3>
                <p className="text-muted-foreground text-sm">As comissões permanentes serão publicadas em breve</p>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
