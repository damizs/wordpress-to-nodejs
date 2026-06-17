import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import {
  ArrowRight,
  CalendarClock,
  Download,
  ExternalLink,
  FileText,
  Search,
  Video,
  X,
} from "lucide-react";
import { PageLayout } from "~/components/PageLayout";
import { FilterBar } from "~/components/FilterBar";
import { formatDocumentDate } from "~/components/DocumentActions";
import { SafeHtml } from "~/components/SafeHtml";

interface SessionItem {
  id: number;
  title: string;
  slug?: string | null;
  type: string;
  type_label: string;
  session_date: string;
  start_time?: string | null;
  status: "agendada" | "realizada" | "cancelada" | string;
  status_label: string;
  agenda?: string | null;
  minutes?: string | null;
  video_url?: string | null;
  file_url?: string | null;
  voting_system_url?: string | null;
}

interface Props {
  sessions: SessionItem[];
  pagination?: { currentPage: number; lastPage: number; total?: number };
  years?: number[];
  types?: { value: string; label: string }[];
  statuses?: { value: string; label: string }[];
  filters?: { year?: string; type?: string; status?: string; search?: string };
}

const statusTone: Record<string, string> = {
  agendada: "bg-amber-500/10 text-amber-700",
  realizada: "bg-emerald-600/10 text-emerald-700",
  cancelada: "bg-destructive/10 text-destructive",
};

export default function AgendaIndex({
  sessions = [],
  pagination,
  years = [],
  types = [],
  statuses = [],
  filters = {},
}: Props) {
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  function applyFilters(patch: Record<string, string>) {
    const params: Record<string, string> = {};
    const year = patch.ano ?? filters.year ?? "";
    const type = patch.tipo ?? filters.type ?? "";
    const status = patch.situacao ?? filters.status ?? "";
    const search = patch.busca ?? filters.search ?? "";
    if (year) params.ano = year;
    if (type) params.tipo = type;
    if (status) params.situacao = status;
    if (search) params.busca = search;
    router.get("/agenda", params, { preserveScroll: true });
  }

  const hasFilters = !!(filters.year || filters.type || filters.status || filters.search);
  const queryString = `${filters.year ? `&ano=${filters.year}` : ""}${filters.type ? `&tipo=${filters.type}` : ""}${filters.status ? `&situacao=${filters.status}` : ""}${filters.search ? `&busca=${encodeURIComponent(filters.search)}` : ""}`;

  return (
    <PageLayout
      seo={{
        title: "Agenda de Sessões - Câmara Municipal de Sumé",
        description: "Agenda pública das sessões plenárias da Câmara Municipal de Sumé.",
        url: "/agenda",
      }}
      breadcrumb={[{ label: "Agenda de Sessões" }]}
      hero={{
        badge: "Legislativo",
        title: "Agenda de Sessões",
        subtitle: "Acompanhe sessões agendadas, realizadas, vídeos, pauta e calendário oficial.",
      }}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sessões plenárias</h2>
          <p className="text-sm text-muted-foreground">
            Os eventos também podem ser assinados em calendário pelo arquivo ICS.
          </p>
        </div>
        <a
          href="/agenda.ics"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-navy-light"
        >
          <Download className="h-4 w-4" />
          Baixar calendário
        </a>
      </div>

      <FilterBar>
        <form
          className="filter-search"
          onSubmit={(event) => {
            event.preventDefault();
            applyFilters({ busca: searchTerm });
          }}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Pesquisar na agenda..."
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </form>
        <select
          value={filters.type || ""}
          onChange={(event) => applyFilters({ tipo: event.target.value })}
          className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 md:w-auto"
        >
          <option value="">Todos os tipos</option>
          {types.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        <select
          value={filters.status || ""}
          onChange={(event) => applyFilters({ situacao: event.target.value })}
          className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 md:w-auto"
        >
          <option value="">Todas as situações</option>
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
        <select
          value={filters.year || ""}
          onChange={(event) => applyFilters({ ano: event.target.value })}
          className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 md:w-auto"
        >
          <option value="">Todos os anos</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              router.get("/agenda");
            }}
            className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl px-4 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:w-auto"
          >
            <X className="h-4 w-4" />
            Limpar
          </button>
        )}
      </FilterBar>

      {pagination?.total !== undefined && (
        <p className="mb-6 text-right text-sm text-muted-foreground">
          {pagination.total} {pagination.total === 1 ? "sessão encontrada" : "sessões encontradas"}
        </p>
      )}

      {sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <article
              key={session.id}
              data-reveal="up"
              data-reveal-delay={String(Math.min(index, 6) * 60)}
              className="card-modern p-5"
            >
              <div className="grid gap-5 lg:grid-cols-[auto_1fr_auto] lg:items-start">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CalendarClock className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy-dark dark:text-gold">
                      {session.type_label}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusTone[session.status] || "bg-muted text-muted-foreground"}`}>
                      {session.status_label}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{session.title}</h3>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatDocumentDate(session.session_date, true)}</span>
                    {session.start_time && <span>às {session.start_time.slice(0, 5)}</span>}
                  </p>

                  {session.agenda && (
                    <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Pauta</p>
                      <SafeHtml html={session.agenda} className="prose prose-slate dark:prose-invert max-w-none text-sm" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                  {session.video_url && (
                    <a
                      href={session.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-navy-light"
                    >
                      <Video className="h-4 w-4" />
                      Vídeo
                    </a>
                  )}
                  {session.file_url && (
                    <a
                      href={session.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground no-underline transition-colors hover:bg-muted"
                    >
                      <FileText className="h-4 w-4" />
                      PDF
                    </a>
                  )}
                  {session.voting_system_url && (
                    <a
                      href={session.voting_system_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground no-underline transition-colors hover:bg-muted"
                    >
                      Sistema <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <CalendarClock className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold text-foreground">Nenhuma sessão encontrada</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasFilters ? "Tente ajustar os filtros da agenda." : "Novas sessões serão exibidas assim que cadastradas."}
          </p>
        </div>
      )}

      {pagination && pagination.lastPage > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {pagination.currentPage > 1 && (
            <Link
              href={`/agenda?page=${pagination.currentPage - 1}${queryString}`}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground no-underline hover:bg-muted"
            >
              Anterior
            </Link>
          )}
          <span className="px-4 py-2 text-sm text-muted-foreground">
            Página {pagination.currentPage} de {pagination.lastPage}
          </span>
          {pagination.currentPage < pagination.lastPage && (
            <Link
              href={`/agenda?page=${pagination.currentPage + 1}${queryString}`}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground no-underline hover:bg-muted"
            >
              Próxima <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </PageLayout>
  );
}
