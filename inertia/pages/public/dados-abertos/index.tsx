import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import {
  Users,
  ScrollText,
  Gavel,
  FileText,
  Vote,
  CalendarDays,
  Database,
  Download,
  FileJson,
  FileSpreadsheet,
  type LucideIcon,
} from "lucide-react";

interface DatasetMeta {
  id: string;
  title: string;
  description: string;
  fields: string[];
}

interface Props {
  datasets: DatasetMeta[];
}

const DATASET_ICONS: Record<string, LucideIcon> = {
  vereadores: Users,
  materias: ScrollText,
  licitacoes: Gavel,
  publicacoes: FileText,
  votacoes: Vote,
  sessoes: CalendarDays,
};

export default function DadosAbertos({ datasets = [] }: Props) {
  return (
    <>
      <SeoHead
        title="Dados Abertos - Câmara Municipal de Sumé"
        description="Baixe os dados públicos da Câmara Municipal de Sumé em formato aberto (JSON e CSV): vereadores, matérias legislativas, licitações, publicações, votações e sessões."
        url="/dados-abertos"
      />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Dados Abertos" }]} />
        <PageHero
          badge="Transparência"
          title="Dados Abertos"
          subtitle="Acesse e reutilize os dados públicos da Câmara em formatos abertos e legíveis por máquina"
          centered
        />
        <main>
          <section className="py-10 lg:py-14">
            <div className="container">
              {/* Explicação */}
              <div className="max-w-3xl mx-auto text-center mb-10">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Em atendimento à Lei de Acesso à Informação (Lei nº 12.527/2011), a Câmara
                  disponibiliza seus dados em formatos abertos. Cada conjunto pode ser baixado em{" "}
                  <strong className="text-foreground">JSON</strong> (para sistemas e
                  desenvolvedores) ou <strong className="text-foreground">CSV</strong> (compatível
                  com Excel e LibreOffice). Os dados são atualizados automaticamente a partir do
                  conteúdo publicado neste portal.
                </p>
              </div>

              {/* Cards dos conjuntos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {datasets.map((dataset) => {
                  const Icon = DATASET_ICONS[dataset.id] ?? Database;
                  return (
                    <div key={dataset.id} className="card-modern p-6 flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="font-bold text-foreground">{dataset.title}</h2>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {dataset.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {dataset.fields.map((field) => (
                          <span
                            key={field}
                            className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-mono text-muted-foreground"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                      <div className="mt-auto flex gap-3">
                        <a
                          href={`/dados-abertos/${dataset.id}/json`}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity no-underline"
                        >
                          <FileJson className="w-4 h-4" />
                          JSON
                        </a>
                        <a
                          href={`/dados-abertos/${dataset.id}/csv`}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground text-sm font-semibold hover:bg-muted transition-colors no-underline"
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                          CSV
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Licença e regras de uso (PNTP 15.4) */}
              <div className="mt-10 grid gap-6 md:grid-cols-2">
                <div className="card-modern p-5">
                  <h2 className="font-bold text-foreground mb-2">Licença aberta</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Os conjuntos de dados deste portal são disponibilizados sob a licença{" "}
                    <strong className="text-foreground">Creative Commons Atribuição 4.0 Internacional (CC BY 4.0)</strong>.
                    Você pode copiar, redistribuir e adaptar os dados, desde que cite a fonte:{" "}
                    <strong className="text-foreground">Câmara Municipal de Sumé — PB</strong>.
                  </p>
                  <a
                    href="https://creativecommons.org/licenses/by/4.0/deed.pt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-sm font-semibold text-primary hover:underline"
                  >
                    Texto completo da licença CC BY 4.0
                  </a>
                </div>
                <div className="card-modern p-5 flex items-start gap-3">
                  <Download className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-bold text-foreground mb-2">Formato e reutilização</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Os arquivos CSV usam ponto e vírgula (;) como separador e codificação UTF-8 com
                      BOM, abrindo corretamente no Excel em português. JSON é indicado para integração
                      automatizada. Os dados refletem o conteúdo publicado neste portal e podem ser
                      atualizados sem aviso prévio conforme novas publicações oficiais.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
