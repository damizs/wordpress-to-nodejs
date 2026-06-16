import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import {
  Landmark,
  Eye,
  FileText,
  HeartHandshake,
  Newspaper,
  Compass,
  Link2,
  Building2,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

interface SitemapLink {
  label: string;
  href: string;
}

interface SitemapGroup {
  title: string;
  links: SitemapLink[];
}

interface Props {
  groups: SitemapGroup[];
}

const GROUP_ICONS: Record<string, LucideIcon> = {
  "A Câmara": Landmark,
  "Transparência": Eye,
  "Documentos": FileText,
  "Cidadão": HeartHandshake,
  "Notícias": Newspaper,
  "Navegação": Compass,
  "Links Úteis": Link2,
  "Institucional": Building2,
};

export default function MapaDoSite({ groups = [] }: Props) {
  return (
    <>
      <SeoHead
        title="Mapa do Site - Câmara Municipal de Sumé"
        description="Encontre rapidamente todas as seções e páginas do portal da Câmara Municipal de Sumé."
        url="/mapa-do-site"
      />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Mapa do Site" }]} />
        <PageHero
          badge="Navegação"
          title="Mapa do Site"
          subtitle="Todas as seções e páginas do portal organizadas em um só lugar"
          centered
        />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group) => {
                  const Icon = GROUP_ICONS[group.title] ?? Compass;
                  return (
                    <div key={group.title} className="card-modern p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="font-bold text-foreground">{group.title}</h2>
                      </div>
                      <ul className="space-y-1">
                        {group.links.map((link) => (
                          <li key={link.href + link.label}>
                            {link.href.startsWith("http") ? (
                              <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 py-1.5 px-2 -mx-2 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-muted transition-colors no-underline"
                              >
                                <ChevronRight className="w-3.5 h-3.5 text-gold shrink-0" />
                                {link.label}
                              </a>
                            ) : (
                              <Link
                                href={link.href}
                                className="flex items-center gap-2 py-1.5 px-2 -mx-2 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-muted transition-colors no-underline"
                              >
                                <ChevronRight className="w-3.5 h-3.5 text-gold shrink-0" />
                                {link.label}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
