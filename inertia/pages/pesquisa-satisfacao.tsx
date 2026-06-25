import { useState, useEffect } from 'react'
import { Head, router } from '@inertiajs/react'
import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { SeoHead } from '~/components/SeoHead'
import { Angry, Frown, Meh, Smile, Laugh, Send, Loader2, BarChart3, FileText, Shield, ChevronRight } from 'lucide-react'

interface Question {
  id: number
  numero: number
  texto: string
}

interface MonthlyStat {
  month: number
  name: string
  responses: number
  average: number
}

interface Props {
  questions: Question[]
  serviceTypes: string[]
  siteSettings?: Record<string, string | null>
  currentYear?: number
  availableYears?: number[]
  monthlyStats?: MonthlyStat[]
}

const ratingIcons = [
  { icon: Angry, label: 'Muito Insatisfeito', color: '#dc3545', bgSelected: '#dc3545' },
  { icon: Frown, label: 'Insatisfeito', color: '#fd7e14', bgSelected: '#fd7e14' },
  { icon: Meh, label: 'Neutro', color: '#6c757d', bgSelected: '#6c757d' },
  { icon: Smile, label: 'Satisfeito', color: '#28a745', bgSelected: '#28a745' },
  { icon: Laugh, label: 'Muito Satisfeito', color: '#198754', bgSelected: '#198754' },
]

