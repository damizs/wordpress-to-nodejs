import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  Instagram,
  Save,
  TestTube,
  ArrowLeft,
  Key,
  Bot,
  Clock,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  Field,
  IconLink,
  Input,
  Select,
  Textarea,
} from '~/components/admin/ui'

/**
 * Campo de segredo (API key / sessionid) com botão de mostrar/ocultar
 * (olho Eye/EyeOff). Recebe `id`/`aria-*` do <Field> (via cloneElement) e os
 * repassa ao <Input>. `wrapperClassName` permite o campo crescer (flex-1)
 * quando dividido com um botão ao lado. Botão type="button" (não submete).
 */
function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  wrapperClassName = '',
  ...aria
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  wrapperClassName?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className={`relative ${wrapperClassName}`.trim()}>
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-11"
        {...aria}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar chave' : 'Mostrar chave'}
        aria-pressed={visible}
        title={visible ? 'Ocultar chave' : 'Mostrar chave'}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-navy/25"
      >
        {visible ? (
          <EyeOff className="w-4 h-4" aria-hidden="true" />
        ) : (
          <Eye className="w-4 h-4" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}

interface Props {
  settings: Record<string, string | null>
  categories: { id: number; name: string }[]
  aiProviders: { value: string; label: string }[]
  aiModels: Record<string, { value: string; label: string }[]>
  defaultPrompt: string
}

export default function InstagramSettings({ settings, categories, aiProviders, aiModels, defaultPrompt }: Props) {
  const [testingAi, setTestingAi] = useState(false)
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const { data, setData, post, processing } = useForm({
    instagram_profile_url: settings.instagram_profile_url || '',
    instagram_scraper_provider: settings.instagram_scraper_provider || 'public',
    instagram_sessionid: settings.instagram_sessionid || '',
    instagram_useragent: settings.instagram_useragent || '',
    rapidapi_key: settings.rapidapi_key || '',
    ai_provider: settings.ai_provider || 'deepseek',
    ai_api_key: settings.ai_api_key || '',
    ai_model: settings.ai_model || 'deepseek-chat',
    ai_prompt: settings.ai_prompt || defaultPrompt || '',
    default_category: settings.default_category || '',
    default_status: settings.default_status || 'draft',
    posts_fetch_count: settings.posts_fetch_count || '50',
    auto_import_enabled: settings.auto_import_enabled === '1' || settings.auto_import_enabled === 'true',
    auto_import_limit: settings.auto_import_limit || '5',
    cron_mode: settings.cron_mode || 'daily',
    cron_hour: settings.cron_hour || '19',
    cron_minute: settings.cron_minute || '0',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/painel/noticias/instagram/configuracoes')
  }

  const testAiConnection = async () => {
    setTestingAi(true)
    setAiTestResult(null)
    try {
      const response = await fetch('/painel/noticias/instagram/test-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || '',
        },
      })
      const result = await response.json()
      setAiTestResult({ success: result.success, message: result.message || result.error })
    } catch (error: any) {
      setAiTestResult({ success: false, message: error.message })
    } finally {
      setTestingAi(false)
    }
  }

  const currentModels = aiModels[data.ai_provider] || []

  return (
    <AdminLayout>
      <Head title="Configurações - Instagram" />
      <div className="w-full min-w-0 space-y-6">
        <div className="flex items-center gap-4">
          <IconLink href="/painel/noticias/instagram" tone="neutral" title="Voltar">
            <ArrowLeft className="w-5 h-5" />
          </IconLink>
          <Instagram className="w-8 h-8 text-pink-500" />
          <h1 className="text-2xl font-bold text-foreground">Configurações do Instagram</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Perfil */}
          <Card>
            <CardHeader icon={Instagram} title="Perfil do Instagram" />
            <div className="space-y-4">
              <Field label="URL do Perfil">
                <Input type="url" value={data.instagram_profile_url} onChange={e => setData('instagram_profile_url', e.target.value)} placeholder="https://www.instagram.com/seu_perfil" />
              </Field>
              <Field label="Modo de captura" hint="O padrão usa o scraper próprio do portal, sem depender da RapidAPI. Use fallback externo só se escolher manualmente.">
                <Select value={data.instagram_scraper_provider} onChange={e => setData('instagram_scraper_provider', e.target.value)}>
                  <option value="public">Scraper próprio do portal</option>
                  <option value="auto">Scraper próprio + fallback RapidAPI</option>
                  <option value="rapidapi">Somente RapidAPI</option>
                </Select>
              </Field>
            </div>
          </Card>

          {/* RapidAPI */}
          <Card>
            <CardHeader
              icon={Key}
              title="RapidAPI (opcional)"
              description="Alternativa externa/legada. O portal não depende dela quando o modo de captura está em scraper próprio."
            />
            <details className="mb-4 p-4 bg-muted rounded-lg border border-border">
              <summary className="flex items-center gap-1.5 cursor-pointer font-medium text-navy">
                <BookOpen className="w-4 h-4" /> Como obter a API Key
              </summary>
              <ol className="mt-2 ml-4 text-sm space-y-1 list-decimal text-foreground">
                <li>Acesse <a href="https://rapidapi.com/social-api1-instagram/api/instagram-public-bulk-scraper" target="_blank" className="text-navy underline">RapidAPI Instagram Scraper</a></li>
                <li>Crie conta gratuita ou faça login</li>
                <li>Clique em "Subscribe to Test" → plano Basic (gratuito)</li>
                <li>Copie a X-RapidAPI-Key</li>
              </ol>
            </details>
            <Field label="RapidAPI Key">
              <PasswordInput value={data.rapidapi_key} onChange={value => setData('rapidapi_key', value)} placeholder="Cole sua API Key" />
            </Field>
          </Card>

          {/* Cookie (Alternativo) */}
          <Card>
            <CardHeader title="Autenticação Instagram (Alternativo)" />
            <details className="mb-4 p-4 bg-muted rounded-lg">
              <summary className="flex items-center gap-1.5 cursor-pointer font-medium text-foreground">
                <BookOpen className="w-4 h-4" /> Como obter o sessionid
              </summary>
              <ol className="mt-2 ml-4 text-sm space-y-1 list-decimal text-foreground">
                <li>Abra Instagram no navegador e faça login</li>
                <li>Pressione F12 → Application → Cookies → instagram.com</li>
                <li>Copie o valor de "sessionid"</li>
              </ol>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-amber-700">
                <AlertTriangle className="w-4 h-4 shrink-0" /> O cookie expira a cada ~90 dias
              </p>
            </details>
            <div className="space-y-4">
              <Field label="Session ID">
                <PasswordInput value={data.instagram_sessionid} onChange={value => setData('instagram_sessionid', value)} placeholder="Cole seu sessionid" />
              </Field>
              <Field label="User-Agent" hint="Mesmo do navegador onde pegou o sessionid. Console → navigator.userAgent">
                <Input type="text" value={data.instagram_useragent} onChange={e => setData('instagram_useragent', e.target.value)} placeholder="Mozilla/5.0..." />
              </Field>
            </div>
          </Card>

          {/* IA */}
          <Card>
            <CardHeader icon={Bot} title="Configuração de IA" />
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="Provedor de IA">
                <Select value={data.ai_provider} onChange={e => { setData('ai_provider', e.target.value); setData('ai_model', aiModels[e.target.value]?.[0]?.value || '') }}>
                  {aiProviders.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </Select>
              </Field>
              <Field label="Modelo">
                <Select value={data.ai_model} onChange={e => setData('ai_model', e.target.value)}>
                  {currentModels.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </Select>
              </Field>
            </div>
            <div className="mb-4">
              <Field label="API Key">
                <div className="flex gap-2">
                  <PasswordInput value={data.ai_api_key} onChange={value => setData('ai_api_key', value)} placeholder="Cole sua API Key" wrapperClassName="flex-1" />
                  <Button type="button" variant="secondary" onClick={testAiConnection} loading={testingAi}>
                    {!testingAi && <TestTube className="w-4 h-4" />}
                    Testar
                  </Button>
                </div>
              </Field>
              {aiTestResult && (
                <p
                  className={`flex items-center gap-1.5 text-sm mt-2 ${aiTestResult.success ? 'text-emerald-700' : 'text-destructive'}`}
                >
                  {aiTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0" />
                  )}
                  {aiTestResult.message}
                </p>
              )}
            </div>
            <Field label="Prompt Personalizado (opcional)">
              <Textarea value={data.ai_prompt} onChange={e => setData('ai_prompt', e.target.value)} rows={8} placeholder="Use {CAPTION} para inserir a legenda do Instagram." className="font-mono" />
            </Field>
          </Card>

          {/* Publicação */}
          <Card>
            <CardHeader title="Publicação" />
            <div className="grid grid-cols-3 gap-4">
              <Field label="Categoria Padrão">
                <Select value={data.default_category} onChange={e => setData('default_category', e.target.value)}>
                  <option value="">Nenhuma</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="Status Padrão">
                <Select value={data.default_status} onChange={e => setData('default_status', e.target.value)}>
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </Select>
              </Field>
              <Field label="Posts por Busca">
                <Input type="number" min="12" max="100" value={data.posts_fetch_count} onChange={e => setData('posts_fetch_count', e.target.value)} />
              </Field>
            </div>
          </Card>

          {/* Importação Automática */}
          <Card>
            <CardHeader
              icon={Clock}
              title="Importação Automática"
              description="Importa os posts do dia no horário configurado (fuso de Brasília). O feed e os Reels também são atualizados 1×/dia nesse horário — roda dentro do próprio app, sem cron externo."
            />
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={data.auto_import_enabled} onChange={e => setData('auto_import_enabled', e.target.checked)} className="w-4 h-4 rounded accent-navy" />
                <span className="font-medium text-foreground">Habilitar importação automática</span>
              </label>
              <p className="text-xs text-muted-foreground -mt-1">
                Com a importação desligada, o app ainda atualiza o feed e os Reels 1×/dia no horário abaixo.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Modo">
                  <Select value={data.cron_mode} onChange={e => setData('cron_mode', e.target.value)}>
                    <option value="daily">Diário (Produção)</option>
                    <option value="test">Teste (a cada ~30 min)</option>
                  </Select>
                  {data.cron_mode === 'test' && (
                    <p className="flex items-center gap-1.5 text-xs text-destructive mt-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Use apenas para testes!
                    </p>
                  )}
                </Field>
                <Field label="Horário">
                  <div className="flex gap-1">
                    <Select value={data.cron_hour} onChange={e => setData('cron_hour', e.target.value)} className="flex-1">
                      {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{String(i).padStart(2, '0')}h</option>)}
                    </Select>
                    <Select value={data.cron_minute} onChange={e => setData('cron_minute', e.target.value)} className="flex-1">
                      {[0, 15, 30, 45].map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                    </Select>
                  </div>
                </Field>
                <Field label="Limite por Execução">
                  <Input type="number" min="1" max="20" value={data.auto_import_limit} onChange={e => setData('auto_import_limit', e.target.value)} />
                </Field>
              </div>
            </div>
          </Card>

          <Button type="submit" loading={processing}>
            {!processing && <Save className="w-4 h-4" />}
            Salvar Configurações
          </Button>
        </form>
      </div>
    </AdminLayout>
  )
}
