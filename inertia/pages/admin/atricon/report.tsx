import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, Printer, FileDown } from 'lucide-react'
import { Badge, Button, ButtonLink, type BadgeTone } from '~/components/admin/ui'

interface Pending {
  code: string
  dimension: string
  title: string
  classification: 'essencial' | 'obrigatoria' | 'recomendada'
  status: 'pendente' | 'parcial'
  hint: string
  notes: string | null
}

interface Props {
  pendings: Pending[]
  scores: {
    index: number
    level: string
    allEssentialsMet: boolean
    totals: { criteria: number; met: number; external: number; partial: number; pending: number; notApplicable: number }
  }
  fortnight: { label: string; start: string; end: string }
  generatedAt: string
  atriconLogoUrl?: string | null
}

const CLASS_LABEL = { essencial: 'ESSENCIAL', obrigatoria: 'Obrigatória', recomendada: 'Recomendada' }
const CLASS_TONE: Record<Pending['classification'], BadgeTone> = {
  essencial: 'gold',
  obrigatoria: 'navy',
  recomendada: 'neutral',
}

export default function AtriconReport({ pendings, scores, fortnight, generatedAt, atriconLogoUrl }: Props) {
  const byDimension = pendings.reduce<Record<string, Pending[]>>((acc, p) => {
    ;(acc[p.dimension] ||= []).push(p)
    return acc
  }, {})

  const essentialsPending = pendings.filter((p) => p.classification === 'essencial')

  return (
    <div className="min-h-screen bg-muted print:bg-white">
      <Head title="Relatório Quinzenal PNTP - Painel" />

      {/* Barra de ações (não imprime) */}
      <div className="print:hidden sticky top-0 z-10 bg-card border-b border-border px-6 py-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Link
          href="/painel/atricon"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy no-underline"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Radar
        </Link>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <ButtonLink
            href="/painel/atricon/relatorio?format=csv"
            variant="secondary"
          >
            <FileDown className="w-4 h-4" /> CSV
          </ButtonLink>
          <Button type="button" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Imprimir / PDF
          </Button>
        </div>
      </div>

      {/* Documento */}
      <div className="max-w-4xl mx-auto bg-card my-6 print:my-0 rounded-xl print:rounded-none shadow-sm print:shadow-none p-10 print:p-0">
        <header className="border-b-2 border-navy pb-4 mb-6 flex items-start gap-4">
          {atriconLogoUrl && (
            <img src={atriconLogoUrl} alt="ATRICON" className="h-14 w-auto object-contain shrink-0 bg-white rounded p-1" />
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold text-foreground">Relatório Quinzenal de Pendências — PNTP/ATRICON 2026</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {fortnight.label} ({fortnight.start} a {fortnight.end}) · Gerado em {generatedAt}
            </p>
          </div>
        </header>

        {/* Resumo executivo */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="rounded-lg border border-border p-3 text-center">
            <p className="text-2xl font-extrabold text-foreground">{scores.index}%</p>
            <p className="text-[11px] text-muted-foreground">Índice estimado · {scores.level}</p>
          </div>
          <div className="rounded-lg border border-border p-3 text-center">
            <p className="text-2xl font-extrabold text-emerald-600">{scores.totals.met + scores.totals.external}</p>
            <p className="text-[11px] text-muted-foreground">Critérios atendidos</p>
          </div>
          <div className="rounded-lg border border-border p-3 text-center">
            <p className="text-2xl font-extrabold text-amber-600">{scores.totals.partial}</p>
            <p className="text-[11px] text-muted-foreground">Parciais</p>
          </div>
          <div className="rounded-lg border border-border p-3 text-center">
            <p className="text-2xl font-extrabold text-destructive">{scores.totals.pending}</p>
            <p className="text-[11px] text-muted-foreground">Pendentes</p>
          </div>
        </section>

        {/* Alerta de essenciais */}
        {essentialsPending.length > 0 && (
          <section className="mb-8 rounded-lg border-2 border-destructive/30 bg-destructive/5 p-4">
            <h2 className="text-sm font-bold text-destructive uppercase">⚠ Prioridade máxima — critérios essenciais (LRF)</h2>
            <p className="text-xs text-foreground/80 mt-1 mb-2">
              Sem 100% dos essenciais a Câmara não recebe selo (Prata, Ouro ou Diamante) e fica sujeita às vedações
              dos arts. 48 e 48-A da LC 101/2000.
            </p>
            <ul className="space-y-1">
              {essentialsPending.map((p) => (
                <li key={p.code} className="text-sm text-foreground">
                  <strong>{p.code}</strong> — {p.title}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Pendências por dimensão */}
        {pendings.length === 0 ? (
          <p className="text-center text-emerald-600 font-semibold py-12">
            Nenhuma pendência registrada. Matriz 100% avaliada como atendida. 🎉
          </p>
        ) : (
          Object.entries(byDimension).map(([dimension, items]) => (
            <section key={dimension} className="mb-6 break-inside-avoid">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wide border-b border-border pb-1 mb-3">
                {dimension} <span className="text-muted-foreground font-medium normal-case">({items.length} pendências)</span>
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] text-muted-foreground uppercase">
                    <th className="py-1 pr-2 w-14">Critério</th>
                    <th className="py-1 pr-2">Exigência / Como atender</th>
                    <th className="py-1 pr-2 w-28">Classificação</th>
                    <th className="py-1 w-20">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {items.map((p) => (
                    <tr key={p.code} className="align-top">
                      <td className="py-2 pr-2 font-bold text-muted-foreground">{p.code}</td>
                      <td className="py-2 pr-2">
                        <p className="font-medium text-foreground">{p.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.hint}</p>
                        {p.notes && <p className="text-xs text-amber-700 mt-0.5">Obs.: {p.notes}</p>}
                      </td>
                      <td className="py-2 pr-2">
                        <Badge tone={CLASS_TONE[p.classification]} className="text-[11px] px-2 py-0.5">
                          {CLASS_LABEL[p.classification]}
                        </Badge>
                      </td>
                      <td className="py-2">
                        <Badge tone={p.status === 'pendente' ? 'danger' : 'warning'} className="text-[11px] px-2 py-0.5">
                          {p.status === 'pendente' ? 'Pendente' : 'Parcial'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))
        )}

        <footer className="mt-10 pt-4 border-t border-border text-[11px] text-muted-foreground">
          <p>
            Relatório gerado automaticamente pelo Radar ATRICON do portal. Critérios de e-SIC e Ouvidoria são
            atendidos por sistema externo e não constam como pendências. Encaminhe este documento aos setores
            responsáveis para providências antes do ciclo de avaliação do PNTP.
          </p>
        </footer>
      </div>
    </div>
  )
}
