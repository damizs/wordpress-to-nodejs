import { Link } from "@inertiajs/react";
import { PageLayout } from "~/components/PageLayout";
import { Calendar, ArrowLeft } from "lucide-react";
import { formatDocumentDate } from "~/components/DocumentActions";
import { OfficialDocument } from "~/components/OfficialDocument";
import { RichContent } from "~/components/RichContent";

interface Props { ata: { id: number; title: string; slug: string; date: string; content?: string; file_url?: string; }; }

export default function AtaShow({ ata }: Props) {
  const dateLabel = formatDocumentDate(ata.date, true);
  const year = String(ata.date || "").slice(0, 4);

  return (
    <PageLayout
      seo={{ title: ata.title, url: `/atas/${ata.slug}` }}
      breadcrumb={[{ label: "Atas das Sessões", href: "/atas" }, { label: ata.title }]}
      width="reading"
    >
      <Link href="/atas" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6 no-underline">
        <ArrowLeft className="w-4 h-4" />Voltar para Atas das Sessões
      </Link>
      <OfficialDocument url={`/atas/${ata.slug}`} fileUrl={ata.file_url} shareTitle={ata.title}>
                  {/* Cabeçalho do documento */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-gold/15 text-navy-dark dark:text-gold rounded-full text-xs font-semibold uppercase tracking-wide">Ata de Sessão</span>
                    {year && <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">{year}</span>}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">{ata.title}</h1>
                  {dateLabel && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                      <Calendar className="w-4 h-4 text-primary" />Sessão realizada em {dateLabel}
                    </div>
                  )}

      {ata.content && (
        <RichContent html={ata.content} />
      )}
      </OfficialDocument>
    </PageLayout>
  );
}
