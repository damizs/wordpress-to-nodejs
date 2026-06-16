import { useEffect, useMemo, useState, type ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, ExternalLink, Printer, Link2, Check, Mail } from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";

/**
 * Documento oficial: papel com timbre (brasão + identificação da Câmara), o
 * conteúdo da matéria e um rodapé padronizado com QR Code (validação online),
 * download do PDF e botões de compartilhamento.
 *
 * Usado nas 4 seções de matérias individuais: publicações oficiais, atas,
 * pautas e atividades legislativas. Mantém tokens (dark-safe) no chrome; o QR
 * é renderizado sobre fundo branco fixo para garantir leitura pela câmera.
 */

interface OfficialDocumentProps {
  /** Caminho canônico da página (ex.: "/publicacoes-oficiais/slug") */
  url: string;
  /** PDF para download/visualização, quando houver */
  fileUrl?: string | null;
  /** Fallback de exportação (impressão → PDF) quando não há arquivo nativo */
  exportUrl?: string | null;
  /** Texto base para compartilhamento */
  shareTitle: string;
  children: ReactNode;
}

function Letterhead() {
  const settings = useSiteSettings();
  const logo = settings.document_brasao_url || settings.logo_url || null;
  const line1 = (settings.header_subtitle || "Estado da Paraíba").toUpperCase();
  const line2 = (settings.header_title || "Câmara Municipal de Sumé").toUpperCase();
  const address = settings.footer_address || "";

  return (
    <div className="border-b border-border bg-muted/30 px-6 md:px-10 py-7 text-center">
      {logo && (
        <img
          src={logo}
          alt=""
          className="h-16 md:h-20 w-auto object-contain mx-auto mb-3"
        />
      )}
      <p className="text-[11px] md:text-xs font-medium tracking-[0.22em] text-muted-foreground">
        {line1}
      </p>
      <p className="text-sm md:text-base font-bold tracking-wide text-foreground">
        {line2}
      </p>
      {address && (
        <p className="text-[11px] md:text-xs text-muted-foreground mt-1.5 max-w-md mx-auto">
          {address}
        </p>
      )}
    </div>
  );
}

