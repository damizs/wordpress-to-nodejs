import { useEffect } from "react";
import { useSiteSettings } from "~/hooks/use_site_settings";
import { RichText } from "~/lib/rich_text";
import { Printer } from "lucide-react";

interface Props {
  activity: {
    title: string;
    slug: string;
    type?: string;
    number?: string;
    year?: number;
    summary?: string | null;
    content?: string | null;
    status?: string;
    origin?: string;
    originLabel?: string;
    sessionDate?: string | null;
    author?: string | null;
  };
  authors?: { name: string }[];
}

export default function ActivityExport({ activity, authors = [] }: Props) {
  const settings = useSiteSettings();
  const logo = settings.document_brasao_url || settings.logo_url || null;
  const line1 = (settings.header_subtitle || "Estado da Paraíba").toUpperCase();
  const line2 = (settings.header_title || "Câmara Municipal de Sumé").toUpperCase();
  const authorLine =
    authors.length > 0 ? authors.map((a) => a.name).join(", ") : activity.author || null;

  useEffect(() => {
    document.title = `${activity.title} — Exportação PDF`;
  }, [activity.title]);

  return (
    <div className="min-h-screen bg-white text-black print:p-0">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
        }
      `}</style>

      <div className="no-print sticky top-0 z-50 border-b border-border bg-card px-4 py-3 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Use <strong className="text-foreground">Imprimir</strong> e escolha &quot;Salvar como PDF&quot; no navegador.
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Salvar PDF
        </button>
      </div>

      <article className="max-w-[210mm] mx-auto px-8 py-10 print:px-12 print:py-8">
        <header className="text-center border-b border-black/15 pb-6 mb-8">
          {logo && (
            <img src={logo} alt="" className="h-16 w-auto object-contain mx-auto mb-3" />
          )}
          <p className="text-[11px] tracking-[0.2em] text-black/60">{line1}</p>
          <p className="text-base font-bold tracking-wide">{line2}</p>
          <p className="text-xs text-black/50 mt-4 uppercase tracking-wide">Atividade Legislativa</p>
        </header>

        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          {activity.type && (
            <span className="px-2 py-0.5 border border-black/20 rounded font-semibold uppercase">
              {activity.type}
            </span>
          )}
          {activity.number && activity.year && (
            <span className="px-2 py-0.5 border border-black/20 rounded font-bold">
              Nº {activity.number}/{activity.year}
            </span>
          )}
          {activity.status && (
            <span className="px-2 py-0.5 border border-black/20 rounded capitalize">{activity.status}</span>
          )}
          {activity.originLabel && (
            <span className="px-2 py-0.5 border border-black/20 rounded">{activity.originLabel}</span>
          )}
        </div>

        <h1 className="text-xl font-bold leading-snug mb-4">{activity.title}</h1>

        {(activity.summary || authorLine || activity.sessionDate) && (
          <div className="mb-6 space-y-2 text-sm text-black/75">
            {activity.summary && (
              <p>
                <strong className="text-black">Ementa:</strong> {activity.summary}
              </p>
            )}
            {authorLine && (
              <p>
                <strong className="text-black">Autoria:</strong> {authorLine}
              </p>
            )}
            {activity.originLabel && (
              <p>
                <strong className="text-black">Origem:</strong> {activity.originLabel}
              </p>
            )}
            {activity.sessionDate && (
              <p>
                <strong className="text-black">Data:</strong>{" "}
                {new Date(`${activity.sessionDate}T12:00:00`).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
        )}

        {activity.content && (
          <div className="text-black">
            <RichText text={activity.content} className="prose prose-sm max-w-none [&_*]:text-black" />
          </div>
        )}

        <footer className="mt-10 pt-4 border-t border-black/15 text-[10px] text-black/50 text-center">
          Documento gerado em {new Date().toLocaleString("pt-BR")} —{" "}
          {typeof window !== "undefined" ? window.location.origin : ""}/atividades-legislativas/{activity.slug}
        </footer>
      </article>
    </div>
  );
}
