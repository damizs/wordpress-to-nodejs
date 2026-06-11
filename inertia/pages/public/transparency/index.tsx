import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { ExternalLink, FileText, DollarSign, Users, Building, FileCheck, Search } from "lucide-react";

interface TransparencySection {
  id: number;
  title: string;
  description?: string;
  icon?: string;
  links: {
    id: number;
    title: string;
    url: string;
    is_external: boolean;
  }[];
}

interface Props {
  sections: TransparencySection[];
}

const iconMap: Record<string, any> = {
  DollarSign, Users, FileText, Building, FileCheck, Search
};

export default function TransparenciaIndex({ sections = [] }: Props) {
  return (
    <>
      <SeoHead
        title="Portal da Transparência - Câmara Municipal de Sumé"
        description="Acesse informações sobre a gestão dos recursos públicos da Câmara Municipal de Sumé. Transparência e acesso à informação."
        url="/transparencia"
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Transparência" }]} />
        <PageHero
          badge="Acesso à Informação"
          title="Portal da Transparência"
          subtitle="Em cumprimento à Lei de Acesso à Informação (Lei nº 12.527/2011), disponibilizamos informações sobre a gestão dos recursos públicos da Câmara Municipal."
          centered
        />

        <main className="py-12">
          <div className="container mx-auto px-4">
            {/* Sections */}
            {sections.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section, i) => {
                  const Icon = iconMap[section.icon || 'FileText'] || FileText;
                  return (
                    <div key={section.id} data-reveal="up" data-reveal-delay={String(Math.min(i, 6) * 60)} className="card-modern card-shine p-6 hover-lift">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{section.title}</h3>
                          {section.description && (
                            <p className="text-xs text-muted-foreground">{section.description}</p>
                          )}
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {section.links.map((link) => (
                          <li key={link.id}>
                            {link.is_external ? (
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm text-foreground no-underline"
                              >
                                <span>{link.title}</span>
                                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                              </a>
                            ) : (
                              <Link
                                href={link.url}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm text-foreground no-underline"
                              >
                                <span>{link.title}</span>
                                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Seções em atualização.</p>
              </div>
            )}

            {/* E-SIC Link */}
            <div data-reveal="zoom" className="mt-12 p-8 bg-gradient-hero rounded-3xl text-primary-foreground text-center">
              <h2 className="text-2xl font-bold mb-2">Não encontrou o que procura?</h2>
              <p className="opacity-80 mb-6">
                Utilize o Sistema Eletrônico de Informação ao Cidadão para solicitar informações
              </p>
              <Link
                href="/esic"
                className="inline-flex items-center gap-2 btn-modern bg-gold text-navy-dark no-underline"
              >
                <Search className="w-5 h-5" />
                Acessar e-SIC
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
