import { Link } from "@inertiajs/react";
import { FileText, Download, Calendar, ArrowRight } from "lucide-react";

interface Publicacao {
  id: number;
  titulo: string;
  data: string;
  tipo: string;
  arquivo: string | null;
}

interface DiarioOficialSectionProps {
  publicacoes?: Publicacao[];
}

export const DiarioOficialSection = ({ publicacoes = [] }: DiarioOficialSectionProps) => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-14 animate-fade-in">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
            Publicações Oficiais
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            Diário Oficial
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Acesse as últimas publicações e atos oficiais da Câmara Municipal.
          </p>
        </div>

        {publicacoes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicacoes.slice(0, 6).map((pub, index) => (
              <div 
                key={pub.id}
                className="card-modern p-6 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-1 bg-gold/10 text-gold text-xs font-medium rounded mb-2">
                      {pub.tipo}
                    </span>
                    <h3 className="font-bold text-foreground mb-2 line-clamp-2">
                      {pub.titulo}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{pub.data}</span>
                    </div>
                  </div>
                </div>
                {pub.arquivo && (
                  <a 
                    href={pub.arquivo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 flex items-center justify-center gap-2 py-2 px-4 bg-primary/5 hover:bg-primary/10 text-primary rounded-lg transition-colors no-underline"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Baixar PDF</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma publicação disponível no momento.</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/publicacoes-oficiais"
            className="btn-modern inline-flex items-center gap-3 bg-gradient-to-r from-primary to-navy-light text-primary-foreground shadow-lg hover:shadow-xl hover:gap-4 no-underline"
          >
            Ver todas as publicações
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
