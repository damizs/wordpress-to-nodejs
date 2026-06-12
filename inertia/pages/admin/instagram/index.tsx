import { Head, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  Instagram,
  Settings,
  History,
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Rocket,
  Filter,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  Input,
  Select,
  StatCard,
} from '~/components/admin/ui'

interface Post {
  id: string
  shortcode: string
  thumbnailSrc: string
  displayUrl: string
  caption: string
  takenAtTimestamp: number
  isVideo: boolean
  isImported: boolean
}

interface Props {
  settings: Record<string, string | null>
  stats: {
    total: number
    success: number
    errors: number
    today: number
  }
  recentLogs: Array<{
    id: number
    instagramId: string
    title: string | null
    status: string
    newsId: number | null
    createdAt: string
    error: string | null
  }>
}

export default function InstagramDashboard({ settings, stats, recentLogs }: Props) {
  const [loading, setLoading] = useState(false)
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [filterMonth, setFilterMonth] = useState('')
  const [publishing, setPublishing] = useState(false)

  const getCsrfToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''
  }

  const loadPosts = async () => {
    setLoadingPosts(true)
    setMessage(null)
    setPosts([])
    setSelectedPosts(new Set())

    try {
      const response = await fetch('/painel/instagram/fetch-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': decodeURIComponent(getCsrfToken()) },
      })
      const data = await response.json()
      if (data.success) {
        setPosts(data.posts)
        setMessage({ type: 'success', text: `${data.posts.length} posts carregados!` })
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
      const response = await fetch('/painel/instagram/auto-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': decodeURIComponent(getCsrfToken()) },
      })
      const data = await response.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        window.location.reload()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const publishSelected = async () => {
    if (selectedPosts.size === 0) return
    setPublishing(true)
    setMessage(null)
    const postsToPublish = posts.filter(p => selectedPosts.has(p.id) && !p.isImported)
    try {
      const response = await fetch('/painel/instagram/publish-multiple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': decodeURIComponent(getCsrfToken()) },
        body: JSON.stringify({ posts: postsToPublish }),
      })
      const data = await response.json()
      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setPosts(prev => prev.map(p => selectedPosts.has(p.id) ? { ...p, isImported: true } : p))
        setSelectedPosts(new Set())
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setPublishing(false)
    }
  }

  const togglePost = (id: string) => {
    const newSelected = new Set(selectedPosts)
    if (newSelected.has(id)) newSelected.delete(id)
    else newSelected.add(id)
    setSelectedPosts(newSelected)
  }

  const selectAll = () => setSelectedPosts(new Set(filteredPosts.filter(p => !p.isImported).map(p => p.id)))
  const deselectAll = () => setSelectedPosts(new Set())

  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    posts.forEach(post => {
      const date = new Date(post.takenAtTimestamp * 1000)
      months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`)
    })
    return Array.from(months).sort().reverse()
  }, [posts])

  const filteredPosts = useMemo(() => {
    if (!filterMonth) return posts
    return posts.filter(post => {
      const date = new Date(post.takenAtTimestamp * 1000)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === filterMonth
    })
  }, [posts, filterMonth])

  const formatDate = (timestamp: number) => new Date(timestamp * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const formatMonth = (key: string) => { const [year, month] = key.split('-'); return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) }

  const profileUrl = settings.instagram_profile_url || ''

  return (
    <AdminLayout>
      <Head title="Automação Instagram" />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-navy text-white rounded-lg">
              <Instagram className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Automação Instagram</h1>
              <p className="text-sm text-muted-foreground">Importe posts do Instagram como notícias</p>
            </div>
          </div>
          <div className="flex gap-2">
            <ButtonLink href="/painel/instagram/historico" variant="secondary">
              <History className="w-4 h-4" /> Histórico
            </ButtonLink>
            <ButtonLink href="/painel/instagram/configuracoes">
              <Settings className="w-4 h-4" /> Configurações
            </ButtonLink>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total Importados" value={stats.total} icon={Instagram} />
          <StatCard label="Publicados" value={stats.success} icon={CheckCircle} />
          <StatCard label="Erros" value={stats.errors} icon={XCircle} />
          <StatCard label="Hoje" value={stats.today} icon={Clock} />
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg border text-sm ${
              message.type === 'success'
                ? 'bg-emerald-600/10 text-emerald-700 border-emerald-600/20'
                : 'bg-destructive/10 text-destructive border-destructive/20'
            }`}
          >
            {message.text}
          </div>
        )}

        <Card>
          <CardHeader title="Carregar Posts do Instagram" icon={Instagram} />
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 w-full">
              <Input type="text" value={profileUrl} disabled placeholder="URL do perfil não configurada" />
              {!profileUrl && (
                <p className="text-sm text-destructive mt-1">
                  Configure a URL do perfil nas{' '}
                  <Link href="/painel/instagram/configuracoes" className="underline">
                    configurações
                  </Link>
                </p>
              )}
            </div>
            <Button onClick={loadPosts} disabled={!profileUrl} loading={loadingPosts}>
              {loadingPosts ? (
                'Carregando...'
              ) : (
                <>
                  <Play className="w-4 h-4" /> Carregar Posts
                </>
              )}
            </Button>
            <Button variant="gold" onClick={runAutoImport} disabled={!profileUrl} loading={loading}>
              {loading ? (
                'Executando...'
              ) : (
                <>
                  <Rocket className="w-4 h-4" /> Importar Automático
                </>
              )}
            </Button>
          </div>
        </Card>

        {posts.length > 0 && (
          <Card>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
              <div>
                <h3 className="text-[15px] font-bold text-foreground">
                  Posts Disponíveis: {filteredPosts.length}
                </h3>
                {filterMonth && (
                  <p className="text-sm text-muted-foreground">Mostrando {formatMonth(filterMonth)}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <Select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="!w-auto"
                  >
                    <option value="">Todos os meses</option>
                    {availableMonths.map(month => (
                      <option key={month} value={month}>{formatMonth(month)}</option>
                    ))}
                  </Select>
                </div>
                <Button variant="secondary" size="sm" onClick={selectAll}>
                  Selecionar Todos
                </Button>
                <Button variant="secondary" size="sm" onClick={deselectAll}>
                  Desmarcar
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={publishSelected}
                  disabled={selectedPosts.size === 0}
                  loading={publishing}
                >
                  {publishing ? (
                    'Publicando...'
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" /> Publicar ({selectedPosts.size})
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredPosts.map(post => (
                <div
                  key={post.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    post.isImported
                      ? 'border-emerald-600/40 opacity-60'
                      : selectedPosts.has(post.id)
                        ? 'border-navy ring-2 ring-navy/25'
                        : 'border-transparent hover:border-border'
                  }`}
                  onClick={() => !post.isImported && togglePost(post.id)}
                >
                  <div className="aspect-square">
                    <img src={post.thumbnailSrc} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-xs text-white">{formatDate(post.takenAtTimestamp)}</p>
                      <p className="text-xs text-white/80 line-clamp-2">{post.caption?.substring(0, 60)}...</p>
                    </div>
                  </div>
                  {post.isImported && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-600 text-white text-xs rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Importado
                    </div>
                  )}
                  {post.isVideo && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded-full">
                      Vídeo
                    </div>
                  )}
                  {!post.isImported && (
                    <div
                      className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedPosts.has(post.id)
                          ? 'bg-navy border-navy text-white'
                          : 'bg-white/80 border-border'
                      }`}
                    >
                      {selectedPosts.has(post.id) && <CheckCircle className="w-4 h-4" />}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {recentLogs.length > 0 && (
          <Card>
            <CardHeader title="Últimas Importações" />
            <div className="space-y-2">
              {recentLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    {log.status === 'published' || log.status === 'draft' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{log.title || log.instagramId}</p>
                      <p className="text-sm text-muted-foreground">{log.createdAt}</p>
                    </div>
                  </div>
                  <Badge
                    tone={log.status === 'published' ? 'success' : log.status === 'draft' ? 'warning' : 'danger'}
                  >
                    {log.status === 'published' ? 'Publicado' : log.status === 'draft' ? 'Rascunho' : 'Erro'}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/painel/instagram/historico" className="text-sm text-navy hover:underline">
                Ver histórico completo →
              </Link>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
