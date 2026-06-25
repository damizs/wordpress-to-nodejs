import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, X } from "lucide-react";

/**
 * Modal popup que renderiza um link em iframe, com botão "Abrir em nova aba".
 * Links internos (URL relativa ou mesmo host) recebem ?embed=1 quando
 * hideChrome estiver ligado — o Header/Footer das páginas públicas detectam
 * esse parâmetro e não são renderizados dentro do iframe.
 *
 * Observação: muitos sites externos enviam X-Frame-Options/CSP e bloqueiam
 * iframe; por isso o aviso fixo apontando para "Abrir em nova aba".
 */

export interface LinkModalLink {
  title: string;
  url: string;
  /** 'nova_aba' | 'modal' — vindo do cadastro */
  open_mode?: string | null;
  hide_chrome?: boolean | null;
}

interface LinkModalProps {
  link: LinkModalLink | null;
  onClose: () => void;
}

/** URL do próprio portal: relativa ("/pagina") ou absoluta com o mesmo host */
function isInternalUrl(url: string) {
  if (url.startsWith("/")) return true;
  if (typeof window === "undefined") return false;
  try {
    return new URL(url, window.location.origin).host === window.location.host;
  } catch {
    return false;
  }
}

function buildIframeUrl(url: string, hideChrome: boolean) {
  if (!hideChrome || !isInternalUrl(url)) return url;
  return `${url}${url.includes("?") ? "&" : "?"}embed=1`;
}

export function LinkModal({ link, onClose }: LinkModalProps) {
  const [loading, setLoading] = useState(true);
  const openLinkRef = useRef<HTMLAnchorElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const open = !!link;

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    lastFocused.current = document.activeElement as HTMLElement;
    openLinkRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const first = openLinkRef.current;
      const last = closeRef.current;
      if (!first || !last) return;

      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      lastFocused.current?.focus?.();
    };
  }, [open, link?.url, onClose]);

  if (!link) return null;

  const iframeUrl = buildIframeUrl(link.url, link.hide_chrome ?? true);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="link-modal-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-navy-dark/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-5xl h-[85vh] bg-card rounded-2xl shadow-xl border border-border flex flex-col overflow-hidden animate-scale-in">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/40 shrink-0">
          <h2
            id="link-modal-title"
            className="flex-1 min-w-0 text-sm font-semibold text-foreground truncate"
          >
            {link.title}
          </h2>
          <a
            ref={openLinkRef}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted hover:text-primary transition-colors no-underline shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Abrir em nova aba</span>
            <span className="sm:hidden">Nova aba</span>
          </a>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="relative flex-1 min-h-0 bg-background">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden="true" />
              <span className="text-sm">Carregando...</span>
            </div>
          )}
          <iframe
            src={iframeUrl}
            title={link.title}
            onLoad={() => setLoading(false)}
            className="w-full h-full border-0"
          />
        </div>

        <p className="px-4 py-2 text-[11px] text-muted-foreground border-t border-border bg-muted/40 shrink-0">
          Se o conteúdo não carregar, use &ldquo;Abrir em nova aba&rdquo;.
        </p>
      </div>
    </div>
  );
}
