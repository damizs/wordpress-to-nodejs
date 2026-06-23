import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "~/components/SectionHeading";

export interface MesaMember {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
  party: string;
  role: string;
}

interface MesaDiretoraSectionProps {
  members?: MesaMember[];
  biennium?: string | null;
  title?: string;
  subtitle?: string;
}

/**
 * Seção institucional da Mesa Diretora (composição do biênio): Presidente,
 * Vice, Secretários — em grade de cartões com cargo em destaque. Distinta da
 * VereadoresSection (que lista todos os parlamentares).
 */
export const MesaDiretoraSection = ({
  members = [],
  biennium,
  title = "Mesa Diretora",
  subtitle,
}: MesaDiretoraSectionProps) => {
  if (members.length === 0) return null;

  return (
    <section className="section-block bg-secondary/20">
      <div className="container">
        <SectionHeading
          badge={biennium ? `Biênio ${biennium}` : "Composição"}
          title={title}
          subtitle={subtitle || "Parlamentares que conduzem os trabalhos legislativos no biênio atual."}
        />

        <ul
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          data-reveal
        >
          {members.map((m) => (
            <li key={m.id}>
              <Link href={m.slug ? `/vereadores/${m.slug}` : "/mesa-diretora"} className="group block no-underline">
                <article className="card-modern overflow-hidden">
                  <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                    <img
                      src={m.photo || "/images/placeholder-vereador.jpg"}
                      alt={`Foto de ${m.name}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-dark/80 to-transparent p-3">
                      <span className="inline-block rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy-dark">
                        {m.role}
                      </span>
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-2 text-sm font-bold leading-tight text-foreground group-hover:text-navy dark:group-hover:text-sky">
                      {m.name}
                    </h3>
                    {m.party && <p className="mt-0.5 text-xs text-muted-foreground">{m.party}</p>}
                  </div>
                </article>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 text-center">
          <Link
            href="/mesa-diretora"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-bold text-foreground no-underline shadow-sm transition-colors hover:border-navy/30 hover:bg-muted"
          >
            Conheça a Mesa Diretora
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};
