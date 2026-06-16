import { Play, X, Eye, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export interface ReelItem {
  id: string;
  shortcode: string;
  image: string;
  title: string;
  date: string;
  viewCount: number;
  reelUrl: string;
}

const compact = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });

/** Carrega o embed.js do Instagram uma única vez. */
function ensureEmbedScript(): Promise<void> {
  return new Promise((resolve) => {
    const w = window as any;
    if (w.instgrm) return resolve();
    const existing = document.getElementById("ig-embed-js") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const s = document.createElement("script");
    s.id = "ig-embed-js";
    s.src = "https://www.instagram.com/embed.js";
    s.async = true;
    s.onload = () => resolve();
    document.body.appendChild(s);
  });
}

export function ReelsGallery({ reels }: { reels: ReelItem[] }) {
  const [active, setActive] = useState<ReelItem | null>(null);

  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // Processa o embed do Instagram após o blockquote entrar no DOM.
    ensureEmbedScript().then(() => {
      requestAnimationFrame(() => (window as any).instgrm?.Embeds?.process());
    });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close]);

  if (!reels || reels.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {reels.map((reel) => (
          <button
            key={reel.id}
            type="button"
            onClick={() => setActive(reel)}
            className="group relative block aspect-[9/16] w-full overflow-hidden rounded-2xl border border-border bg-muted text-left shadow-sm transition-all hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            aria-label={`Assistir ao reel: ${reel.title}`}
          >
            {reel.image ? (
              <img
                src={reel.image}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="h-10 w-10 text-muted-foreground/40" />
              </div>
            )}

            {/* Overlay de play */}
            <div className="absolute inset-0 flex items-center justify-center bg-navy-dark/10 transition-colors group-hover:bg-navy-dark/30">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
                <Play className="ml-0.5 h-6 w-6 fill-navy text-navy" />
              </span>
            </div>

            {/* Faixa inferior com legenda/views */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/40 to-transparent p-3 pt-8">
              <p className="line-clamp-2 text-xs font-medium text-white">{reel.title}</p>
              {(reel.viewCount > 0 || reel.date) && (
                <div className="mt-1 flex items-center gap-3 text-[11px] text-white/80">
                  {reel.viewCount > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {compact.format(reel.viewCount)}
                    </span>
                  )}
                  {reel.date && <span>{reel.date}</span>}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox com embed oficial do Instagram */}
      {active && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-dark/80 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Reel: ${active.title}`}
          onClick={close}
        >
          <div
            className="relative w-full max-w-[420px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between">
              <a
                href={active.reelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white no-underline hover:underline"
              >
                Ver no Instagram <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={close}
                aria-label="Fechar"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-y-auto rounded-xl bg-white">
              <blockquote
                key={active.id}
                className="instagram-media"
                data-instgrm-permalink={active.reelUrl}
                data-instgrm-version="14"
                style={{ margin: 0, width: "100%", minWidth: "auto" }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
