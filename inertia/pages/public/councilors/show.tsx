import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Mail, Phone, MapPin, Calendar, ArrowLeft, Facebook, Instagram } from "lucide-react";

interface Props {
  vereador: {
    id: number;
    name: string;
    slug: string;
    party?: string;
    photo?: string;
    role?: string;
    email?: string;
    phone?: string;
    biography?: string;
    birth_date?: string;
    address?: string;
  };
  activities?: any[];
}

export default function VereadorShow({ vereador, activities = [] }: Props) {
  return (
    <>
      <SeoHead
        title={`${vereador.name} - Câmara Municipal de Sumé`}
        description={`Perfil do vereador ${vereador.name}. ${vereador.party || ''}`}
        url={`/vereadores/${vereador.slug}`}
        image={vereador.photo}
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Vereadores", href: "/vereadores" }, { label: vereador.name }]} />

        <main className="py-12">
          <div className="container mx-auto px-4">
            {/* Back Link */}
            <Link
              href="/vereadores"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 no-underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para vereadores
            </Link>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Sidebar - Photo & Contact */}
              <div className="lg:col-span-1">
                <div className="card-modern overflow-hidden sticky top-4">
                  {/* Photo */}
                  <div className="relative h-72 overflow-hidden bg-gradient-to-br from-primary/20 to-gold/20">
                    {vereador.photo ? (
                      <img
                        src={vereador.photo}
                        alt={vereador.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-8xl text-primary/30">👤</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-foreground">{vereador.name}</h1>
                    {vereador.party && (
                      <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full">
                        {vereador.party}
                      </span>
                    )}
                    {vereador.role && (
                      <p className="mt-2 text-gold font-semibold">{vereador.role}</p>
                    )}

                    {/* Contact */}
                    <div className="mt-6 space-y-3">
                      {vereador.email && (
                        <a
                          href={`mailto:${vereador.email}`}
                          className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors no-underline"
                        >
                          <Mail className="w-5 h-5" />
                          <span className="text-sm">{vereador.email}</span>
                        </a>
                      )}
                      {vereador.phone && (
                        <a
                          href={`tel:${vereador.phone}`}
                          className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors no-underline"
                        >
                          <Phone className="w-5 h-5" />
                          <span className="text-sm">{vereador.phone}</span>
                        </a>
                      )}
                      {vereador.address && (
                        <div className="flex items-start gap-3 text-muted-foreground">
                          <MapPin className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm">{vereador.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Biography */}
                {vereador.biography && (
                  <div className="card-modern p-6 md:p-8">
                    <h2 className="text-xl font-bold text-foreground mb-4">Biografia</h2>
                    <div
                      className="prose prose-sm max-w-none prose-p:text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: vereador.biography }}
                    />
                  </div>
                )}

                {/* Activities */}
                {activities.length > 0 && (
                  <div className="card-modern p-6 md:p-8">
                    <h2 className="text-xl font-bold text-foreground mb-4">Atividades Legislativas</h2>
                    <div className="space-y-4">
                      {activities.map((activity: any) => (
                        <Link
                          key={activity.id}
                          href={`/atividades-legislativas/${activity.slug}`}
                          className="block p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors no-underline"
                        >
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(activity.date).toLocaleDateString('pt-BR')}
                            {activity.type && (
                              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                {activity.type}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground">{activity.title}</h3>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!vereador.biography && activities.length === 0 && (
                  <div className="card-modern p-8 text-center">
                    <p className="text-muted-foreground">
                      Informações detalhadas em breve.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
