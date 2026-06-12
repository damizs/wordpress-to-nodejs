import { Download, ExternalLink, FileText } from "lucide-react";

/**
 * Ações compartilhadas de documento (Baixar PDF / Visualizar).
 * Usado nas 4 seções públicas de documentos: publicações, atas, pautas e atividades.
 * Se não há arquivo, nada é renderizado.
 */

interface DocumentActionsProps {
  fileUrl?: string | null;
  label?: string;
  className?: string;
}

/** Par de botões: primário "Baixar PDF" + secundário "Visualizar" (abre em nova aba). */
export function DocumentActions({ fileUrl, label = "Baixar PDF", className = "" }: DocumentActionsProps) {
  if (!fileUrl) return null;
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <a
        href={fileUrl}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-[0.98] transition-all no-underline"
      >
        <Download className="w-5 h-5" />
        {label}
      </a>
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-primary/25 text-primary text-sm font-semibold hover:border-primary/50 hover:bg-primary/5 transition-all no-underline"
      >
        <ExternalLink className="w-4 h-4" />
        Visualizar
      </a>
    </div>
  );
}

/** Painel de destaque para páginas de detalhe: faixa "Documento disponível" + botões. */
export function DocumentActionsPanel({ fileUrl, label = "Baixar PDF", className = "" }: DocumentActionsProps) {
  if (!fileUrl) return null;
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 rounded-2xl border border-primary/15 bg-primary/5 ${className}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">Documento oficial disponível</p>
          <p className="text-xs text-muted-foreground">Arquivo em PDF para download ou leitura online</p>
        </div>
      </div>
      <DocumentActions fileUrl={fileUrl} label={label} className="shrink-0" />
    </div>
  );
}

/** Botão compacto de download para linhas/cards de listagem. */
export function DownloadPdfButton({ fileUrl, className = "" }: { fileUrl?: string | null; className?: string }) {
  if (!fileUrl) return null;
  return (
    <a
      href={fileUrl}
      download
      target="_blank"
      rel="noopener noreferrer"
      title="Baixar PDF"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:bg-primary/90 hover:shadow transition-all no-underline shrink-0 ${className}`}
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Baixar PDF</span>
    </a>
  );
}

/** Formata datas vindas do backend ("YYYY-MM-DD" ou ISO) sem deslocamento de fuso. */
export function formatDocumentDate(value?: string | null, long = false): string | null {
  if (!value) return null;
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  const date = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(
    "pt-BR",
    long ? { day: "numeric", month: "long", year: "numeric" } : undefined
  );
}
