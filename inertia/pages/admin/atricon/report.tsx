import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, Printer, FileDown } from 'lucide-react'

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
}

const CLASS_LABEL = { essencial: 'ESSENCIAL', obrigatoria: 'Obrigatória', recomendada: 'Recomendada' }
const CLASS_STYLE = {
  essencial: 'bg-purple-100 text-purple-800 font-bold',
  obrigatoria: 'bg-blue-50 text-blue-700',
  recomendada: 'bg-gray-100 text-gray-600',
}

export default function AtriconReport({ pendings, scores, fortnight, generatedAt }: Props) {
  const byDimension = pendings.reduce<Record<string, Pending[]>>((acc, p) => {
    ;(acc[p.dimension] ||= []).push(p)
    return acc
  }, {})

  const essentialsPending = pendings.filter((p) => p.classification === 'essencial')

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      <Head title="Relatório Quinzenal PNTP - Painel" />

      {/* Barra de ações (não imprime) */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
        <Link href="/painel/atricon" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-navy no-underline">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Radar
        </Link>
        <div className="ml-auto flex gap-2">
          <a
            href="/painel/atricon/relatorio?format=csv"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 no-underline"
          >
            <FileDown className="w-4 h-4" /> CSV
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy-dark"
          >
            <Printer className="w-4 h-4" /> Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Documento */}
      <div className="max-w-4xl mx-auto bg-white my-6 print:my-0 rounded-xl print:rounded-none shadow-sm print:shadow-none p-10 print:p-0">
        <header className="border-b-2 border-navy pb-4 mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Relatório Quinzenal de Pendências — PNTP/ATRICON 2026</h1>
          <p className="text-sm text-gray-500 mt-1">
            {fortnight.label} ({fortnight.start} a {fortnight.end}) · Gerado em {generatedAt}
          </p>
        </header>

        {/* Resumo executivo */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="rounded-lg border border-gray-200 p-3 text-center">
            <p className="text-2xl font-extrabold text-gray-800">{scores.index}%</p>
            <p className="text-[11px] text-gray-500">Índice estimado · {scores.level}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3 text-center">
            <p className="text-2xl font-extrabold text-emerald-600">{scores.totals.met + scores.totals.external}</p>
            <p className="text-[11px] text-gray-500">Critérios atendidos</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3 text-center">
            <p className="text-2xl font-extrabold text-amber-600">{scores.totals.partial}</p>
            <p className="text-[11px] text-gray-500">Parciais</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-3 text-center">
            <p className="text-2xl font-extrabold text-rose-600">{scores.totals.pending}</p>
            <p className="text-[11px] text-gray-500">Pendentes</p>
          </div>
        </section>

        {/* Alerta de essenciais */}
        {essentialsPending.length > 0 && (
          <section className="mb-8 rounded-lg border-2 border-purple-300 bg-purple-50 p-4">
            <h2 className="text-sm font-bold text-purple-900 uppercase">⚠ Prioridade máxima — critérios essenciais (LRF)</h2>
            <p className="text-xs text-purple-800 mt-1 mb-2">
              Sem 100% dos essenciais a Câmara não recebe selo (Prata, Ouro ou Diamante) e fica sujeita às vedações
              dos arts. 48 e 48-A da LC 101/2000.
            </p>
            <ul className="space-y-1">
              {essentialsPending.map((p) => (
                <li key={p.code} className="text-sm text-purple-900">
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
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-200 pb-1 mb-3">
                {dimension} <span className="text-gray-400 font-medium normal-case">({items.length} pendências)</span>
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] text-gray-400 uppercase">
                    <th className="py-1 pr-2 w-14">Critério</th>
                    <th className="py-1 pr-2">Exigência / Como atender</th>
                    <th className="py-1 pr-2 w-28">Classificação</th>
                    <th className="py-1 w-20">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((p) => (
                    <tr key={p.code} className="align-top">
                      <td className="py-2 pr-2 font-bold text-gray-500">{p.code}</td>
                      <td className="py-2 pr-2">
                        <p className="font-medium text-gray-800">{p.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{p.hint}</p>
                        {p.notes && <p className="text-xs text-amber-700 mt-0.5">Obs.: {p.notes}</p>}
                      </td>
                      <td className="py-2 pr-2">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${CLASS_STYLE[p.classification]}`}>
                          {CLASS_LABEL[p.classification]}
                        </span>
                      </td>
                      <td className="py-2">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${p.status === 'pendente' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                          {p.status === 'pendente' ? 'Pendente' : 'Parcial'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))
        )}

        <footer className="mt-10 pt-4 border-t border-gray-200 text-[11px] text-gray-400">
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