export default function PesquisaSatisfacao({ 
  questions = [], 
  serviceTypes = [],
  siteSettings = {},
  currentYear = new Date().getFullYear(),
  availableYears = [],
  monthlyStats = []
}: Props) {
  const [cpf, setCpf] = useState('')
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [suggestion, setSuggestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Relatório / gráfico
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [stats, setStats] = useState<MonthlyStat[]>(monthlyStats)
  const [totals, setTotals] = useState<{ total: number; average: number }>({
    total: monthlyStats.reduce((a, m) => a + m.responses, 0),
    average: 0,
  })
  const [reportLoading, setReportLoading] = useState(false)

  const loadReport = async (year: number) => {
    setReportLoading(true)
    setSelectedYear(year)
    try {
      const res = await fetch(`/pesquisa-de-satisfacao/relatorio?year=${year}`, {
        headers: { Accept: 'application/json' },
      })
      const json = await res.json()
      setStats(json.monthlyStats || [])
      setTotals(json.totals || { total: 0, average: 0 })
    } catch {
      setStats([])
      setTotals({ total: 0, average: 0 })
    } finally {
      setReportLoading(false)
    }
  }

  // Carrega os totais do ano corrente ao montar (monthlyStats já vem por SSR)
  useEffect(() => {
    loadReport(currentYear)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const maxResponses = Math.max(1, ...stats.map((m) => m.responses))

  const logoUrl = siteSettings?.logo_url || null

  // Default questions if none provided
  const defaultQuestions: Question[] = [
    { id: 1, numero: 1, texto: 'Como você avalia a atuação da Câmara Municipal na fiscalização do Poder Executivo?' },
    { id: 2, numero: 2, texto: 'Qual seu nível de satisfação com a transparência das atividades da Câmara Municipal?' },
    { id: 3, numero: 3, texto: 'Como você avalia o trabalho dos vereadores na proposição de leis e projetos em benefício da população?' },
    { id: 4, numero: 4, texto: 'Qual seu nível de satisfação com as informações disponíveis no site da Câmara Municipal?' },
    { id: 5, numero: 5, texto: 'Ao ser atendido(a) na Câmara Municipal, o(a) funcionário(a) demonstra interesse em resolver seu problema?' },
  ]

  const displayQuestions = questions.length > 0 ? questions : defaultQuestions

  // Years for reports
  const years = availableYears.length > 0 ? availableYears : [currentYear, currentYear - 1, currentYear - 2, currentYear - 3]

  // CPF mask
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value))
  }

  const handleRating = (questionId: number, rating: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: rating }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all questions answered
    const unanswered = displayQuestions.filter(q => !answers[q.id])
    if (unanswered.length > 0) {
      setMessage({ type: 'error', text: 'Por favor, responda todas as perguntas.' })
      return
    }

    if (cpf.length < 14) {
      setMessage({ type: 'error', text: 'Por favor, informe um CPF válido.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      router.post('/pesquisa-de-satisfacao', {
        cpf: cpf.replace(/\D/g, ''),
        answers,
        suggestion,
      }, {
        onSuccess: () => {
          setMessage({ type: 'success', text: 'Obrigado! Sua avaliação foi enviada com sucesso.' })
          setCpf('')
          setAnswers({})
          setSuggestion('')
        },
        onError: (errors) => {
          setMessage({ type: 'error', text: errors.message || 'Erro ao enviar avaliação. Tente novamente.' })
        },
        onFinish: () => setLoading(false)
      })
    } catch {
      setMessage({ type: 'error', text: 'Erro ao enviar avaliação. Tente novamente.' })
      setLoading(false)
    }
  }

  return (
    <>
      <SeoHead 
        title="Pesquisa de Satisfação"
        description="Avaliação Contínua dos Serviços Prestados pela Câmara Municipal"
      />
      <Head title="Pesquisa de Satisfação" />
      
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header logoUrl={logoUrl} />

        <div className="bg-card border-b border-border">
          <div className="container py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <a href="/" className="hover:text-primary">Início</a>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
              <span className="text-foreground">Pesquisa de Satisfação</span>
            </div>
          </div>
        </div>
        
        <main id="conteudo" tabIndex={-1} className="py-10 px-4 outline-none">
          <div className="container max-w-6xl">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Formulário - 2 colunas */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
                  
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-navy mb-2">
                      Avaliação Contínua - Câmara Municipal
                    </h1>
                    <p className="text-muted-foreground">
                      Prezado cidadão, para melhor atender a sua demanda e aprimorar os serviços prestados, 
                      gostaríamos que respondesse algumas perguntas para medir sua satisfação.
                    </p>
                  </div>

                  {/* Message */}
                  {message && (
                    <div className={`p-4 rounded-lg mb-6 ${
                      message.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border border-emerald-500/25'
                        : 'bg-destructive/10 text-destructive border border-destructive/25'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    
                    {/* CPF Section */}
                    <div className="bg-muted rounded-xl p-6 mb-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3">
                          <label htmlFor="survey-cpf" className="block text-sm font-semibold text-navy mb-2">
                            Informe seu CPF:
                          </label>
                          <input
                            id="survey-cpf"
                            name="cpf"
                            type="text"
                            value={cpf}
                            onChange={handleCpfChange}
                            placeholder="000.000.000-00"
                            maxLength={14}
                            inputMode="numeric"
                            autoComplete="off"
                            pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
                            required
                            aria-describedby="survey-cpf-help"
                            className="w-full px-4 py-3 border-2 border-border rounded-lg text-lg font-mono focus:border-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/30 bg-background text-foreground"
                          />
                        </div>
                        <div id="survey-cpf-help" className="md:w-2/3 text-sm text-muted-foreground">
                          <p className="font-semibold text-foreground mb-1">
                            O CPF é necessário para limitar a votação mensal por pessoa.
                          </p>
                          <p>
                            O número é pseudonimizado (hash) após o envio — não armazenamos o CPF em texto claro.
                            Os dados estarão protegidos conforme a LGPD (Lei 13.709/2018).
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-4 md:gap-6 p-4 bg-muted/40 border border-border rounded-xl mb-6">
                      {ratingIcons.map((item, index) => {
                        const Icon = item.icon
                        return (
                          <div key={index} className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                            <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: item.color }} />
                            <span>{item.label}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Questions */}
                    <div className="border border-border rounded-xl overflow-hidden mb-6">
                      {displayQuestions.map((question, qIndex) => (
                        <fieldset
                          key={question.id}
                          className={`flex flex-col md:flex-row md:items-center p-5 border-0 m-0 min-w-0 ${
                            qIndex % 2 === 0 ? 'bg-card' : 'bg-muted/50'
                          } ${qIndex < displayQuestions.length - 1 ? 'border-b border-border' : ''}`}
                        >
                          <legend className="flex-1 mb-4 md:mb-0 md:pr-6 text-foreground text-sm md:text-base block w-full">
                            {question.texto}
                          </legend>
                          <div
                            role="radiogroup"
                            aria-label={question.texto}
                            className="flex gap-2 justify-between md:justify-end"
                          >
                            {ratingIcons.map((item, rIndex) => {
                              const Icon = item.icon
                              const rating = rIndex + 1
                              const isSelected = answers[question.id] === rating
                              return (
                                <button
                                  key={rating}
                                  type="button"
                                  role="radio"
                                  aria-checked={isSelected}
                                  aria-label={item.label}
                                  onClick={() => handleRating(question.id, rating)}
                                  className={`w-11 h-11 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 ${
                                    isSelected
                                      ? 'text-primary-foreground scale-110 shadow-lg'
                                      : 'text-muted-foreground border-border bg-card hover:scale-105'
                                  }`}
                                  style={
                                    isSelected
                                      ? {
                                          backgroundColor: item.bgSelected,
                                          borderColor: item.bgSelected,
                                        }
                                      : undefined
                                  }
                                >
                                  <Icon className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
                                </button>
                              )
                            })}
                          </div>
                        </fieldset>
                      ))}
                    </div>

                    {/* Suggestion */}
                    <div className="mb-6">
                      <label htmlFor="survey-suggestion" className="block font-semibold text-foreground mb-2">
                        Você daria sugestões para melhorar o atendimento aos usuários dos serviços? Se sim, quais?
                      </label>
                      <textarea
                        id="survey-suggestion"
                        name="suggestion"
                        value={suggestion}
                        onChange={(e) => setSuggestion(e.target.value)}
                        rows={4}
                        placeholder="Digite sua sugestão (opcional)"
                        className="w-full px-4 py-3 border-2 border-border rounded-lg focus:border-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/30 resize-y bg-background text-foreground"
                      />
                    </div>

                    {/* LGPD Notice */}
                    <div className="bg-muted/50 rounded-lg p-4 mb-6 border-l-4 border-navy">
                      <p className="text-sm text-muted-foreground flex items-start gap-3">
                        <Shield className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
                        <span>
                          Prezado(a), esta avaliação não será analisada como manifestação de Ouvidoria. 
                          Servirá apenas para revisarmos e refletirmos sobre as informações disponíveis nesta página. 
                          Esclarecemos que os dados fornecidos acima serão tratados com respeito à sua privacidade, 
                          seguindo a LGPD - Lei Geral de Proteção de Dados 13.709/2018.
                        </span>
                      </p>
                    </div>

                    {/* Submit */}
                    <div className="text-center">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Enviar Pesquisa
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                </div>
              </div>

              {/* Sidebar - Relatórios */}
              <div className="lg:col-span-1">
                
                {/* Relatórios */}
                <div className="bg-card rounded-2xl shadow-sm border border-border p-6 mb-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-navy mb-4">
                    <BarChart3 className="w-5 h-5" />
                    Relatórios
                  </h3>

                  {/* Ano atual */}
                  <button
                    type="button"
                    onClick={() => loadReport(currentYear)}
                    aria-pressed={selectedYear === currentYear}
                    className={`w-full px-4 py-3 rounded-lg font-medium mb-4 transition-colors flex items-center justify-center gap-2 ${
                      selectedYear === currentYear
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Relatório ano {currentYear}
                  </button>

                  {/* Anos anteriores */}
                  {years.slice(1).length > 0 && (
                    <>
                      <p className="text-sm text-muted-foreground text-center mb-3">Relatórios anteriores</p>
                      <div className="space-y-2">
                        {years.slice(1).map(year => (
                          <button 
                            key={year}
                            type="button"
                            onClick={() => loadReport(year)}
                            aria-pressed={selectedYear === year}
                            className={`w-full px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                              selectedYear === year
                                ? 'bg-primary text-primary-foreground'
                                : 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                            }`}
                          >
                            <BarChart3 className="w-4 h-4" />
                            Relatório ano {year}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Gráfico de evolução (respostas por mês) */}
                <div className="bg-card rounded-2xl shadow-sm border border-border p-6 mb-6">
                  <h4 className="text-center font-semibold text-foreground mb-1">
                    Evolução das Avaliações - {selectedYear}
                  </h4>
                  <p className="text-center text-sm text-muted-foreground mb-4">
                    {totals.total} {totals.total === 1 ? 'resposta' : 'respostas'}
                    {totals.average > 0 && ` · média geral ${totals.average.toFixed(1)}/5`}
                  </p>

                  {reportLoading ? (
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
                    </div>
                  ) : totals.total === 0 ? (
                    <div className="h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        Sem respostas em {selectedYear}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-end justify-between gap-1 h-48 px-1" role="img" aria-label={`Respostas por mês em ${selectedYear}`}>
                      {stats.map((m) => (
                        <div key={m.month} className="flex-1 flex flex-col items-center justify-end h-full gap-1.5">
                          <span className="text-[10px] font-semibold text-muted-foreground leading-none">
                            {m.responses > 0 ? m.responses : ''}
                          </span>
                          <div
                            className="w-full rounded-t bg-primary/80 hover:bg-primary transition-all min-h-[2px]"
                            style={{ height: `${(m.responses / maxResponses) * 100}%` }}
                            title={`${m.name}: ${m.responses} resposta(s)${m.average ? ` · média ${m.average}` : ''}`}
                          />
                          <span className="text-[9px] text-muted-foreground/80 leading-none">{m.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info box */}
                <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
                  <p className="font-semibold mb-2">
                    Sua opinião é fundamental para melhorarmos nossos serviços.
                  </p>
                  <p className="text-sm text-primary-foreground/80">
                    Você pode participar da pesquisa <strong className="text-primary-foreground">uma vez por mês</strong>.
                  </p>
                </div>

              </div>

            </div>

          </div>
        </main>
        
        <Footer logoUrl={logoUrl} />
      </div>
    </>
  )
}
