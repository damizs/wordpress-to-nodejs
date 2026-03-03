import { Head, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Instagram, Settings, History, Play, RefreshCw, CheckCircle, XCircle, Clock, Rocket, Filter } from 'lucide-react'
import { useState, useMemo } from 'react'

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Automação Instagram</h1>
              <p className="text-sm text-slate-500">Importe posts do Instagram como notícias</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/painel/instagram/historico" className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border rounded-lg hover:bg-slate-50">
              <History className="w-4 h-4" />Histórico
            </Link>
            <Link href="/painel/instagram/configuracoes" className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              <Settings className="w-4 h-4" />Configurações
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[{ icon: Instagram, color: 'blue', value: stats.total, label: 'Total Importados' },
            { icon: CheckCircle, color: 'green', value: stats.success, label: 'Publicados' },
            { icon: XCircle, color: 'red', value: stats.errors, label: 'Erros' },
            { icon: Clock, color: 'amber', value: stats.today, label: 'Hoje' }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${item.color}-100 rounded-lg`}><item.icon className={`w-5 h-5 text-${item.color}-600`} /></div>
                <div><p className="text-2xl font-bold text-slate-800">{item.value}</p><p className="text-sm text-slate-500">{item.label}</p></div>
              </div>
            </div>
          ))}
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Carregar Posts do Instagram</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <input type="text" value={profileUrl} disabled className="w-full px-4 py-2 border rounded-lg bg-slate-50 text-slate-600" placeholder="URL do perfil não configurada" />
              {!profileUrl && <p className="text-sm text-red-500 mt-1">Configure a URL do perfil nas <Link href="/painel/instagram/configuracoes" className="underline">configurações</Link></p>}
            </div>
            <button onClick={loadPosts} disabled={loadingPosts || !profileUrl} className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50">
              {loadingPosts ? <><RefreshCw className="w-4 h-4 animate-spin" />Carregando...</> : <><Play className="w-4 h-4" />Carregar Posts</>}
            </button>
            <button onClick={runAutoImport} disabled={loading || !profileUrl} className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50">
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" />Executando...</> : <><Rocket className="w-4 h-4" />Importar Automático</>}
            </button>
          </div>
        </div>

        {posts.length > 0 && (
          <div className="bg-white rounded-lg border p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Posts Disponíveis: {filteredPosts.length}</h3>
                {filterMonth && <p className="text-sm text-slate-500">Mostrando {formatMonth(filterMonth)}</p>}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm">
                    <option value="">Todos os meses</option>
                    {availableMonths.map(month => <option key={month} value={month}>{formatMonth(month)}</option>)}
                  </select>
                </div>
                <button onClick={selectAll} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-slate-50">Selecionar Todos</button>
                <button onClick={deselectAll} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-slate-50">Desmarcar</button>
                <button onClick={publishSelected} disabled={selectedPosts.size === 0 || publishing} className="flex items-center gap-2 px-4 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50">
                  {publishing ? <><RefreshCw className="w-4 h-4 animate-spin" />Publicando...</> : <><Rocket className="w-4 h-4" />Publicar ({selectedPosts.size})</>}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredPosts.map(post => (
                <div key={post.id} className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${post.isImported ? 'border-green-300 opacity-60' : selectedPosts.has(post.id) ? 'border-purple-500 ring-2 ring-purple-200' : 'border-transparent hover:border-slate-300'}`} onClick={() => !post.isImported && togglePost(post.id)}>
                  <div className="aspect-square"><img src={post.thumbnailSrc} alt="" className="w-full h-full object-cover" loading="lazy" /></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-xs text-white">{formatDate(post.takenAtTimestamp)}</p>
                      <p className="text-xs text-white/80 line-clamp-2">{post.caption?.substring(0, 60)}...</p>
                    </div>
                  </div>
                  {post.isImported && <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" />Importado</div>}
                  {post.isVideo && <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded-full">Vídeo</div>}
                  {!post.isImported && <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedPosts.has(post.id) ? 'bg-purple-500 border-purple-500 text-white' : 'bg-white/80 border-slate-300'}`}>{selectedPosts.has(post.id) && <CheckCircle className="w-4 h-4" />}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {recentLogs.length > 0 && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Últimas Importações</h3>
            <div className="space-y-2">
              {recentLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {log.status === 'published' || log.status === 'draft' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                    <div><p className="font-medium text-slate-800">{log.title || log.instagramId}</p><p className="text-sm text-slate-500">{log.createdAt}</p></div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${log.status === 'published' ? 'bg-green-100 text-green-700' : log.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {log.status === 'published' ? 'Publicado' : log.status === 'draft' ? 'Rascunho' : 'Erro'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center"><Link href="/painel/instagram/historico" className="text-sm text-blue-600 hover:underline">Ver histórico completo →</Link></div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
