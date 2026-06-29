import { Link } from "@inertiajs/react";
import { FileX2, ArrowRight } from "lucide-react";
import { PageLayout } from "~/components/PageLayout";
import { DEFAULT_PUBLIC_UNAVAILABLE_MESSAGE } from "~/lib/public-access";

interface Props {
  title?: string;
  message?: string;
  path?: string;
}

const ESSENTIAL_LINKS = [
  { href: "/transparencia", label: "Transparência" },
  { href: "/licitacoes", label: "Licitações" },
  { href: "/contratos", label: "Contratos" },
  { href: "/diario-oficial", label: "Diário Oficial" },
  { href: "/ouvidoria", label: "Ouvidoria" },
];

export default function PublicUnavailable({
  title = "Conteúdo temporariamente indisponível",
  message = DEFAULT_PUBLIC_UNAVAILABLE_MESSAGE,
  path,
}: Props) {
  return (
    <PageLayout
      seo={{
        title: `${title} - Câmara Municipal de Sumé`,
        description: message,
        url: path || undefined,
      }}
      breadcrumb={[{ label: title }]}
      hero={{
        badge: "Acesso público",
        title,
        subtitle: "Conteúdo retirado temporariamente do site público.",
        centered: true,
      }}
    >
      <div className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-6 md:p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FileX2 className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="text-base leading-relaxed text-foreground/85">{message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {ESSENTIAL_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground no-underline transition-colors hover:border-primary/40 hover:text-primary"
            >
              {item.label}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
