import { Head, useForm, usePage } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { Send, BarChart3, FileText, X, Download, Info, ChevronRight, Angry, Frown, Meh, Smile, Laugh, ClipboardCheck } from 'lucide-react'
import { useState, useEffect } from 'react'

interface MonthStat {
  month: number
  name: string
  responses: number
  average: number
}

interface Props {
  years: number[]
  currentYear: number
  monthlyStats: MonthStat[]
  totals: { total: number; average: number }
}

const ratingIcons = [
  { value: 1, Icon: Angry, label: 'Muito Insatisfeito', color: '#e74c3c' },
  { value: 2, Icon: Frown, label: 'Insatisfeito', color: '#e67e22' },
  { value: 3, Icon: Meh, label: 'Neutro', color: '#95a5a6' },
  { value: 4, Icon: Smile, label: 'Satisfeito', color: '#27ae60' },
  { value: 5, Icon: Laugh, label: 'Muito Satisfeito', color: '#2ecc71' },
]

const questions = [
  'Como você avalia a atuação da Câmara Municipal na fiscalização do Poder Executivo?',
  'Qual seu nível de satisfação com a transparência das atividades da Câmara Municipal?',
  'Como você avalia o trabalho dos vereadores na proposição de leis e projetos em benefício da população?',
  'Qual seu nível de satisfação com as informações disponíveis no site da Câmara Municipal?',
  'Ao ser atendido(a) na Câmara Municipal, o(a) funcionário(a) demonstra interesse em resolver seu problema?',
]

function EmojiRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-2">
      {ratingIcons.map((e) => (
        <button key={e.value} type="button" onClick={() => onChange(e.value)}
          className={`w-10 h-10 rounded-full transition-all duration-200 flex items-center justify-center
            ${value === e.value ? 'scale-125 ring-2 ring-offset-2' : 'opacity-40 hover:opacity-80'}
          `}
          style={value === e.value ? { color: e.color, ringColor: e.color } : { color: '#999' }}
          title={e.label}
        >
          <e.Icon className="w-7 h-7" />
        </button>
      ))}
    </div>
  )
}

