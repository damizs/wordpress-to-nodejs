import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Link } from "@inertiajs/react";
import { Gavel } from "lucide-react";

const COMPETENCIAS = [
  { role: "Presidente", desc: "Representa a Câmara, preside as sessões e coordena as iniciativas legislativas e administrativas." },
  { role: "Vice-Presidente", desc: "Substitui o Presidente em suas ausências e presta apoio na condução das atividades da Mesa." },
  { role: "1º Secretário", desc: "Atua na organização das sessões, leitura de documentos e supervisão da Secretaria Legislativa." },
  { role: "2º Secretário", desc: "Auxilia o 1º Secretário e o substitui quando necessário." },
];

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
        <PageHero
          badge="Poder Legislativo"
          title="Mesa Diretora"
          subtitle={biennium ? `${biennium.name} (${biennium.year_start} - ${biennium.year_end})` : "Composição da Mesa Diretora da Câmara Municipal"}
          centered
        />
        <main className="py-12">
          <div className="container mx-auto px-4">
            {members.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {members.map((member, i) => (
                  <Link key={member.id} href={`/vereadores/${member.slug}`} className="group no-underline" data-reveal="up" data-reveal-delay={String(Math.min(i, 7) * 80)}>
                    <div className="card-modern card-shine overflow-hidden text-center hover-lift">
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

            {/* Competências da Mesa */}
            <div data-reveal="up" className="max-w-5xl mx-auto mt-14 card-modern overflow-hidden border-glow">
              <div className="bg-gradient-hero text-primary-foreground px-6 py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                  <Gavel className="w-5 h-5 text-gold" />
                </div>
                <h2 className="text-lg font-bold">Competências</h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {COMPETENCIAS.map((item) => (
                  <div key={item.role} className="flex gap-3 p-4 rounded-xl bg-muted/40">
                    <div className="w-1 rounded-full bg-gold shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{item.role}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
