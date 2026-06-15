import { Link } from "@inertiajs/react";
import { BookOpen, Download, Calendar, ArrowRight, Newspaper } from "lucide-react";
import { SectionHeading } from "~/components/SectionHeading";

interface Publicacao {
  id: number;
  titulo: string;
  data: string;
  tipo: string;
  arquivo: string | null;
}

interface GazetteEntry {
  id: number;
  editionNumber: string;
  publicationDate: string;
  description: string | null;
  fileUrl: string | null;
}

interface DiarioOficialSectionProps {
  publicacoes?: Publicacao[];
  latestGazette?: GazetteEntry | null;
  title?: string;
  subtitle?: string;
}

const formatDate = (value: string) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("pt-BR");
};

export const DiarioOficialSection = ({
  publicacoes = [],
  latestGazette = null,
  title = "Diário Oficial",
  subtitle,
}: DiarioOficialSectionProps) => {
  if (publicacoes.length === 0 && !latestGazette) return null;

  return (
    <section className="py-14 lg:py-20 px-4 bg-muted/40">
      <div className="container mx-auto max-w-4xl">
        <SectionHeading
          badge="Publicações Oficiais"
          title={title}
          subtitle={subtitle || "Fique sempre atualizado com as publicações e informações oficiais do município"}
        />

        {/* Card principal com cabeçalho navy (padrão do portal) */}
        <div data-reveal className="rounded-2xl overflow-hidden shadow-xl bg-card border border-border/60">
          <div className="bg-gradient-hero px-6 py-4 flex items-center justify-between text-primary-foreground">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5" />
              <h3 className="font-bold">Diário Oficial</h3>
            </div>
            <Link
              href="/publicacoes-oficiais"
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-primary-foreground no-underline transition-colors"
            >
              Ver publicações
            </Link>
          </div>

          <div className="divide-y divide-border/60">
            {publicacoes.slice(0, 8).map((pub) =>
              pub.arquivo ? (
                <a
                  key={pub.id}
                  href={pub.arquivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-6 py-3.5 no-underline hover:bg-muted/60 transition-colors group"
                >
                  <span className="text-sm font-medium text-muted-foreground shrink-0 w-24">{pub.data}</span>
                  <span className="text-sm text-foreground flex-1 truncate group-hover:text-primary transition-colors">
                    {pub.titulo}
                  </span>
                  {pub.tipo && (
                    <span className="hidden sm:inline text-[11px] text-muted-foreground shrink-0 group-hover:opacity-0 transition-opacity">
                      {pub.tipo}
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 shrink-0 opacity-0 -ml-4 group-hover:opacity-100 group-hover:text-primary group-hover:ml-0 transition-all" />
                </a>
              ) : (
                <div key={pub.id} className="flex items-center gap-4 px-6 py-3.5">
                  <span className="text-sm font-medium text-muted-foreground shrink-0 w-24">{pub.data}</span>
                  <span className="text-sm text-foreground flex-1 truncate">{pub.titulo}</span>
                  {pub.tipo && <span className="text-[11px] text-muted-foreground shrink-0">{pub.tipo}</span>}
                </div>
              )
            )}
          </div>
        </div>

        {/* Última edição */}
        {latestGazette && (
          <div data-reveal="zoom" className="mt-6 card-modern p-6 flex flex-col sm:flex-row items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-hero flex items-center justify-center shrink-0 shadow-lg">
              <Newspaper className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="font-bold text-foreground">Diário Oficial do Município</h4>
              <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
                <Calendar className="w-4 h-4" />
                Última edição: {latestGazette.editionNumber} — {formatDate(latestGazette.publicationDate)}
              </p>
            </div>
            {latestGazette.fileUrl ? (
              <a
                href={latestGazette.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold no-underline hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4" />
                Baixar última edição
              </a>
            ) : (
              <Link
                href="/diario-oficial"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold no-underline hover:opacity-90 transition-opacity"
              >
                Acessar Diário Oficial
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
