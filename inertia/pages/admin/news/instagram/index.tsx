import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Instagram, Settings, History, Play, Search, CheckCircle, XCircle, Clock, Loader2, X, Edit3, ClipboardCheck } from 'lucide-react'
import { useState } from 'react'
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  IconButton,
  Input,
  Modal,
  Select,
  StatCard,
  Textarea,
} from '~/components/admin/ui'

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
  const [loadingFeed, setLoadingFeed] = useState(false)
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

  const refreshSiteFeed = async () => {
    setLoadingFeed(true)
    setMessage(null)
    try {
      const response = await fetch('/painel/noticias/instagram/refresh-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
      })
      const data = await response.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoadingFeed(false)
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
      case 'pending': return <Badge tone="neutral">Aguardando...</Badge>
      case 'processing': return <Badge tone="info"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processando IA...</Badge>
      case 'ready': return <Badge tone="success"><CheckCircle className="w-3.5 h-3.5" /> Pronto para publicar</Badge>
      case 'publishing': return <Badge tone="info"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Publicando...</Badge>
      case 'published': return <Badge tone="success"><CheckCircle className="w-3.5 h-3.5" /> Publicado!</Badge>
      case 'error': return <Badge tone="danger"><XCircle className="w-3.5 h-3.5" /> Erro</Badge>
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
            <h1 className="text-2xl font-bold text-foreground">Instagram Auto Publisher</h1>
          </div>
          <div className="flex gap-2">
            <ButtonLink href="/painel/noticias/instagram/configuracoes" variant="secondary">
              <Settings className="w-4 h-4" /> Configurações
            </ButtonLink>
            <ButtonLink href="/painel/noticias/instagram/historico" variant="secondary">
              <History className="w-4 h-4" /> Histórico
            </ButtonLink>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Importados" value={stats.total} icon={Instagram} />
          <StatCard label="Publicados" value={stats.success} icon={CheckCircle} />
          <StatCard label="Erros" value={stats.errors} icon={XCircle} />
          <StatCard label="Hoje" value={stats.today} icon={Clock} />
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg border text-sm ${message.type === 'success' ? 'bg-emerald-600/10 text-emerald-700 border-emerald-600/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
            {message.text}
          </div>
        )}

        {/* Load Posts Section */}
        <Card className="mb-6">
          <CardHeader
            title="Carregar Posts do Instagram"
            description={settings.instagram_profile_url ? `Perfil: ${settings.instagram_profile_url}` : undefined}
            actions={
              <div className="flex gap-2">
                <Button onClick={loadPosts} loading={loadingPosts}>
                  {!loadingPosts && <Search className="w-4 h-4" />}
                  Carregar Posts
                </Button>
                <Button variant="gold" onClick={runAutoImport} loading={loading}>
                  {!loading && <Play className="w-4 h-4" />}
                  Importar Posts de Hoje
                </Button>
              </div>
            }
          />
        </Card>

        {/* Feed ao vivo da home */}
        <Card className="mb-6">
          <CardHeader
            title="Feed do site (seção “Siga-nos” na home)"
            description="Exibe as publicações mais recentes do perfil, atualizadas pelo scraper (sem precisar de senha do Instagram). As imagens são baixadas e cacheadas. Atualiza sozinho a cada poucas horas; use o botão para forçar agora."
            actions={
              <Button variant="secondary" onClick={refreshSiteFeed} loading={loadingFeed}>
                {!loadingFeed && <Instagram className="w-4 h-4" />}
                Atualizar feed agora
              </Button>
            }
          />
        </Card>

        {/* Posts Grid */}
        {posts.length > 0 && (
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-foreground">Posts: {filteredPosts.length}</span>
                <div className="w-44">
                  <Select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                    <option value="">Todos os meses</option>
                    {getAvailableMonths().map(m => {
                      const [year, month] = m.split('-')
                      return <option key={m} value={m}>{monthNames[parseInt(month) - 1]} {year}</option>
                    })}
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={selectAll}>Selecionar Novos</Button>
                <Button variant="secondary" size="sm" onClick={deselectAll}>Desmarcar</Button>
                <Button onClick={startPublishing} disabled={selectedPosts.size === 0}>
                  <Play className="w-4 h-4" /> Publicar ({selectedPosts.size})
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {filteredPosts.map(post => {
                const isImported = importedIds.includes(post.id)
                const isSelected = selectedPosts.has(post.id)
                return (
                  <div key={post.id} className={`relative rounded-lg overflow-hidden border-2 transition-all ${isSelected ? 'border-navy ring-2 ring-navy/20' : 'border-transparent'} ${isImported ? 'opacity-60' : ''}`}>
                    <div className="absolute top-2 left-2 z-10">
                      <input type="checkbox" checked={isSelected} onChange={() => togglePostSelection(post.id)} disabled={isImported} className="w-5 h-5 rounded accent-navy" />
                    </div>
                    <div className="absolute top-2 right-2 z-10 bg-navy-dark/70 text-white text-xs px-2 py-1 rounded">
                      {formatDate(post.takenAtTimestamp)}
                    </div>
                    {isImported && (
                      <div className="absolute inset-0 flex items-center justify-center bg-navy-dark/40 z-10">
                        <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Importado
                        </span>
                      </div>
                    )}
                    <img src={getProxyImageUrl(post.thumbnailSrc)} alt="" className="w-full aspect-square object-cover" loading="lazy" />
                    <div className="p-2 bg-muted">
                      <p className="text-xs text-muted-foreground line-clamp-2">{post.caption?.substring(0, 80) || 'Sem legenda'}...</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Modal de Publicação */}
      <Modal open={showModal} onClose={closeModal} maxWidth="max-w-4xl">
        <div className="flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/50 rounded-t-xl">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              {currentStep === 'processing' && (
                <>
                  <Loader2 className="w-5 h-5 text-sky animate-spin" /> Processando com IA...
                </>
              )}
              {currentStep === 'review' && (
                <>
                  <ClipboardCheck className="w-5 h-5 text-navy" /> Revise antes de publicar
                </>
              )}
              {currentStep === 'publishing' && (
                <>
                  <Loader2 className="w-5 h-5 text-sky animate-spin" /> Publicando...
                </>
              )}
              {currentStep === 'done' && (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-600" /> Concluído!
                </>
              )}
            </h2>
            <IconButton tone="neutral" onClick={closeModal}>
              <X className="w-5 h-5" />
            </IconButton>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {processedPosts.map((item, index) => (
              <div key={item.post.id} className="mb-4 p-4 border border-border rounded-lg">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-24 flex-shrink-0">
                    <img src={getProxyImageUrl(item.post.thumbnailSrc)} className="w-full h-full object-cover rounded-lg" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{formatDate(item.post.takenAtTimestamp)}</span>
                      {getStatusBadge(item.status)}
                    </div>

                    {item.status === 'error' && (
                      <div className="text-destructive text-sm mb-2">{item.error}</div>
                    )}

                    {(item.status === 'ready' || item.status === 'published') && (
                      <>
                        {editingIndex === index ? (
                          <div className="space-y-2">
                            <Input
                              type="text"
                              value={item.title}
                              onChange={e => updateProcessedPost(index, 'title', e.target.value)}
                              className="font-semibold"
                              placeholder="Título"
                            />
                            <Textarea
                              value={item.content}
                              onChange={e => updateProcessedPost(index, 'content', e.target.value)}
                              rows={4}
                              placeholder="Conteúdo"
                            />
                            <Button size="sm" onClick={() => setEditingIndex(null)}>
                              Salvar
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">{item.title}</h3>
                              {currentStep === 'review' && (
                                <IconButton tone="edit" className="p-1" onClick={() => setEditingIndex(index)}>
                                  <Edit3 className="w-4 h-4" />
                                </IconButton>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
                          </div>
                        )}
                      </>
                    )}

                    {item.status === 'pending' && (
                      <p className="text-sm text-muted-foreground italic">Aguardando processamento...</p>
                    )}

                    {item.status === 'processing' && (
                      <p className="text-sm text-sky italic">A IA está gerando título e conteúdo...</p>
                    )}

                    {item.status === 'publishing' && (
                      <p className="text-sm text-sky italic">Salvando notícia e baixando imagem...</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-muted/50 rounded-b-xl flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {currentStep === 'review' && `${processedPosts.filter(p => p.status === 'ready').length} post(s) pronto(s) para publicar`}
              {currentStep === 'done' && `${processedPosts.filter(p => p.status === 'published').length} publicado(s), ${processedPosts.filter(p => p.status === 'error').length} erro(s)`}
            </div>
            <div className="flex gap-2">
              {currentStep === 'review' && (
                <>
                  <Button variant="secondary" onClick={closeModal}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={publishReviewedPosts}
                    disabled={processedPosts.filter(p => p.status === 'ready').length === 0}
                  >
                    <Play className="w-4 h-4" /> Publicar Agora
                  </Button>
                </>
              )}
              {currentStep === 'done' && (
                <Button onClick={closeModal}>
                  Fechar
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
