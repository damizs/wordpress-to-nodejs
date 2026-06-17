import { Link } from "@inertiajs/react";
import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { Download, Calendar, Coins, UserCheck, Gavel, FileSignature, Building2 } from "lucide-react";
import { formatDocumentDate } from "~/components/DocumentActions";

interface Contract {
  slug: string;
  number: string | null;
  year: number | null;
  object: string | null;
  modality: string | null;
  legal_basis: string | null;
  contractor_name: string | null;
  contractor_document: string | null;
  value: number | null;
  sign_date: string | null;
  start_date: string | null;
  end_date: string | null;
  term: string | null;
  status: string;
  manager_name: string | null;
  manager_role: string | null;
  fiscal_name: string | null;
  fiscal_role: string | null;
  fiscal_act: string | null;
  file_url: string | null;
  content: string | null;
  notes: string | null;
  licitacao: { slug: string; title: string; number: string | null } | null;
}
interface Props { contract: Contract; }

const STATUS_MAP: Record<string, { label: string; classes: string }> = {
  vigente: { label: "Vigente", classes: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  encerrado: { label: "Encerrado", classes: "bg-muted text-muted-foreground" },
  rescindido: { label: "Rescindido", classes: "bg-destructive/10 text-destructive" },
  suspenso: { label: "Suspenso", classes: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
};

const fmtMoney = (v: number | null) =>
  v === null || v === undefined
    ? "—"
    : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v));

function Row({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="text-sm text-foreground mt-0.5">{children}</dd>
      </div>
    </div>
  );
}

export default function ContractShow({ contract }: Props) {
  const status = STATUS_MAP[contract.status] || { label: contract.status, classes: "bg-muted text-muted-foreground" };
  const heading = contract.number ? `Contrato nº ${contract.number}${contract.year ? `/${contract.year}` : ""}` : "Contrato";

  return (
    <>
      <SeoHead title={`${heading} - Câmara Municipal de Sumé`} description={contract.object || heading} url={`/contratos/${contract.slug}`} />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar /><Header />
        <Breadcrumb items={[{ label: "Contratos", href: "/contratos" }, { label: heading }]} />
        <PageHero badge="Transparência" title={heading} subtitle={contract.contractor_name || contract.object || undefined} centered />
        <main id="conteudo">
          <section className="py-10 lg:py-14">
            <div className="container">
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.classes}`}>{status.label}</span>
                {contract.file_url && (
                  <a
                    href={contract.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-navy text-primary-foreground text-sm font-medium hover:bg-navy-light transition-colors no-underline sm:ml-auto w-full sm:w-auto"
                  >
                    <Download className="w-4 h-4" /> Baixar contrato (PDF)
                  </a>
                )}
              </div>

              <div className="card-modern p-6 sm:p-8">
                <dl>
                  {contract.object && (
                    <Row icon={FileSignature} label="Objeto">{contract.object}</Row>
                  )}
                  {(contract.modality || contract.legal_basis) && (
                    <Row icon={Gavel} label="Modalidade">
                      {contract.modality || "—"}
                      {contract.legal_basis && (
                        <span className="text-muted-foreground"> · {contract.legal_basis}</span>
                      )}
                    </Row>
                  )}
                  <Row icon={Building2} label="Contratado">
                    {contract.contractor_name || "—"}
                    {contract.contractor_document && (
                      <span className="text-muted-foreground"> · {contract.contractor_document}</span>
                    )}
                  </Row>
                  <Row icon={Coins} label="Valor global">{fmtMoney(contract.value)}</Row>
                  <Row icon={Calendar} label="Vigência">
                    {contract.start_date || contract.end_date
                      ? `${formatDocumentDate(contract.start_date)}${contract.end_date ? ` a ${formatDocumentDate(contract.end_date)}` : ""}`
                      : contract.term || "—"}
                    {contract.sign_date && (
                      <span className="text-muted-foreground"> · assinado em {formatDocumentDate(contract.sign_date)}</span>
                    )}
                  </Row>
                  {(contract.manager_name || contract.manager_role) && (
                    <Row icon={UserCheck} label="Gestor do contrato">
                      {contract.manager_name || "—"}
                      {contract.manager_role && (
                        <span className="text-muted-foreground"> · {contract.manager_role}</span>
                      )}
                    </Row>
                  )}
                  <Row icon={UserCheck} label="Fiscal do contrato">
                    {contract.fiscal_name || "—"}
                    {contract.fiscal_role && (
                      <span className="text-muted-foreground"> · {contract.fiscal_role}</span>
                    )}
                    {contract.fiscal_act && (
                      <span className="text-muted-foreground"> · {contract.fiscal_act}</span>
                    )}
                  </Row>
                  {contract.licitacao && (
                    <Row icon={Gavel} label="Licitação de origem">
                      <Link href={`/licitacoes/${contract.licitacao.slug}`} className="text-navy dark:text-sky hover:underline">
                        {contract.licitacao.number ? `Nº ${contract.licitacao.number} — ` : ""}
                        {contract.licitacao.title}
                      </Link>
                    </Row>
                  )}
                </dl>

                {(contract.content || contract.notes) && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h2 className="text-sm font-semibold text-foreground mb-2">Observações / aditivos</h2>
                    <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                      {contract.content || contract.notes}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <Link href="/contratos" className="text-sm text-navy dark:text-sky hover:underline">
                  ← Voltar para todos os contratos
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