function ReportModal({ year, onClose }: { year: number; onClose: () => void }) {
  const [data, setData] = useState<{ monthlyStats: MonthStat[]; totals: { total: number; average: number } } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/pesquisa-de-satisfacao/relatorio?year=${year}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [year])

  const maxResponses = data ? Math.max(...data.monthlyStats.map((m) => m.responses), 1) : 1

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              🌐 Relatório {year}
            </h2>
            <p className="text-sm text-gray-500">Câmara Municipal de Sumé - PB</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">Carregando...</div>
        ) : data && (
          <div className="p-6 space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-gray-800">{data.totals.total}</div>
                <div className="text-sm text-gray-500 mt-1">Total de Respostas</div>
              </div>
              <div className="border rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-gray-800">{data.totals.average || '-'}</div>
                <div className="text-sm text-gray-500 mt-1">Média Geral</div>
              </div>
            </div>

            {/* Monthly table */}
            <div>
              <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5" /> Respostas por Mês
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-600">Mês</th>
                    <th className="text-left p-3 font-medium text-gray-600">Respostas</th>
                    <th className="text-left p-3 font-medium text-gray-600">Média</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthlyStats.map((m) => (
                    <tr key={m.month} className="border-t">
                      <td className="p-3">{m.name}</td>
                      <td className="p-3">{m.responses}</td>
                      <td className="p-3">{m.responses > 0 ? m.average : '-'}</td>
                    </tr>
                  ))}
                  <tr className="border-t bg-gray-50 font-semibold">
                    <td className="p-3">Total</td>
                    <td className="p-3">{data.totals.total}</td>
                    <td className="p-3">{data.totals.average || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Simple chart */}
            <div>
              <h3 className="font-semibold text-gray-700 text-center mb-4">
                Evolução das Avaliações - {year}
              </h3>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-2">
                <span className="w-4 h-3 bg-green-600 inline-block rounded-sm"></span> Avaliações
              </div>
              <div className="relative h-48 border-l border-b border-gray-200 ml-8">
                <svg viewBox="0 0 480 192" className="w-full h-full" preserveAspectRatio="none">
                  <polyline
                    fill="none" stroke="#27ae60" strokeWidth="2"
                    points={data.monthlyStats.map((m, i) => `${i * (480 / 11)},${192 - (m.responses / maxResponses) * 180}`).join(' ')}
                  />
                  {data.monthlyStats.map((m, i) => (
                    <circle key={i} cx={i * (480 / 11)} cy={192 - (m.responses / maxResponses) * 180} r="4" fill="#27ae60" />
                  ))}
                </svg>
                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-gray-400">
                  {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Export buttons */}
            <div className="pt-4">
              <h3 className="text-sm text-gray-500 flex items-center gap-2 mb-3">
                <Download className="w-4 h-4" /> Exportar Relatório
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-red-400 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm">
                  📄 Baixar PDF
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-green-500 text-green-700 rounded-lg hover:bg-green-50 font-medium text-sm">
                  <BarChart3 className="w-4 h-4" /> Baixar CSV
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PesquisaSatisfacaoIndex({ years, currentYear, monthlyStats, totals }: Props) {
  const { flash } = usePage().props as any
  const [reportYear, setReportYear] = useState<number | null>(null)
  const [ratings, setRatings] = useState<Record<string, number>>({})

  const { data, setData, post, processing, reset } = useForm({
    cpf: '',
    rating_atendimento: 0,
    rating_transparencia: 0,
    rating_legislativo: 0,
    rating_infraestrutura: 0,
    rating_geral: 0,
    suggestions: '',
  })

  function formatCPF(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  function setRating(field: string, value: number) {
    setRatings((prev) => ({ ...prev, [field]: value }))
    setData(field as any, value)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Calculate overall from average
    const vals = [data.rating_atendimento, data.rating_transparencia, data.rating_legislativo, data.rating_infraestrutura, data.rating_geral].filter((v) => v > 0)
    if (vals.length === 0) return
    post('/pesquisa-de-satisfacao', { onSuccess: () => { reset(); setRatings({}) } })
  }

  const allRated = data.rating_atendimento > 0 && data.rating_transparencia > 0 &&
    data.rating_legislativo > 0 && data.rating_infraestrutura > 0 && data.rating_geral > 0

  return (
    <PublicLayout>
      <Head title="Pesquisa de Satisfação - Câmara de Sumé" />

      {/* Breadcrumb */}
      <div className="bg-gray-100 py-3 border-b">
        <div className="max-w-6xl mx-auto px-4 text-sm text-gray-500 flex items-center gap-2">
          <a href="/" className="hover:text-navy">Início</a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700">Pesquisa de Satisfação</span>
        </div>
      </div>

      {/* Hero banner */}
      <div className="bg-gradient-hero text-white py-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <ClipboardCheck className="w-8 h-8" />
          <h1 className="text-3xl md:text-4xl font-bold">Pesquisa de Satisfação</h1>
        </div>
        <p className="text-white/80">Avaliação Contínua dos Serviços Prestados pela Câmara Municipal</p>
      </div>

      <section className="py-10 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="flex-1">
              {flash?.success && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-center font-medium">
                  {flash.success}
                </div>
              )}
              {flash?.error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center font-medium">
                  {flash.error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-2">
                  Avaliação Contínua - Câmara Municipal
                </h2>
                <p className="text-gray-500 text-center mb-8 max-w-xl mx-auto">
                  Prezado cidadão, para melhor atender a sua demanda e aprimorar os serviços prestados,
                  gostaríamos que respondesse algumas perguntas para medir sua satisfação.
                </p>

                {/* CPF */}
                <div className="bg-white rounded-lg border p-6 mb-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div>
                      <label className="block text-sm font-bold text-blue-700 mb-2">Informe seu CPF:</label>
                      <input
                        type="text"
                        value={data.cpf}
                        onChange={(e) => setData('cpf', formatCPF(e.target.value))}
                        placeholder="000.000.000-00"
                        className="w-64 px-4 py-3 border-2 border-gray-200 rounded-lg text-lg font-mono tracking-wider focus:border-navy focus:ring-0 outline-none"
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-bold mb-1">O CPF é necessário para limitar a votação mensal por pessoa.</p>
                      <p>Os dados informados nesta pesquisa estarão seguros de acordo com a Lei
                        Geral de Proteção de Dados - LGPD. O cidadão poderá votar, se desejar, todos
                        os meses, caso haja mudança na qualidade do serviço prestado/oferecido.</p>
                    </div>
                  </div>
                </div>

                {/* Rating legend */}
                <div className="bg-white rounded-lg border p-4 mb-6">
                  <div className="flex items-center justify-center gap-6 flex-wrap">
                    {ratingIcons.map((e) => (
                      <div key={e.value} className="flex items-center gap-2 text-sm text-gray-600">
                        <e.Icon className="w-5 h-5" style={{ color: e.color }} />
                        <span>{e.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Questions */}
                <div className="bg-white rounded-lg border divide-y">
                  {questions.map((q, i) => {
                    const fields = ['rating_atendimento', 'rating_transparencia', 'rating_legislativo', 'rating_infraestrutura', 'rating_geral']
                    const field = fields[i]
                    return (
                      <div key={i} className="flex items-center justify-between p-5 gap-4">
                        <p className="text-sm text-gray-700 flex-1">{q}</p>
                        <EmojiRating value={ratings[field] || 0} onChange={(v) => setRating(field, v)} />
                      </div>
                    )
                  })}
                </div>

                {/* Suggestions */}
                <div className="mt-6">
                  <h3 className="font-bold text-gray-700 mb-3">
                    Você daria sugestões para melhorar o atendimento aos usuários dos serviços? Se sim, quais?
                  </h3>
                  <textarea
                    value={data.suggestions}
                    onChange={(e) => setData('suggestions', e.target.value)}
                    rows={5}
                    placeholder="Digite sua sugestão (opcional)"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm focus:border-navy focus:ring-0 outline-none resize-y"
                  />
                </div>

                {/* LGPD disclaimer */}
                <div className="mt-6 border-l-4 border-blue-400 bg-blue-50 p-4 text-sm text-gray-600">
                  <p><strong className="text-blue-700">ℹ</strong> Prezado(a), esta avaliação não será analisada como manifestação de Ouvidoria.
                    Servirá apenas para revisarmos e refletirmos sobre as informações disponíveis nesta página.
                    Esclarecemos que os dados fornecidos acima serão tratados com respeito à sua privacidade,
                    seguindo a LGPD - Lei Geral de Proteção de Dados 13.709/2018.</p>
                </div>

                {/* Submit */}
                <div className="text-center mt-8">
                  <button
                    type="submit"
                    disabled={processing || !allRated}
                    className="inline-flex items-center gap-2 px-8 py-3 border-2 border-red-400 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" /> Enviar Pesquisa
                  </button>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-lg border p-6 sticky top-4">
                <h3 className="text-lg font-bold text-gray-800 text-center flex items-center justify-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5" /> Relatórios
                </h3>

                {/* Current year */}
                <button
                  onClick={() => setReportYear(currentYear)}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 mb-4"
                >
                  <FileText className="w-4 h-4" /> Relatório ano {currentYear}
                </button>

                {/* Previous years */}
                {years.filter((y) => y !== currentYear).length > 0 && (
                  <>
                    <p className="text-sm text-gray-500 text-center mb-3">Relatórios anteriores</p>
                    <div className="space-y-2">
                      {years.filter((y) => y !== currentYear).map((y) => (
                        <button
                          key={y}
                          onClick={() => setReportYear(y)}
                          className="w-full px-4 py-2.5 border-2 border-red-400 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                        >
                          <BarChart3 className="w-4 h-4" /> Relatório ano {y}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* Chart preview */}
                <div className="mt-6 pt-4 border-t">
                  <h4 className="text-sm font-semibold text-gray-700 text-center mb-3">
                    Evolução das Avaliações - {currentYear}
                  </h4>
                  <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 mb-1">
                    <span className="w-3 h-2 bg-green-600 inline-block rounded-sm"></span> Avaliações
                  </div>
                  <div className="h-24 relative">
                    <svg viewBox="0 0 240 96" className="w-full h-full">
                      {monthlyStats && (
                        <>
                          <polyline
                            fill="none" stroke="#27ae60" strokeWidth="1.5"
                            points={monthlyStats.map((m, i) => `${i * (240 / 11)},${90 - (m.responses / Math.max(...monthlyStats.map((s) => s.responses), 1)) * 80}`).join(' ')}
                          />
                          {monthlyStats.map((m, i) => (
                            <circle key={i} cx={i * (240 / 11)} cy={90 - (m.responses / Math.max(...monthlyStats.map((s) => s.responses), 1)) * 80} r="3" fill="#27ae60" />
                          ))}
                        </>
                      )}
                    </svg>
                  </div>
                  <div className="flex justify-between text-[8px] text-gray-400 mt-1">
                    {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((m) => (
                      <span key={m}>{m}</span>
                    ))}
                  </div>
                </div>

                {/* Info box */}
                <div className="mt-6 bg-navy text-white rounded-lg p-4 text-center text-sm">
                  <p><Info className="w-4 h-4 inline mr-1" /> Sua opinião é fundamental para melhorarmos nossos serviços.
                    Você pode participar da pesquisa <strong>uma vez por mês</strong>.</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Report modal */}
      {reportYear && <ReportModal year={reportYear} onClose={() => setReportYear(null)} />}
    </PublicLayout>
  )
}
