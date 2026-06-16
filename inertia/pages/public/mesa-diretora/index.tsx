import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Link } from "@inertiajs/react";
import { Gavel, CalendarRange } from "lucide-react";

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

const isPresident = (role: string) => {
  const r = role.toLowerCase();
  return r.includes("presidente") && !r.includes("vice");
};

const MemberPhoto = ({
  member,
  size,
  textSize,
}: {
  member: MesaMember;
  size: string;
  textSize: string;
}) => (
  <div
    className={`${size} mx-auto rounded-full overflow-hidden ring-2 ring-gold/50 ring-offset-4 ring-offset-card bg-muted transition-colors duration-300 group-hover:ring-gold`}
  >
    {member.photo ? (
      <img
        src={member.photo}
        alt={`Foto de ${member.name}`}
        loading="lazy"
        className="w-full h-full object-cover"
      />
    ) : (
      <div
        className={`w-full h-full flex items-center justify-center ${textSize} font-bold text-primary/40`}
        aria-hidden="true"
      >
        {member.name.charAt(0)}
      </div>
    )}
  </div>
);

const RoleBadge = ({ role }: { role: string }) => (
  <span className="inline-block px-3 py-1 bg-gold/15 text-navy-dark dark:text-gold border border-gold/25 text-[11px] font-bold rounded-full uppercase tracking-wider">
    {role}
  </span>
);

export default function MesaDiretoraIndex({ members = [], biennium }: Props) {
  const president = members.find((m) => isPresident(m.role));
  const others = members.filter((m) => !president || m.id !== president.id);

  return (
    <>
      <SeoHead
        title="Mesa Diretora - Câmara Municipal de Sumé"
        description="Conheça a Mesa Diretora da Câmara Municipal de Sumé."
        url="/mesa-diretora"
      />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Mesa Diretora" }]} />
        <PageHero
          badge="Poder Legislativo"
          title="Mesa Diretora"
          subtitle={biennium ? `${biennium.name} (${biennium.year_start} - ${biennium.year_end})` : "Composição da Mesa Diretora da Câmara Municipal"}
          centered
        />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
            {members.length > 0 ? (
              <div>
                {/* Biênio em destaque */}
                {biennium && (
                  <div className="flex justify-center mb-8" data-reveal="fade">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-semibold">
                      <CalendarRange className="w-4 h-4 text-gold" aria-hidden="true" />
                      Biênio {biennium.year_start} - {biennium.year_end}
                    </span>
                  </div>
                )}

                {/* Presidente em destaque */}
                {president && (
                  <Link
                    href={`/vereadores/${president.slug}`}
                    className="group block max-w-md mx-auto no-underline mb-10"
                    data-reveal="up"
                  >
                    <article className="bg-card border border-border rounded-2xl p-8 text-center shadow-sm transition-all duration-300 hover:shadow-md hover:border-gold/40">
                      <MemberPhoto member={president} size="w-36 h-36 md:w-40 md:h-40" textSize="text-5xl" />
                      <div className="mt-6">
                        <RoleBadge role={president.role} />
                        <h2 className="mt-3 text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {president.name}
                        </h2>
                        {president.party && (
                          <p className="mt-1 text-sm font-medium text-muted-foreground">{president.party}</p>
                        )}
                      </div>
                    </article>
                  </Link>
                )}

                {/* Demais membros */}
                {others.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {others.map((member, i) => (
                      <Link
                        key={member.id}
                        href={`/vereadores/${member.slug}`}
                        className="group no-underline"
                        data-reveal="up"
                        data-reveal-delay={String(Math.min(i, 5) * 80)}
                      >
                        <article className="h-full bg-card border border-border rounded-2xl p-6 text-center shadow-sm transition-all duration-300 hover:shadow-md hover:border-gold/40">
                          <MemberPhoto member={member} size="w-28 h-28" textSize="text-3xl" />
                          <div className="mt-5">
                            <RoleBadge role={member.role} />
                            <h3 className="mt-2.5 text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                              {member.name}
                            </h3>
                            {member.party && (
                              <p className="mt-1 text-sm font-medium text-muted-foreground">{member.party}</p>
                            )}
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16"><p className="text-muted-foreground">Informações em atualização.</p></div>
            )}

            {/* Competências da Mesa */}
            <div data-reveal="up" className="mt-12 lg:mt-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center shrink-0">
                  <Gavel className="w-5 h-5 text-gold" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Competências</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COMPETENCIAS.map((item) => (
                  <div key={item.role} className="flex gap-4 bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <div className="w-1 rounded-full bg-gold shrink-0" aria-hidden="true" />
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{item.role}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
