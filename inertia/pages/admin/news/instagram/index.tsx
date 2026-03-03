import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Instagram, Settings, History, Play, Search, CheckCircle, XCircle, Clock, Loader2, X, Edit3, Eye } from 'lucide-react'
import { useState } from 'react'

// Helper para usar proxy de imagens do Instagram (contorna CORS)
const getProxyImageUrl = (url: string) => {
  if (!url || !url.includes('cdninstagram.com')) return url
  return `/painel/noticias/instagram/proxy-image?url=${encodeURIComponent(url)}`
}

interface InstagramPost {
  id: string
  shortcode: string
  thumbnailSrc: string
  displayUrl: string
  caption: string
  takenAtTimestamp: number
  isVideo: boolean
  isImported?: boolean
}

interface ProcessedPost {
  post: InstagramPost
  title: string
  content: string
  status: 'pending' | 'processing' | 'ready' | 'publishing' | 'published' | 'error'
  error?: string
}

interface Props {
  settings: Record<string, string | null>
  logs: any[]
  stats: {
    total: number
    success: number
    errors: number
    today: number
  }
}

export default function InstagramDashboard({ settings, logs, stats }: Props) {
  const [loading, setLoading] = useState(false)
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [posts, setPosts] = useState<InstagramPost[]>([])
  const [importedIds, setImportedIds] = useState<string[]>([])
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())
  const [filterMonth, setFilterMonth] = useState('')
  
  // Modal de publicação
  const [showModal, setShowModal] = useState(false)
  const [processedPosts, setProcessedPosts] = useState<ProcessedPost[]>([])
  const [currentStep, setCurrentStep] = useState<'processing' | 'review' | 'publishing' | 'done'>('processing')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  const getCsrfToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''
  }

  const loadPosts = async () => {
    setLoadingPosts(true)
    setMessage(null)
    try {
      const response = await fetch('/painel/noticias/instagram/fetch-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
      })
      const data = await response.json()
      if (data.success) {
        setPosts(data.posts)
        setImportedIds(data.importedIds || [])
        setMessage({ type: 'success', text: `${data.total} posts encontrados (${data.newCount} novos)` })
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoadingPosts(false)
    }
  }

  const runAutoImport = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const response = await fetch('/painel/noticias/instagram/auto-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
      })
      const data = await response.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        router.reload()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  // Iniciar processo de publicação
  const startPublishing = async () => {
    const selectedArray = Array.from(selectedPosts)
    if (selectedArray.length === 0) return

    // Preparar posts para processamento
    const postsToProcess = posts.filter(p => selectedArray.includes(p.id))
    const initial: ProcessedPost[] = postsToProcess.map(post => ({
      post,
      title: '',
      content: '',
      status: 'pending' as const
    }))

    setProcessedPosts(initial)
    setShowModal(true)
    setCurrentStep('processing')
    setEditingIndex(null)

    // Processar cada post com IA
    for (let i = 0; i < initial.length; i++) {
      setProcessedPosts(prev => prev.map((p, idx) => 
        idx === i ? { ...p, status: 'processing' } : p
      ))

      try {
        const response = await fetch('/painel/noticias/instagram/process-caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
          body: JSON.stringify({ caption: initial[i].post.caption })
        })
        const data = await response.json()

        if (data.success) {
          setProcessedPosts(prev => prev.map((p, idx) => 
            idx === i ? { ...p, title: data.title, content: data.content, status: 'ready' } : p
          ))
        } else {
          setProcessedPosts(prev => prev.map((p, idx) => 
            idx === i ? { ...p, status: 'error', error: data.error } : p
          ))
        }
      } catch (error: any) {
        setProcessedPosts(prev => prev.map((p, idx) => 
          idx === i ? { ...p, status: 'error', error: error.message } : p
        ))
      }

      // Pequeno delay entre processamentos
      if (i < initial.length - 1) {
        await new Promise(r => setTimeout(r, 500))
      }
    }

    setCurrentStep('review')
  }

  // Publicar posts após revisão
  const publishReviewedPosts = async () => {
    setCurrentStep('publishing')
    const readyPosts = processedPosts.filter(p => p.status === 'ready')

    for (let i = 0; i < readyPosts.length; i++) {
      const idx = processedPosts.findIndex(p => p.post.id === readyPosts[i].post.id)
      
      setProcessedPosts(prev => prev.map((p, pidx) => 
        pidx === idx ? { ...p, status: 'publishing' } : p
      ))

      try {
        const response = await fetch('/painel/noticias/instagram/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
          body: JSON.stringify({
            post: readyPosts[i].post,
            title: readyPosts[i].title,
            content: readyPosts[i].content
          })
        })
        const data = await response.json()

        if (data.success) {
          setProcessedPosts(prev => prev.map((p, pidx) => 
            pidx === idx ? { ...p, status: 'published' } : p
          ))
          setImportedIds(prev => [...prev, readyPosts[i].post.id])
        } else {
          setProcessedPosts(prev => prev.map((p, pidx) => 
            pidx === idx ? { ...p, status: 'error', error: data.error } : p
          ))
        }
      } catch (error: any) {
        setProcessedPosts(prev => prev.map((p, pidx) => 
          pidx === idx ? { ...p, status: 'error', error: error.message } : p
        ))
      }

      if (i < readyPosts.length - 1) {
        await new Promise(r => setTimeout(r, 1000))
      }
    }

    setCurrentStep('done')
    setSelectedPosts(new Set())
  }

  const closeModal = () => {
    setShowModal(false)
    setProcessedPosts([])
    setEditingIndex(null)
    if (currentStep === 'done') {
      router.reload()
    }
  }

  const updateProcessedPost = (index: number, field: 'title' | 'content', value: string) => {
    setProcessedPosts(prev => prev.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    ))
  }

  const togglePostSelection = (id: string) => {
    const newSelected = new Set(selectedPosts)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedPosts(newSelected)
  }

  const selectAll = () => {
    const newSelected = new Set<string>()
    filteredPosts.forEach(p => {
      if (!importedIds.includes(p.id)) {
        newSelected.add(p.id)
      }
    })
    setSelectedPosts(newSelected)
  }

  const deselectAll = () => setSelectedPosts(new Set())

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('pt-BR')
  }

  const getMonthKey = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }

  const getAvailableMonths = () => {
    const months = new Set<string>()
    posts.forEach(p => months.add(getMonthKey(p.takenAtTimestamp)))
    return Array.from(months).sort().reverse()
  }

  const filteredPosts = filterMonth 
    ? posts.filter(p => getMonthKey(p.takenAtTimestamp) === filterMonth)
    : posts

  const getStatusBadge = (status: ProcessedPost['status']) => {
    switch (status) {
      case 'pending': return <span className="text-gray-500">Aguardando...</span>
      case 'processing': return <span className="text-blue-500 flex items-center gap-1"><Loader2 className="w-4 h-4 animate-spin" /> Processando IA...</span>
      case 'ready': return <span className="text-green-500 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Pronto para publicar</span>
      case 'publishing': return <span className="text-blue-500 flex items-center gap-1"><Loader2 className="w-4 h-4 animate-spin" /> Publicando...</span>
      case 'published': return <span className="text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Publicado!</span>
      case 'error': return <span className="text-red-500 flex items-center gap-1"><XCircle className="w-4 h-4" /> Erro</span>
    }
  }

  return (
    <AdminLayout>
      <Head title="Instagram Auto Publisher" />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Instagram className="w-8 h-8 text-pink-500" />
            <h1 className="text-2xl font-bold">Instagram Auto Publisher</h1>
          </div>
          <div className="flex gap-2">
            <a href="/painel/noticias/instagram/configuracoes" className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
              <Settings className="w-4 h-4" /> Configurações
            </a>
            <a href="/painel/noticias/instagram/historico" className="px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50">
              <History className="w-4 h-4" /> Histórico
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Instagram className="w-5 h-5 text-blue-600" /></div>
            <div><div className="text-2xl font-bold">{stats.total}</div><div className="text-sm text-gray-500">Total Importados</div></div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
            <div><div className="text-2xl font-bold">{stats.success}</div><div className="text-sm text-gray-500">Publicados</div></div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg"><XCircle className="w-5 h-5 text-red-600" /></div>
            <div><div className="text-2xl font-bold">{stats.errors}</div><div className="text-sm text-gray-500">Erros</div></div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <div><div className="text-2xl font-bold">{stats.today}</div><div className="text-sm text-gray-500">Hoje</div></div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* Load Posts Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Carregar Posts do Instagram</h2>
              {settings.instagram_profile_url && (
                <p className="text-sm text-gray-500">Perfil: <a href={settings.instagram_profile_url} target="_blank" className="text-blue-600 hover:underline">{settings.instagram_profile_url}</a></p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={loadPosts} disabled={loadingPosts} className="px-4 py-2 bg-pink-500 text-white rounded-lg flex items-center gap-2 hover:bg-pink-600 disabled:opacity-50">
                {loadingPosts ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Carregar Posts
              </button>
              <button onClick={runAutoImport} disabled={loading} className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 hover:bg-green-600 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Importar Posts de Hoje
              </button>
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {posts.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold">Posts: {filteredPosts.length}</span>
                <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="border rounded-lg px-3 py-1">
                  <option value="">Todos os meses</option>
                  {getAvailableMonths().map(m => {
                    const [year, month] = m.split('-')
                    return <option key={m} value={m}>{monthNames[parseInt(month) - 1]} {year}</option>
                  })}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={selectAll} className="px-3 py-1 border rounded-lg hover:bg-gray-50">Selecionar Novos</button>
                <button onClick={deselectAll} className="px-3 py-1 border rounded-lg hover:bg-gray-50">Desmarcar</button>
                <button onClick={startPublishing} disabled={selectedPosts.size === 0} className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 hover:bg-green-600 disabled:opacity-50">
                  <Play className="w-4 h-4" /> Publicar ({selectedPosts.size})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4">
              {filteredPosts.map(post => {
                const isImported = importedIds.includes(post.id)
                const isSelected = selectedPosts.has(post.id)
                return (
                  <div key={post.id} className={`relative rounded-lg overflow-hidden border-2 transition-all ${isSelected ? 'border-green-500 ring-2 ring-green-200' : 'border-transparent'} ${isImported ? 'opacity-60' : ''}`}>
                    <div className="absolute top-2 left-2 z-10">
                      <input type="checkbox" checked={isSelected} onChange={() => togglePostSelection(post.id)} disabled={isImported} className="w-5 h-5 rounded" />
                    </div>
                    <div className="absolute top-2 right-2 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {formatDate(post.takenAtTimestamp)}
                    </div>
                    {isImported && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Importado
                        </span>
                      </div>
                    )}
                    <img src={getProxyImageUrl(post.thumbnailSrc)} alt="" className="w-full aspect-square object-cover" loading="lazy" />
                    <div className="p-2 bg-gray-50">
                      <p className="text-xs text-gray-600 line-clamp-2">{post.caption?.substring(0, 80) || 'Sem legenda'}...</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Publicação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <h2 className="text-lg font-semibold">
                {currentStep === 'processing' && '🤖 Processando com IA...'}
                {currentStep === 'review' && '📝 Revise antes de publicar'}
                {currentStep === 'publishing' && '🚀 Publicando...'}
                {currentStep === 'done' && '✅ Concluído!'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-200 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {processedPosts.map((item, index) => (
                <div key={item.post.id} className="mb-4 p-4 border rounded-lg">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 flex-shrink-0">
                      <img src={getProxyImageUrl(item.post.thumbnailSrc)} className="w-full h-full object-cover rounded-lg" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500">{formatDate(item.post.takenAtTimestamp)}</span>
                        {getStatusBadge(item.status)}
                      </div>

                      {item.status === 'error' && (
                        <div className="text-red-500 text-sm mb-2">{item.error}</div>
                      )}

                      {(item.status === 'ready' || item.status === 'published') && (
                        <>
                          {editingIndex === index ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={item.title}
                                onChange={e => updateProcessedPost(index, 'title', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg font-semibold"
                                placeholder="Título"
                              />
                              <textarea
                                value={item.content}
                                onChange={e => updateProcessedPost(index, 'content', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                rows={4}
                                placeholder="Conteúdo"
                              />
                              <button onClick={() => setEditingIndex(null)} className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm">
                                Salvar
                              </button>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{item.title}</h3>
                                {currentStep === 'review' && (
                                  <button onClick={() => setEditingIndex(index)} className="p-1 hover:bg-gray-100 rounded">
                                    <Edit3 className="w-4 h-4 text-gray-500" />
                                  </button>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-3">{item.content}</p>
                            </div>
                          )}
                        </>
                      )}

                      {item.status === 'pending' && (
                        <p className="text-sm text-gray-400 italic">Aguardando processamento...</p>
                      )}

                      {item.status === 'processing' && (
                        <p className="text-sm text-blue-500 italic">A IA está gerando título e conteúdo...</p>
                      )}

                      {item.status === 'publishing' && (
                        <p className="text-sm text-blue-500 italic">Salvando notícia e baixando imagem...</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {currentStep === 'review' && `${processedPosts.filter(p => p.status === 'ready').length} post(s) pronto(s) para publicar`}
                {currentStep === 'done' && `${processedPosts.filter(p => p.status === 'published').length} publicado(s), ${processedPosts.filter(p => p.status === 'error').length} erro(s)`}
              </div>
              <div className="flex gap-2">
                {currentStep === 'review' && (
                  <>
                    <button onClick={closeModal} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
                      Cancelar
                    </button>
                    <button 
                      onClick={publishReviewedPosts} 
                      disabled={processedPosts.filter(p => p.status === 'ready').length === 0}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" /> Publicar Agora
                    </button>
                  </>
                )}
                {currentStep === 'done' && (
                  <button onClick={closeModal} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    Fechar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
