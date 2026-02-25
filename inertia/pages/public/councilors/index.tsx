import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
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

        <main className="py-12">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-3">
                Poder Legislativo
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Vereadores</h1>
              {legislature && (
                <p className="mt-2 text-muted-foreground">
                  {legislature.name} ({legislature.year_start} - {legislature.year_end})
                </p>
              )}
            </div>

            {/* Grid */}
            {vereadores.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {vereadores.map((vereador) => (
                  <Link
                    key={vereador.id}
                    href={`/vereadores/${vereador.slug}`}
                    className="group no-underline"
                  >
                    <div className="card-modern overflow-hidden text-center">
                      {/* Photo */}
                      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary/20 to-gold/20">
                        {vereador.photo ? (
                          <img
                            src={vereador.photo}
                            alt={vereador.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl text-primary/30">👤</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="inline-flex items-center gap-1 text-white text-sm font-medium">
                            Ver perfil <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                          {vereador.name}
                        </h3>
                        {vereador.party && (
                          <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                            {vereador.party}
                          </span>
                        )}
                        {vereador.role && (
                          <p className="mt-2 text-sm text-gold font-medium">{vereador.role}</p>
                        )}

                        {/* Contact */}
                        <div className="mt-4 flex items-center justify-center gap-3">
                          {vereador.email && (
                            <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                              <Mail className="w-4 h-4" />
                            </span>
                          )}
                          {vereador.phone && (
                            <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                              <Phone className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Nenhum vereador cadastrado.</p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