function ShareBar({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent(url);
  const encTitle = encodeURIComponent(title);

  const networks: { label: string; href: string; svg: ReactNode; cls: string }[] = [
    {
      label: "Compartilhar no WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encTitle}%20${enc}`,
      cls: "hover:bg-[#25D366]/15 hover:text-[#1da851]",
      svg: (
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.13c-.24.68-1.42 1.32-1.95 1.36-.5.04-.5.4-3.16-.66-2.66-1.06-4.32-3.8-4.45-3.97-.13-.18-1.06-1.4-1.06-2.67s.66-1.9.9-2.16c.24-.26.53-.32.7-.32.18 0 .35 0 .5.01.16.01.38-.06.59.45.24.59.8 2.04.87 2.18.07.15.12.32.02.5-.1.18-.15.29-.3.45-.15.16-.31.36-.44.48-.15.15-.3.31-.13.6.18.29.78 1.29 1.68 2.09 1.16 1.03 2.13 1.35 2.42 1.5.29.15.46.13.63-.08.18-.21.73-.85.92-1.14.2-.29.39-.24.66-.15.27.1 1.7.8 1.99.95.29.15.49.22.56.34.07.13.07.72-.17 1.41Z" />
      ),
    },
    {
      label: "Compartilhar no Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc}`,
      cls: "hover:bg-[#1877F2]/15 hover:text-[#1877F2]",
      svg: (
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.76 8.43-4.92 8.43-9.94Z" />
      ),
    },
    {
      label: "Compartilhar no X",
      href: `https://twitter.com/intent/tweet?text=${encTitle}&url=${enc}`,
      cls: "hover:bg-foreground/10 hover:text-foreground",
      svg: (
        <path d="M18.9 2H22l-7.1 8.1L23 22h-6.6l-5.2-6.8L5.3 22H2.2l7.6-8.7L1.7 2h6.8l4.7 6.2L18.9 2Zm-1.2 18h1.8L7.4 3.9H5.5L17.7 20Z" />
      ),
    },
    {
      label: "Compartilhar no Telegram",
      href: `https://t.me/share/url?url=${enc}&text=${encTitle}`,
      cls: "hover:bg-[#229ED9]/15 hover:text-[#229ED9]",
      svg: (
        <path d="M21.94 4.3 18.7 19.6c-.24 1.08-.88 1.34-1.78.84l-4.92-3.63-2.37 2.28c-.26.26-.48.48-.98.48l.35-4.97 9.03-8.16c.4-.35-.08-.54-.6-.2L6.3 13.2l-4.8-1.5c-1.04-.33-1.06-1.04.22-1.55l18.78-7.24c.87-.32 1.63.2 1.35 1.4Z" />
      ),
    },
    {
      label: "Compartilhar por e-mail",
      href: `mailto:?subject=${encTitle}&body=${enc}`,
      cls: "hover:bg-primary/10 hover:text-primary",
      svg: null,
    },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard indisponível */
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-muted-foreground mr-1">Compartilhar:</span>
      {networks.map((n) => (
        <a
          key={n.label}
          href={n.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={n.label}
          title={n.label}
          className={`w-9 h-9 inline-flex items-center justify-center rounded-full border border-border text-muted-foreground transition-colors no-underline ${n.cls}`}
        >
          {n.svg ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              {n.svg}
            </svg>
          ) : (
            <Mail className="w-4 h-4" aria-hidden="true" />
          )}
        </a>
      ))}
      <button
        type="button"
        onClick={copy}
        aria-label="Copiar link"
        title={copied ? "Link copiado!" : "Copiar link"}
        className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" aria-hidden="true" /> : <Link2 className="w-4 h-4" aria-hidden="true" />}
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        aria-label="Imprimir"
        title="Imprimir"
        className="w-9 h-9 inline-flex items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
      >
        <Printer className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function DocumentFooter({
  url,
  fileUrl,
  exportUrl,
  shareTitle,
}: {
  url: string;
  fileUrl?: string | null;
  exportUrl?: string | null;
  shareTitle: string;
}) {
  // URL absoluta para QR / compartilhamento (origem só existe no cliente).
  const [fullUrl, setFullUrl] = useState(url);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setFullUrl(new URL(url, window.location.origin).toString());
    }
  }, [url]);

  return (
    <div className="mt-10 pt-6 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        {/* QR Code de validação */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-white p-2 rounded-lg border border-border">
            <QRCodeSVG value={fullUrl} size={84} fgColor="#141b47" bgColor="#ffffff" level="M" />
          </div>
          <p className="text-xs text-muted-foreground max-w-[9rem] leading-snug">
            Aponte a câmera para acessar esta matéria online.
          </p>
        </div>

        {/* Ações */}
        <div className="flex-1 flex flex-col gap-3 sm:items-end">
          {(fileUrl || exportUrl) && (
            <div className="flex flex-wrap gap-3">
              <a
                href={fileUrl || exportUrl!}
                {...(fileUrl ? { download: true } : { target: "_blank", rel: "noopener noreferrer" })}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md hover:bg-primary/90 transition-all no-underline"
              >
                <Download className="w-4 h-4" />
                Baixar PDF
              </a>
              {fileUrl && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-primary/25 text-primary text-sm font-semibold hover:border-primary/50 hover:bg-primary/5 transition-all no-underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visualizar
                </a>
              )}
            </div>
          )}
          <ShareBar url={fullUrl} title={shareTitle} />
        </div>
      </div>
    </div>
  );
}

export function OfficialDocument({ url, fileUrl, exportUrl, shareTitle, children }: OfficialDocumentProps) {
  const settings = useSiteSettings();
  const docTitle = useMemo(() => shareTitle, [shareTitle]);

  return (
    <article className="card-modern overflow-hidden" aria-label={`Documento oficial — ${docTitle}`} data-institution={settings.header_title || undefined}>
      <Letterhead />
      <div className="p-6 md:p-10">
        {children}
        <DocumentFooter url={url} fileUrl={fileUrl} exportUrl={exportUrl} shareTitle={shareTitle} />
      </div>
    </article>
  );
}
