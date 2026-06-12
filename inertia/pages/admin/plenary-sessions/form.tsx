import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, Upload, FileText, Paperclip } from 'lucide-react'
import { useRef } from 'react'
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Select,
  Textarea,
} from '~/components/admin/ui'

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

      <Link
        href="/painel/sessoes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <Card>
          <CardHeader title="Dados da Sessão" icon={FileText} />

          <div className="space-y-4">
            <Field label="Título" required>
              <Input
                type="text"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                required
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Tipo">
                <Select value={data.type} onChange={(e) => setData('type', e.target.value)}>
                  {sessionTypes.map((t: any) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
                  {sessionTypes.length === 0 && <>
                    <option value="ordinaria">Ordinária</option>
                    <option value="extraordinaria">Extraordinária</option>
                    <option value="solene">Solene</option>
                    <option value="especial">Especial</option>
                  </>}
                </Select>
              </Field>
              <Field label="Data da Sessão" required>
                <Input
                  type="date"
                  value={data.session_date}
                  onChange={(e) => {
                    setData('session_date', e.target.value)
                    if (e.target.value) setData('year', new Date(e.target.value).getFullYear().toString())
                  }}
                  required
                />
              </Field>
              <Field label="Status">
                <Select value={data.status} onChange={(e) => setData('status', e.target.value)}>
                  <option value="agendada">Agendada</option>
                  <option value="realizada">Realizada</option>
                  <option value="cancelada">Cancelada</option>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Horário de Início">
                <Input
                  type="time"
                  value={data.start_time}
                  onChange={(e) => setData('start_time', e.target.value)}
                />
              </Field>
              <Field label="URL do Vídeo">
                <Input
                  type="url"
                  value={data.video_url}
                  onChange={(e) => setData('video_url', e.target.value)}
                  placeholder="https://youtube.com/..."
                />
              </Field>
            </div>

            <Field label="Pauta / Ordem do Dia">
              <Textarea
                value={data.agenda}
                onChange={(e) => setData('agenda', e.target.value)}
                rows={3}
              />
            </Field>

            <Field label="Ata (resumo)">
              <Textarea
                value={data.minutes}
                onChange={(e) => setData('minutes', e.target.value)}
                rows={4}
              />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="Arquivo PDF (Ata digitalizada)" icon={Paperclip} />
          {session?.file_url && (
            <p className="text-sm text-muted-foreground mb-2">
              Arquivo atual:{' '}
              <a href={session.file_url} target="_blank" rel="noopener" className="text-navy hover:underline">
                {session.file_url.split('/').pop()}
              </a>
            </p>
          )}
          <div className="flex items-center gap-3">
            <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4" /> Selecionar PDF
            </Button>
            <span className="text-sm text-muted-foreground">
              {data.file?.name || 'Nenhum arquivo selecionado'}
            </span>
          </div>
          <input ref={fileRef} type="file" accept=".pdf" onChange={(e) => setData('file', e.target.files?.[0] || null)} className="hidden" />
        </Card>

        <Button type="submit" loading={processing}>
          {!processing && <Save className="w-4 h-4" />}
          {processing ? 'Salvando...' : 'Salvar'}
        </Button>
      </form>
    </AdminLayout>
  )
}
