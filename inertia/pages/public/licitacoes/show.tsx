import { Head, Link } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { ArrowLeft, Download, Gavel } from 'lucide-react'

const modalityLabels: Record<string, string> = {
  pregao: 'Pregão', tomada_precos: 'Tomada de Preços', concorrencia: 'Concorrência',
  convite: 'Convite', dispensa: 'Dispensa', inexigibilidade: 'Inexigibilidade',
}
const statusBadge: Record<string, string> = {
  aberta: 'bg-green-100 text-green-700', em_andamento: 'bg-blue-100 text-blue-700',
  encerrada: 'bg-gray-200 text-gray-600', deserta: 'bg-amber-100 text-amber-700',
  revogada: 'bg-red-100 text-red-600', suspensa: 'bg-yellow-100 text-yellow-700',
}

interface Props { licitacao: any }

export default function LicitacaoShow({ licitacao }: Props) {
  return (
    <PublicLayout>
      <Head title={`${licitacao.title} - Licitações - Câmara de Sumé`} />
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/licitacoes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Voltar para Licitações
          </Link>
          <article className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-navy/5 rounded-lg flex items-center justify-center"><Gavel className="w-5 h-5 text-navy" /></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{licitacao.title}</h1>
                {licitacao.number && <p className="text-sm text-gray-400">Nº {licitacao.number}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {licitacao.modality && <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{modalityLabels[licitacao.modality] || licitacao.modality}</span>}
              <span className={`text-sm px-3 py-1 rounded-full ${statusBadge[licitacao.status] || 'bg-gray-100 text-gray-600'}`}>
                {licitacao.status?.replace('_', ' ')}
              </span>
              {licitacao.year && <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{licitacao.year}</span>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
              {licitacao.opening_date && <div><p className="text-xs text-gray-400">Abertura</p><p className="text-sm font-medium text-gray-700">{licitacao.opening_date}</p></div>}
              {licitacao.closing_date && <div><p className="text-xs text-gray-400">Encerramento</p><p className="text-sm font-medium text-gray-700">{licitacao.closing_date}</p></div>}
              {licitacao.estimated_value && <div><p className="text-xs text-gray-400">Valor Estimado</p><p className="text-sm font-medium text-gray-700">R$ {Number(licitacao.estimated_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>}
            </div>
            {licitacao.object && (
              <div className="mb-6"><h2 className="font-semibold text-gray-800 mb-2">Objeto</h2>
                <p className="text-gray-700 leading-relaxed">{licitacao.object}</p></div>
            )}
            {licitacao.content && (
              <div className="mb-6"><h2 className="font-semibold text-gray-800 mb-2">Detalhes</h2>
                <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: licitacao.content }} /></div>
            )}
            {licitacao.file_url && (
              <a href={licitacao.file_url} target="_blank" rel="noopener"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-navy border border-navy/20 rounded-lg hover:bg-navy/5">
                <Download className="w-4 h-4" /> Baixar Edital (PDF)
              </a>
            )}
          </article>
        </div>
      </section>
    </PublicLayout>
  )
}
