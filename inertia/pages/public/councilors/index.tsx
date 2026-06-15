import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Mail, Phone, ArrowRight } from "lucide-react";

interface Vereador {
  id: number;
  name: string;
  slug: string;
  party?: string;
  photo?: string;
  role?: string;
  email?: string;
  phone?: string;
}

interface Props {
  vereadores: Vereador[];
  legislature?: { name: string; year_start: number; year_end: number };
}

export default function VereadoresIndex({ vereadores = [], legislature }: Props) {
  return (
    <>
      <SeoHead
        title="Vereadores - Câmara Municipal de Sumé"
        description="Conheça os vereadores da Câmara Municipal de Sumé. Veja informações de contato, partido e atividades parlamentares."
        url="/vereadores"
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Vereadores" }]} />
        <PageHero
          badge="Poder Legislativo"
          title="Vereadores"
          subtitle={legislature ? `${legislature.name} (${legislature.year_start} - ${legislature.year_end})` : "Integrantes do Poder Legislativo Municipal"}
          centered
        />

        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
            {vereadores.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {vereadores.map((vereador, i) => (
                  <Link
                    key={vereador.id}
                    href={`/vereadores/${vereador.slug}`}
                    className="group no-underline"
                    data-reveal="up"
                    data-reveal-delay={String(Math.min(i, 7) * 60)}
                  >
                    <article className="h-full bg-card border border-border rounded-2xl p-6 text-center shadow-sm transition-all duration-300 hover:shadow-md hover:border-gold/40">
                      {/* Foto circular com ring dourado */}
                      <div className="w-28 h-28 mx-auto rounded-full overflow-hidden ring-2 ring-gold/40 ring-offset-4 ring-offset-card bg-muted transition-colors duration-300 group-hover:ring-gold">
                        {vereador.photo ? (
                          <img
                            src={vereador.photo}
                            alt={`Foto de ${vereador.name}`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary/40"
                            aria-hidden="true"
                          >
                            {vereador.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="mt-5">
                        {vereador.role && (
                          <span className="inline-block mb-2 px-2.5 py-0.5 bg-gold/10 text-gold border border-gold/25 text-[11px] font-bold rounded-full uppercase tracking-wide">
                            {vereador.role}
                          </span>
                        )}
                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                          {vereador.name}
                        </h3>
                        {vereador.party && (
                          <p className="mt-1 text-sm font-medium text-muted-foreground">{vereador.party}</p>
                        )}

                        {/* Contato */}
                        {(vereador.email || vereador.phone) && (
                          <div className="mt-4 flex items-center justify-center gap-2.5">
                            {vereador.email && (
                              <span
                                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
                                title="Possui e-mail de contato"
                              >
                                <Mail className="w-4 h-4" aria-hidden="true" />
                              </span>
                            )}
                            {vereador.phone && (
                              <span
                                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
                                title="Possui telefone de contato"
                              >
                                <Phone className="w-4 h-4" aria-hidden="true" />
                              </span>
                            )}
                          </div>
                        )}

                        <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-primary group-hover:text-gold transition-colors">
                          Ver perfil
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Nenhum vereador cadastrado.</p>
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
