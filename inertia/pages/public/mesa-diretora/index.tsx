import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Link } from "@inertiajs/react";

interface MesaMember {
  id: number;
  name: string;
  slug: string;
  photo?: string;
  party?: string;
  role: string;
}

interface Props {
  members: MesaMember[];
  biennium?: { name: string; year_start: number; year_end: number };
}

export default function MesaDiretoraIndex({ members = [], biennium }: Props) {
  return (
    <>
      <SeoHead
        title="Mesa Diretora - Câmara Municipal de Sumé"
        description="Conheça a Mesa Diretora da Câmara Municipal de Sumé."
        url="/mesa-diretora"
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Mesa Diretora" }]} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
                Poder Legislativo
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Mesa Diretora</h1>
              {biennium && (
                <p className="mt-2 text-muted-foreground">
                  {biennium.name} ({biennium.year_start} - {biennium.year_end})
                </p>
              )}
            </div>
            {members.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {members.map((member) => (
                  <Link key={member.id} href={`/vereadores/${member.slug}`} className="group no-underline">
                    <div className="card-modern overflow-hidden text-center">
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-gold/20">
                        {member.photo ? (
                          <img src={member.photo} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl text-primary/30">👤</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <p className="text-gold font-semibold text-sm mb-1">{member.role}</p>
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{member.name}</h3>
                        {member.party && (
                          <span className="inline-block mt-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{member.party}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16"><p className="text-muted-foreground">Informações em atualização.</p></div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
