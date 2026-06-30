import { usePage } from "@inertiajs/react";
import { Wrench } from "lucide-react";
import { SeoHead } from "~/components/SeoHead";
import {
  DEFAULT_MAINTENANCE_MESSAGE,
  DEFAULT_MAINTENANCE_TITLE,
} from "~/lib/public-access";

interface Props {
  title?: string;
  message?: string;
  /** Sempre true quando renderizada pelo modo de manutenção (informativo). */
  isMaintenance?: boolean;
}

interface CamaraIdentity {
  nome?: string;
  nomeCurto?: string;
  uf?: string;
}

/**
 * Página de MANUTENÇÃO global (HTTP 503). Renderizada pelo
 * `public_access_middleware` quando o setting `maintenance_mode` está ligado e o
 * visitante NÃO está autenticado. É standalone (sem o chrome do site, já que todo
 * o público está fora do ar), mas mantém a identidade institucional da Câmara via
 * `props.camara` + `props.siteSettings`. Tokens dark-safe, responsiva.
 */
export default function Maintenance({
  title = DEFAULT_MAINTENANCE_TITLE,
  message = DEFAULT_MAINTENANCE_MESSAGE,
}: Props) {
  const props = usePage().props as {
    camara?: CamaraIdentity;
    siteSettings?: Record<string, string | null>;
  };

  const camaraNome = props.camara?.nome || "Câmara Municipal";
  const settings = props.siteSettings || {};
  const logo = settings.logo_url || null;
  const email = settings.footer_email || null;
  const phone = settings.footer_phone || null;

  return (
    <>
      <SeoHead title={`${title} - ${camaraNome}`} description={message} />
      <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-16 text-center text-foreground">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm md:p-10">
          {logo ? (
            <img
              src={logo}
              alt={camaraNome}
              className="mx-auto mb-6 h-16 w-auto object-contain"
            />
          ) : (
            <p className="mb-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {camaraNome}
            </p>
          )}

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Wrench className="h-8 w-8" aria-hidden="true" />
          </div>

          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            {message}
          </p>

          {(email || phone) && (
            <div className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Precisa falar com a Câmara?</p>
              <div className="mt-2 flex flex-col items-center gap-1">
                {phone && <span>{phone}</span>}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="text-primary no-underline hover:underline"
                  >
                    {email}
                  </a>
                )}
              </div>
            </div>
          )}

          <p className="mt-8 text-xs text-muted-foreground/70">{camaraNome}</p>
        </div>
      </main>
    </>
  );
}
