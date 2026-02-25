import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Link } from "@inertiajs/react";
import { Users } from "lucide-react";

interface Committee {
  id: number;
  name: string;
  description?: string;
  members?: { id: number; name: string; slug: string; role?: string }[];
}

interface Props {
  committees: Committee[];
}

export default function CommitteesIndex({ committees = [] }: Props) {
  return (
    <>
      <SeoHead
        title="Comissões Permanentes - Câmara Municipal de Sumé"
        description="Conheça as Comissões Permanentes da Câmara Municipal de Sumé e seus membros."
        url="/comissoes"
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Comissões Permanentes" }]} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-3">Legislativo</span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Comissões Permanentes</h1>
            </div>
            {committees.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {committees.map((committee) => (
                  <div key={committee.id} className="card-modern p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-bold text-foreground">{committee.name}</h3>
                    </div>
                    {committee.description && <p className="text-sm text-muted-foreground mb-4">{committee.description}</p>}
                    {committee.members && committee.members.length > 0 && (
                      <ul className="space-y-2">
                        {committee.members.map((member) => (
                          <li key={member.id}>
                            <Link href={`/vereadores/${member.slug}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors no-underline text-foreground">
                              <span>{member.name}</span>
                              {member.role && <span className="text-xs text-gold">{member.role}</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16"><p className="text-muted-foreground">Nenhuma comissão cadastrada.</p></div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
