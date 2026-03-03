import { Head, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Instagram, Settings, History, Play, Search, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface InstagramPost {
  id: string
  shortcode: string
  thumbnailSrc: string
  displayUrl: string
  caption: string
  takenAtTimestamp: number
  isVideo: boolean
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
  const [publishing, setPublishing] = useState(false)
  const [publishProgress, setPublishProgress] = useState({ current: 0, total: 0, status: '' })

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  const loadPosts = async () => {
    setLoadingPosts(true)
    setMessage(null)
    try {
      const response = await fetch('/painel/noticias/instagram/fetch-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || '',
        },
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
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || '',
        },
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

  const publishSelected = async () => {
    const selectedArray = Array.from(selectedPosts)
    if (selectedArray.length === 0) return
    if (!confirm(`Publicar automaticamente ${selectedArray.length} post(s)?\n\n• A IA irá gerar título e conteúdo\n• Os posts serão publicados diretamente`)) return

    setPublishing(true)
    setPublishProgress({ current: 0, total: selectedArray.length, status: 'Iniciando...' })
    let imported = 0, errors = 0

    for (let i = 0; i < selectedArray.length; i++) {
      const postId = selectedArray[i]
      const post = posts.find(p => p.id === postId)
      if (!post) continue

      setPublishProgress({ current: i + 1, total: selectedArray.length, status: `Processando ${i + 1}/${selectedArray.length}...` })

      try {
        const response = await fetch('/painel/noticias/instagram/publish', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || '',
          },
          body: JSON.stringify({ post })
        })
        const data = await response.json()
        if (data.success) {
          imported++
          setImportedIds(prev => [...prev, postId])
          setSelectedPosts(prev => { const next = new Set(prev); next.delete(postId); return next })
        } else { errors++ }
      } catch { errors++ }
      await new Promise(resolve => setTimeout(resolve, 1500))
    }

    setPublishing(false)
    setMessage({ type: imported > 0 ? 'success' : 'error', text: `Concluído! ${imported} publicado(s), ${errors} erro(s)` })
    if (imported > 0) router.reload()
  }

  const getMonths = () => {
    const months: Record<string, { key: string; label: string; count: number }> = {}
    posts.forEach(post => {
      const date = new Date(post.takenAtTimestamp * 1000)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!months[key]) months[key] = { key, label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`, count: 0 }
      months[key].count++
    })
    return Object.values(months).sort((a, b) => b.key.localeCompare(a.key))
  }

  const filteredPosts = filterMonth ? posts.filter(post => {
    const date = new Date(post.takenAtTimestamp * 1000)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === filterMonth
  }) : posts

  const selectAll = () => { const s = new Set<string>(); filteredPosts.forEach(p => { if (!importedIds.includes(p.id)) s.add(p.id) }); setSelectedPosts(s) }
  const deselectAll = () => setSelectedPosts(new Set())
  const toggleSelect = (id: string) => setSelectedPosts(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <AdminLayout>
      <Head title="Instagram Auto Publisher" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Instagram className="w-8 h-8 text-pink-500" />
            <h1 className="text-2xl font-bold text-gray-900">Instagram Auto Publisher</h1>
          </div>
          <div className="flex gap-2">
            <a href="/painel/noticias/instagram/configuracoes" className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"><Settings className="w-4 h-4" />Configurações</a>
            <a href="/painel/noticias/instagram/historico" className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"><History className="w-4 h-4" />Histórico</a>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[{ icon: Instagram, color: 'blue', label: 'Total Importado', value: stats.total },
            { icon: CheckCircle, color: 'green', label: 'Publicados', value: stats.success },
            { icon: XCircle, color: 'red', label: 'Erros', value: stats.errors },
            { icon: Clock, color: 'purple', label: 'Hoje', value: stats.today }
          ].map((stat, i) => (
            <div key={i} className="p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${stat.color}-100 rounded-lg`}><stat.icon className={`w-5 h-5 text-${stat.color}-600`} /></div>
                <div><p className="text-sm text-gray-500">{stat.label}</p><p className="text-2xl font-bold">{stat.value}</p></div>
              </div>
            </div>
          ))}
        </div>

        {message && <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'} border`}>{message.text}</div>}

        <div className="p-6 bg-white rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Carregar Posts do Instagram</h2>
            <div className="flex gap-2">
              <button onClick={loadPosts} disabled={loadingPosts} className="flex items-center gap-2 px-4 py-2 text-white bg-pink-600 rounded-lg hover:bg-pink-700 disabled:opacity-50">
                {loadingPosts ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}{loadingPosts ? 'Carregando...' : 'Carregar Posts'}
              </button>
              <button onClick={runAutoImport} disabled={loading} className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}{loading ? 'Executando...' : 'Importar Posts de Hoje'}
              </button>
            </div>
          </div>
          {settings.instagram_profile_url ? <p className="text-sm text-gray-600">Perfil: <a href={settings.instagram_profile_url} target="_blank" className="text-pink-600 hover:underline">{settings.instagram_profile_url}</a></p> : <p className="text-sm text-amber-600">⚠️ Nenhum perfil configurado. <a href="/painel/noticias/instagram/configuracoes" className="underline">Configure</a></p>}
        </div>

        {posts.length > 0 && (
          <div className="p-6 bg-white rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">Posts: {filteredPosts.length}{filterMonth && <span className="text-sm font-normal text-gray-500 ml-2">(de {posts.length})</span>}</h2>
                <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="px-3 py-1.5 border rounded-lg text-sm">
                  <option value="">Todos os meses</option>
                  {getMonths().map(m => <option key={m.key} value={m.key}>{m.label} ({m.count})</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={selectAll} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">Selecionar Todos</button>
                <button onClick={deselectAll} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">Desmarcar</button>
                <button onClick={publishSelected} disabled={selectedPosts.size === 0 || publishing} className="flex items-center gap-2 px-4 py-1.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}Publicar ({selectedPosts.size})
                </button>
              </div>
            </div>

            {publishing && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex justify-between mb-2"><span className="text-sm font-medium text-blue-700">{publishProgress.status}</span><span className="text-sm text-blue-600">{publishProgress.current}/{publishProgress.total}</span></div>
                <div className="w-full bg-blue-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${(publishProgress.current / publishProgress.total) * 100}%` }} /></div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredPosts.map(post => {
                const isImported = importedIds.includes(post.id), isSelected = selectedPosts.has(post.id)
                return (
                  <div key={post.id} className={`relative rounded-lg border overflow-hidden ${isImported ? 'opacity-50' : ''} ${isSelected ? 'ring-2 ring-pink-500' : ''}`}>
                    <div className="absolute top-2 left-2 z-10"><input type="checkbox" checked={isSelected} disabled={isImported} onChange={() => toggleSelect(post.id)} className="w-5 h-5 rounded text-pink-600" /></div>
                    <div className="absolute top-2 right-2 z-10 px-2 py-1 text-xs bg-black/70 text-white rounded">{new Date(post.takenAtTimestamp * 1000).toLocaleDateString('pt-BR')}</div>
                    {isImported && <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10"><span className="px-3 py-1 text-sm bg-green-500 text-white rounded-full">✓ Importado</span></div>}
                    <img src={post.thumbnailSrc} alt="" className="w-full aspect-square object-cover" loading="lazy" />
                    <div className="p-2 bg-gray-50"><p className="text-xs text-gray-600 line-clamp-2">{post.caption || 'Sem legenda'}</p></div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {logs.length > 0 && (
          <div className="p-6 bg-white rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Importações Recentes</h2>
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left py-2 px-3">Data</th><th className="text-left py-2 px-3">Título</th><th className="text-left py-2 px-3">Status</th><th className="text-left py-2 px-3">Ações</th></tr></thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">{new Date(log.createdAt).toLocaleString('pt-BR')}</td>
                    <td className="py-2 px-3">{log.generatedTitle}</td>
                    <td className="py-2 px-3"><span className={`px-2 py-1 rounded-full text-xs ${log.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{log.status === 'published' ? 'Publicado' : 'Rascunho'}</span></td>
                    <td className="py-2 px-3">{log.newsId && <a href={`/painel/noticias/${log.newsId}/editar`} className="text-blue-600 hover:underline">Editar</a>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
