import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, ArrowLeft, User, Tag, Download } from "lucide-react";

interface Props { activity: { id: number; title: string; slug: string; date: string; type?: string; content?: string; status?: string; file_url?: string; author?: { name: string; slug: string }; }; }

export default function ActivityShow({ activity }: Props) {
  return (
    <>
      <SeoHead title={`${activity.title} - Câmara Municipal de Sumé`} url={`/atividades-legislativas/${activity.slug}`} />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Atividades Legislativas", href: "/atividades-legislativas" }, { label: activity.title }]} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Link href="/atividades-legislativas" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 no-underline"><ArrowLeft className="w-4 h-4" />Voltar</Link>
              <article className="card-modern p-6 md:p-10">
                <div className="flex flex-wrap gap-2 mb-4">
                  {activity.type && <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">{activity.type}</span>}
                  {activity.status && <span className="px-3 py-1 bg-gold/10 text-gold text-xs font-semibold rounded-full">{activity.status}</span>}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{activity.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(activity.date).toLocaleDateString('pt-BR')}</span>
                  {activity.author && (
                    <Link href={`/vereadores/${activity.author.slug}`} className="flex items-center gap-1 hover:text-primary transition-colors no-underline text-muted-foreground">
                      <User className="w-4 h-4" />{activity.author.name}
                    </Link>
                  )}
                </div>
                {activity.file_url && (
                  <a href={activity.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 btn-modern bg-primary text-primary-foreground mb-6 no-underline">
                    <Download className="w-5 h-5" />Baixar Documento
                  </a>
                )}
                {activity.content && <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: activity.content }} />}
              </article>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
