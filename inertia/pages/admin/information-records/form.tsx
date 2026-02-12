import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Upload } from 'lucide-react'
import { useRef } from 'react'

interface Props {
  record: any | null
}

const categories = [
  { value: 'verbas', label: 'Verbas Indenizatórias' },
  { value: 'estagiarios', label: 'Estagiários' },
  { value: 'terceirizados', label: 'Terceirizados' },
  { value: 'rgf', label: 'RGF - Relatório Gestão Fiscal' },
  { value: 'relatorio-gestao', label: 'Relatório de Gestão Legislativa' },
  { value: 'prestacao-contas', label: 'Prestação de Contas' },
  { value: 'transferencias-recebidas', label: 'Transferências Recebidas' },
  { value: 'transferencias-realizadas', label: 'Transferências Realizadas' },
  { value: 'parecer-contas', label: 'Parecer das Contas' },
  { value: 'obras', label: 'Obras' },
  { value: 'acordos', label: 'Acordos e Convênios' },
  { value: 'apreciacao', label: 'Apreciação de Contas (PCA)' },
  { value: 'plano-estrategico', label: 'Plano Estratégico' },
  { value: 'concursos', label: 'Concursos' },
  { value: 'pca', label: 'Plano de Contratações Anual' },
  { value: 'estrutura-organizacional', label: 'Estrutura Organizacional' },
  { value: 'carta-servicos', label: 'Carta de Serviços' },
]

export default function InformationRecordForm({ record }: Props) {
  const isEditing = !!record
  const { data, setData, post, processing } = useForm({
    title: record?.title || '',
    category: record?.category || 'verbas',
    year: record?.year || new Date().getFullYear().toString(),
    content: record?.content || '',
    reference_date: record?.reference_date || '',
    is_active: record?.is_active ?? true,
    file: null as File | null,
  })

  const fileRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      post(`/painel/acesso-informacao/${record.id}?_method=PUT`, { forceFormData: true })
    } else {
      post('/painel/acesso-informacao', { forceFormData: true })
    }
  }

  return (
    <AdminLayout title={isEditing ? 'Editar Registro' : 'Novo Registro'}>
      <Head title={`${isEditing ? 'Editar' : 'Novo'} Registro - Painel`} />

      <Link href="/painel/acesso-informacao" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800 mb-2">Dados do Registro</h2>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Título *</label>
            <input type="text" value={data.title} onChange={(e) => setData('title', e.target.value)}
              required className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Categoria *</label>
              <select value={data.category} onChange={(e) => setData('category', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none">
                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Ano *</label>
              <input type="number" value={data.year} onChange={(e) => setData('year', e.target.value)}
                required min="2000" max="2030"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Data de Referência</label>
              <input type="date" value={data.reference_date} onChange={(e) => setData('reference_date', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Conteúdo / Descrição</label>
            <textarea value={data.content} onChange={(e) => setData('content', e.target.value)}
              rows={5} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={data.is_active}
              onChange={(e) => setData('is_active', e.target.checked)}
              className="rounded border-gray-300 text-navy focus:ring-navy" />
            <span className="text-sm text-gray-600">Ativo</span>
          </label>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Arquivo PDF</h2>
          {record?.file_url && (
            <p className="text-sm text-gray-500 mb-2">Arquivo atual: <a href={record.file_url} target="_blank" rel="noopener" className="text-blue-600 hover:underline">{record.file_url.split('/').pop()}</a></p>
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
