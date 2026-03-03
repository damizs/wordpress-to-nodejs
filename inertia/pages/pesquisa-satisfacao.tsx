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

interface Props {
  questions: Question[]
  serviceTypes: string[]
  siteSettings?: Record<string, string | null>
  currentYear?: number
  availableYears?: number[]
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
  availableYears = []
}: Props) {
  const [cpf, setCpf] = useState('')
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [suggestion, setSuggestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

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
      
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <Header logoUrl={logoUrl} />

        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <a href="/" className="hover:text-primary">Início</a>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900">Pesquisa de Satisfação</span>
            </div>
          </div>
        </div>
        
        <main className="py-10 px-4">
          <div className="container mx-auto max-w-6xl">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Formulário - 2 colunas */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border p-8">
                  
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-navy mb-2">
                      Avaliação Contínua - Câmara Municipal
                    </h1>
                    <p className="text-gray-600">
                      Prezado cidadão, para melhor atender a sua demanda e aprimorar os serviços prestados, 
                      gostaríamos que respondesse algumas perguntas para medir sua satisfação.
                    </p>
                  </div>

                  {/* Message */}
                  {message && (
                    <div className={`p-4 rounded-lg mb-6 ${
                      message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    
                    {/* CPF Section */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3">
                          <label className="block text-sm font-semibold text-navy mb-2">
                            Informe seu CPF:
                          </label>
                          <input
                            type="text"
                            value={cpf}
                            onChange={handleCpfChange}
                            placeholder="000.000.000-00"
                            maxLength={14}
                            required
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg font-mono focus:border-navy focus:outline-none"
                          />
                        </div>
                        <div className="md:w-2/3 text-sm text-gray-600">
                          <p className="font-semibold text-gray-800 mb-1">
                            O CPF é necessário para limitar a votação mensal por pessoa.
                          </p>
                          <p>
                            Os dados informados nesta pesquisa estarão seguros de acordo com a Lei Geral de Proteção de Dados - LGPD. 
                            O cidadão poderá votar, se desejar, todos os meses, caso haja mudança na qualidade do serviço prestado/oferecido.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-4 md:gap-6 p-4 bg-white border rounded-xl mb-6">
                      {ratingIcons.map((item, index) => {
                        const Icon = item.icon
                        return (
                          <div key={index} className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                            <Icon className="w-5 h-5 md:w-6 md:h-6" style={{ color: item.color }} />
                            <span>{item.label}</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Questions */}
                    <div className="border rounded-xl overflow-hidden mb-6">
                      {displayQuestions.map((question, qIndex) => (
                        <div 
                          key={question.id} 
                          className={`flex flex-col md:flex-row md:items-center p-5 ${
                            qIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          } ${qIndex < displayQuestions.length - 1 ? 'border-b' : ''}`}
                        >
                          <div className="flex-1 mb-4 md:mb-0 md:pr-6 text-gray-800">
                            {question.texto}
                          </div>
                          <div className="flex gap-2 justify-between md:justify-end">
                            {ratingIcons.map((item, rIndex) => {
                              const Icon = item.icon
                              const rating = rIndex + 1
                              const isSelected = answers[question.id] === rating
                              return (
                                <button
                                  key={rating}
                                  type="button"
                                  onClick={() => handleRating(question.id, rating)}
                                  className={`w-11 h-11 md:w-12 md:h-12 rounded-full border-3 flex items-center justify-center transition-all ${
                                    isSelected 
                                      ? 'text-white scale-110 shadow-lg' 
                                      : 'text-gray-300 border-gray-200 bg-white hover:scale-105'
                                  }`}
                                  style={isSelected ? { 
                                    backgroundColor: item.bgSelected, 
                                    borderColor: item.bgSelected 
                                  } : {
                                    borderColor: '#e5e7eb'
                                  }}
                                >
                                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Suggestion */}
                    <div className="mb-6">
                      <label className="block font-semibold text-gray-800 mb-2">
                        Você daria sugestões para melhorar o atendimento aos usuários dos serviços? Se sim, quais?
                      </label>
                      <textarea
                        value={suggestion}
                        onChange={(e) => setSuggestion(e.target.value)}
                        rows={4}
                        placeholder="Digite sua sugestão (opcional)"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-navy focus:outline-none resize-y"
                      />
                    </div>

                    {/* LGPD Notice */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 border-l-4 border-navy">
                      <p className="text-sm text-gray-600 flex items-start gap-3">
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
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-lg font-semibold text-lg hover:bg-primary/90 transition-all disabled:opacity-60"
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
                <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-navy mb-4">
                    <BarChart3 className="w-5 h-5" />
                    Relatórios
                  </h3>

                  {/* Ano atual */}
                  <button className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium mb-4 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    Relatório ano {currentYear}
                  </button>

                  {/* Anos anteriores */}
                  <p className="text-sm text-gray-500 text-center mb-3">Relatórios anteriores</p>
                  <div className="space-y-2">
                    {years.slice(1).map(year => (
                      <button 
                        key={year}
                        className="w-full px-4 py-2.5 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Relatório ano {year}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gráfico placeholder */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-4">
                    Evolução das Avaliações - {currentYear}
                  </h4>
                  <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      Gráfico de evolução
                    </div>
                  </div>
                </div>

                {/* Info box */}
                <div className="bg-primary rounded-2xl p-6 text-white">
                  <p className="font-semibold mb-2">
                    Sua opinião é fundamental para melhorarmos nossos serviços.
                  </p>
                  <p className="text-sm text-white/80">
                    Você pode participar da pesquisa <strong className="text-white">uma vez por mês</strong>.
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
