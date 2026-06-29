import { AlertTriangle, FileText, Gavel, Handshake, MessageSquare, Scale } from "lucide-react";
import { Link } from "@inertiajs/react";

const essentialLinks = [
  { label: "Transparência", href: "/transparencia", icon: Scale },
  { label: "Licitações", href: "/licitacoes", icon: Gavel },
  { label: "Contratos", href: "/contratos", icon: Handshake },
  { label: "Diário Oficial", href: "/diario-oficial", icon: FileText },
  { label: "Ouvidoria", href: "/ouvidoria", icon: MessageSquare },
];

export function ElectionModeNotice({ message }: { message?: string | null }) {
  return (
    <section className="rounded-xl border border-amber-400/40 bg-amber-50 p-5 text-amber-950 dark:border-amber-300/30 dark:bg-amber-950/30 dark:text-amber-100">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <h2 className="text-base font-bold">Conteúdo temporariamente indisponível</h2>
          <p className="mt-1 text-sm leading-relaxed">
            {message ||
              "Em atendimento à legislação eleitoral, este conteúdo institucional está temporariamente indisponível durante o período eleitoral. Permanecem acessíveis os serviços essenciais, atos oficiais, transparência pública, licitações, contratos, dados abertos e canais de atendimento ao cidadão."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {essentialLinks.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-background/80 px-3 py-2 text-xs font-semibold text-foreground no-underline transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
