import { FileText, Download, Calendar, ArrowRight, Newspaper } from "lucide-react";
import { Link } from "@inertiajs/react";

interface Gazette {
  id: number;
  title: string;
  edition_number?: string;
  publication_date?: string;
  file_url?: string;
}

interface DiarioOficialSectionProps {
  latestGazette?: Gazette | null;
  title?: string | null;
  subtitle?: string | null;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
};

export const DiarioOficialSection = ({ latestGazette, title, subtitle }: DiarioOficialSectionProps) => {
  return (
    <section className="py-16 px-4 bg-gradient-navy text-primary-foreground relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="animate-fade-in">
            <span className="inline-block px-4 py-1.5 bg-gold/20 text-gold rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
              Publicação Oficial
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              {title || 'Diário Oficial'}
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg">
              {subtitle || 'Acesse as publicações oficiais da Câmara Municipal de Sumé. Leis, decretos, atos normativos e muito mais.'}
            </p>

            {latestGazette ? (
              <div className="glass rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <Newspaper className="w-7 h-7 text-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">{latestGazette.title}</h3>
                    <div className="flex items-center gap-3 text-sm text-primary-foreground/70 mb-3">
                      {latestGazette.edition_number && (
                        <span>Edição {latestGazette.edition_number}</span>
                      )}
                      {latestGazette.publication_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(latestGazette.publication_date)}
                        </span>
                      )}
                    </div>
                    {latestGazette.file_url && (
                      <a
                        href={latestGazette.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gold text-navy-dark rounded-lg text-sm font-medium hover:bg-gold-light transition-colors no-underline"
                      >
                        <Download className="w-4 h-4" /> Baixar PDF
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-6 mb-8 text-center">
                <Newspaper className="w-12 h-12 text-primary-foreground/30 mx-auto mb-3" />
                <p className="text-primary-foreground/60">Nenhuma publicação recente disponível</p>
              </div>
            )}

            <Link
              href="/publicacoes-oficiais"
              className="btn-modern inline-flex items-center gap-3 bg-gold text-navy-dark shadow-lg hover:shadow-glow no-underline"
            >
              Ver todas as publicações
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Decorative illustration */}
          <div className="hidden lg:flex items-center justify-center animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-gold/10 rounded-3xl blur-2xl animate-pulse-glow" />
              <div className="relative glass rounded-3xl p-8 border border-primary-foreground/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-gold/20 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gold" />
                  </div>
                  <div>
                    <div className="h-3 w-32 bg-primary-foreground/20 rounded mb-2" />
                    <div className="h-2 w-24 bg-primary-foreground/10 rounded" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-primary-foreground/10 rounded" />
                  <div className="h-2 w-4/5 bg-primary-foreground/10 rounded" />
                  <div className="h-2 w-3/4 bg-primary-foreground/10 rounded" />
                </div>
                <div className="mt-6 flex gap-3">
                  <div className="h-8 w-20 bg-gold/30 rounded-lg" />
                  <div className="h-8 w-20 bg-primary-foreground/10 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
