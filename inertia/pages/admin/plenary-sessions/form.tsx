import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Upload } from 'lucide-react'
import { useRef } from 'react'

interface Props {
  session: any | null
  sessionTypes: any[]
}

export default function PlenarySessionForm({ session, sessionTypes = [] }: Props) {
  const isEditing = !!session
  const { data, setData, post, processing } = useForm({
    title: session?.title || '',
    type: session?.type || 'ordinaria',
    session_date: session?.session_date || '',
    year: session?.year || new Date().getFullYear().toString(),
    start_time: session?.start_time || '',
    status: session?.status || 'realizada',
    agenda: session?.agenda || '',
    minutes: session?.minutes || '',
    video_url: session?.video_url || '',
    file: null as File | null,
  })

  const fileRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      post(`/painel/sessoes/${session.id}?_method=PUT`, { forceFormData: true })
    } else {
      post('/painel/sessoes', { forceFormData: true })
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Sessão' : 'Nova Sessão'}>
      <Head title={`${isEditing ? 'Editar' : 'Nova'} Sessão - Painel`} />

      <Link href="/painel/sessoes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 mb-2">Dados da Sessão</h2>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Título *</label>
            <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)}
              required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tipo</label>
              <select value={data.type} onChange={(e) => setData('type', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                {sessionTypes.map((t: any) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                {sessionTypes.length === 0 && <>
                  <option value="ordinaria">Ordinária</option>
                  <option value="extraordinaria">Extraordinária</option>
                  <option value="solene">Solene</option>
                  <option value="especial">Especial</option>
                </>}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data da Sessão *</label>
              <input type="date" value={data.session_date} onChange={(e) => {
                setData('session_date', e.target.value)
                if (e.target.value) setData('year', new Date(e.target.value).getFullYear().toString())
              }} required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
              <select value={data.status} onChange={(e) => setData('status', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                <option value="agendada">Agendada</option>
                <option value="realizada">Realizada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Horário de Início</label>
              <input type="time" value={data.start_time} onChange={(e) => setData('start_time', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">URL do Vídeo</label>
              <input type="url" value={data.video_url} onChange={(e) => setData('video_url', e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Pauta / Ordem do Dia</label>
            <textarea value={data.agenda} onChange={(e) => setData('agenda', e.target.value)}
              rows={3} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Ata (resumo)</label>
            <textarea value={data.minutes} onChange={(e) => setData('minutes', e.target.value)}
              rows={4} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Arquivo PDF (Ata digitalizada)</h2>
          {session?.file_url && (
            <p className="text-sm text-gray-500 mb-2">Arquivo atual: <a href={session.file_url} target="_blank" rel="noopener" className="text-blue-600 hover:underline">{session.file_url.split('/').pop()}</a></p>
          )}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4" /> Selecionar PDF
            </button>
            <span className="text-sm text-gray-400">{data.file?.name || 'Nenhum arquivo selecionado'}</span>
          </div>
          <input ref={fileRef} type="file" accept=".pdf" onChange={(e) => setData('file', e.target.files?.[0] || null)} className="hidden" />
        </div>

        <button type="submit" disabled={processing}
          className="flex items-center gap-2 px-6 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium disabled:opacity-50">
          <Save className="w-4 h-4" />
          {processing ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </AdminLayout>
  )
}
