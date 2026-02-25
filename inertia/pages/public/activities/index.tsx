import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { Footer } from "~/components/Footer";
import { Calendar, FileText, Tag, ChevronLeft, ChevronRight } from "lucide-react";

interface Activity { id: number; title: string; slug: string; date: string; type?: string; author?: { name: string }; }
interface Props { activities: Activity[]; pagination?: { currentPage: number; lastPage: number; }; }

export default function ActivitiesIndex({ activities = [], pagination }: Props) {
  return (
    <>
      <SeoHead title="Atividades Legislativas - Câmara Municipal de Sumé" description="Acompanhe as atividades legislativas: projetos de lei, requerimentos, indicações e moções." url="/atividades-legislativas" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Atividades Legislativas" }]} />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-3">Legislativo</span>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Atividades Legislativas</h1>
              <p className="mt-2 text-muted-foreground">Projetos de Lei, Requerimentos, Indicações e Moções</p>
            </div>
            {activities.length > 0 ? (
              <div className="max-w-4xl mx-auto grid gap-4">
                {activities.map((activity) => (
                  <Link key={activity.id} href={`/atividades-legislativas/${activity.slug}`} className="group no-underline">
                    <div className="card-modern p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><FileText className="w-6 h-6 text-primary" /></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{activity.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(activity.date).toLocaleDateString('pt-BR')}</span>
                          {activity.type && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{activity.type}</span>}
                          {activity.author && <span>Por: {activity.author.name}</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16"><p className="text-muted-foreground">Nenhuma atividade cadastrada.</p></div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
