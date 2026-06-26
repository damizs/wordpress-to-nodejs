import { Head, useForm, Link } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Save, ArrowLeft, FileText, Link2, Calendar } from 'lucide-react'
import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  PageHeader,
  Select,
} from '~/components/admin/ui'
import RichTextEditor from '~/components/admin/RichTextEditor'

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
    file_url: session?.file_url || '',
    voting_system_id: session?.voting_system_id || session?.votingSystemId || '',
    voting_system_url: session?.voting_system_url || session?.votingSystemUrl || '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEditing) {
      post(`/painel/sessoes/${session.id}?_method=PUT`)
    } else {
      post('/painel/sessoes')
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

      <PageHeader
        title={isEditing ? 'Editar Sessão Plenária' : 'Nova Sessão Plenária'}
        description={
          isEditing
            ? 'Atualize os dados da sessão.'
            : 'Preencha os campos abaixo para registrar uma nova sessão.'
        }
        icon={Calendar}
        eyebrow="Sessões Plenárias"
      />

      <form onSubmit={handleSubmit} className="admin-form">
        <Card>
          <CardHeader title="Dados da Sessão" icon={FileText} />

          <div className="space-y-5">
            <Field label="Título" required>
              <Input
                type="text"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                required
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <Field label="Tipo">
                <Select value={data.type} onChange={(e) => setData('type', e.target.value)}>
                  {sessionTypes.map((t: any) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name}
                    </option>
                  ))}
                  {sessionTypes.length === 0 && (
                    <>
                      <option value="ordinaria">Ordinária</option>
                      <option value="extraordinaria">Extraordinária</option>
                      <option value="solene">Solene</option>
                      <option value="especial">Especial</option>
                    </>
                  )}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

            <Field label="URL do PDF da sessão">
              <Input
                type="url"
                value={data.file_url}
                onChange={(e) => setData('file_url', e.target.value)}
                placeholder="https://..."
              />
            </Field>

            <Field label="Pauta / resumo da sessão">
              <RichTextEditor
                value={data.agenda || ''}
                onChange={(html) => setData('agenda', html)}
                minHeight={220}
              />
            </Field>

            <Field label="Ata / minuta / observações">
              <RichTextEditor
                value={data.minutes || ''}
                onChange={(html) => setData('minutes', html)}
                minHeight={240}
              />
            </Field>

            <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 border border-border">
              As <strong>Atas</strong> e <strong>Pautas</strong> agora são módulos próprios
              (menu Legislativo). Cadastre-as separadamente em "Atas" e "Pautas".
            </p>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Integração com sistema de votação"
            description="Campos de conciliação para quando a API do sistema de votação for definida."
            icon={Link2}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="ID da sessão no sistema de votação">
              <Input
                type="text"
                value={data.voting_system_id}
                onChange={(e) => setData('voting_system_id', e.target.value)}
                placeholder="Ex.: 12345"
              />
            </Field>
            <Field label="URL da sessão no sistema de votação">
              <Input
                type="url"
                value={data.voting_system_url}
                onChange={(e) => setData('voting_system_url', e.target.value)}
                placeholder="https://..."
              />
            </Field>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={processing}>
            {!processing && <Save className="w-4 h-4" />}
            {processing ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
