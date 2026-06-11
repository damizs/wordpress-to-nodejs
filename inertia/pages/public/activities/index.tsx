import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Calendar, FileText, Tag, ChevronLeft, ChevronRight, User, X } from "lucide-react";

interface Activity { id: number; title: string; slug: string; date: string; type?: string; author?: { name: string }; }
interface Filters { type?: string; year?: string; autor?: string; }
interface Props { activities: Activity[]; pagination?: { currentPage: number; lastPage: number; }; filters?: Filters; }

const pageUrl = (page: number, filters?: Filters) => {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (filters?.type) params.set("tipo", filters.type);
  if (filters?.year) params.set("ano", filters.year);
  if (filters?.autor) params.set("autor", filters.autor);
  const qs = params.toString();
  return `/atividades-legislativas${qs ? `?${qs}` : ""}`;
};

export default function ActivitiesIndex({ activities = [], pagination, filters }: Props) {
  return (
    <>
      <SeoHead title="Atividades Legislativas - Câmara Municipal de Sumé" description="Acompanhe as atividades legislativas: projetos de lei, requerimentos, indicações e moções." url="/atividades-legislativas" />
      <div className="min-h-screen bg-background">
        <TopBar /><Header /><Breadcrumb items={[{ label: "Atividades Legislativas" }]} />
        <PageHero badge="Legislativo" title="Atividades Legislativas" subtitle="Projetos de Lei, Requerimentos, Indicações e Moções" centered />
        <main className="py-12">
          <div className="container mx-auto px-4">
            {filters?.autor && (
              <div className="max-w-4xl mx-auto mb-6 flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
                <User className="w-4 h-4 text-primary shrink-0" />
                <p className="text-sm text-foreground">
                  Exibindo matérias de autoria de <strong>{filters.autor}</strong>
                </p>
                <Link
                  href="/atividades-legislativas"
                  className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors no-underline shrink-0"
                >
                  <X className="w-3.5 h-3.5" /> Limpar filtro
                </Link>
              </div>
            )}
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
              <div className="text-center py-16"><p className="text-muted-foreground">Nenhuma atividade encontrada.</p></div>
            )}

            {pagination && pagination.lastPage > 1 && (
              <div className="max-w-4xl mx-auto flex items-center justify-center gap-3 mt-10">
                {pagination.currentPage > 1 && (
                  <Link
                    href={pageUrl(pagination.currentPage - 1, filters)}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors no-underline"
                  >
                    <ChevronLeft className="w-4 h-4" /> Anterior
                  </Link>
                )}
                <span className="text-sm text-muted-foreground">
                  Página {pagination.currentPage} de {pagination.lastPage}
                </span>
                {pagination.currentPage < pagination.lastPage && (
                  <Link
                    href={pageUrl(pagination.currentPage + 1, filters)}
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors no-underline"
                  >
                    Próxima <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
