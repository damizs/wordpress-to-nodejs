import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  Instagram,
  ArrowLeft,
  Save,
  TestTube,
  CheckCircle,
  XCircle,
  FileText,
  Bot,
  Rocket,
  Cookie,
  BrainCircuit,
} from 'lucide-react'
import { useState } from 'react'
import { Button, Card, CardHeader, Field, Input, Select, Textarea } from '~/components/admin/ui'

interface Props {
  settings: Record<string, string | null>
  categories: Array<{ id: number; name: string }>
  defaultPrompt: string
}

export default function InstagramSettings({ settings, categories, defaultPrompt }: Props) {
  const [testingAi, setTestingAi] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const { data, setData, post, processing } = useForm({
    instagram_profile_url: settings.instagram_profile_url || '',
    instagram_sessionid: settings.instagram_sessionid || '',
    instagram_useragent: settings.instagram_useragent || '',
    rapidapi_key: settings.rapidapi_key || '',
    ai_provider: settings.ai_provider || 'gemini',
    ai_api_key: settings.ai_api_key || '',
    ai_model: settings.ai_model || 'gemini-2.0-flash',
    ai_prompt: settings.ai_prompt || defaultPrompt,
    default_category: settings.default_category || '',
    default_status: settings.default_status || 'draft',
    posts_fetch_count: settings.posts_fetch_count || '50',
    auto_import_enabled: settings.auto_import_enabled === 'true' || settings.auto_import_enabled === '1',
    auto_import_limit: settings.auto_import_limit || '5',
    cron_mode: settings.cron_mode || 'daily',
    cron_hour: settings.cron_hour || '19',
    cron_minute: settings.cron_minute || '0',
  })

  const getCsrfToken = () => {
    return document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1] || ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/painel/instagram/configuracoes', {
      data: {
        ...data,
        auto_import_enabled: data.auto_import_enabled ? 'true' : 'false',
      },
    })
  }

  const testAiConnection = async () => {
    setTestingAi(true)
    setTestResult(null)
    try {
      const response = await fetch('/painel/instagram/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': decodeURIComponent(getCsrfToken()) },
      })
      const result = await response.json()
      setTestResult({ success: result.success, message: result.message || result.error })
    } catch (error: any) {
      setTestResult({ success: false, message: error.message })
    } finally {
      setTestingAi(false)
    }
  }

  const aiModels: Record<string, Array<{ value: string; label: string }>> = {
    gemini: [
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (Recomendado)' },
      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    ],
    openai: [
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Recomendado)' },
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    ],
    claude: [
      { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Recomendado)' },
      { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
    ],
  }

  return (
    <AdminLayout>
      <Head title="Configurações Instagram" />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/painel/instagram"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="p-2 bg-navy text-white rounded-lg">
              <Instagram className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Configurações</h1>
              <p className="text-sm text-muted-foreground">Configure a automação do Instagram</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Publicação */}
          <Card>
            <CardHeader title="Publicação" icon={FileText} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Categoria Padrão">
                <Select
                  value={data.default_category}
                  onChange={e => setData('default_category', e.target.value)}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Status Padrão">
                <Select
                  value={data.default_status}
                  onChange={e => setData('default_status', e.target.value)}
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </Select>
              </Field>
              <Field label="Quantidade de Posts" hint="Quantos posts buscar (12-100)">
                <Input
                  type="number"
                  value={data.posts_fetch_count}
                  onChange={e => setData('posts_fetch_count', e.target.value)}
                  min="12"
                  max="100"
                />
              </Field>
            </div>
          </Card>

          {/* Importação Automática */}
          <Card>
            <CardHeader
              title="Importação Automática"
              description="Importa automaticamente os posts do Instagram feitos NO DIA, todos os dias no horário configurado (fuso de Brasília)."
              icon={Bot}
            />
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.auto_import_enabled}
                  onChange={e => setData('auto_import_enabled', e.target.checked)}
                  className="w-5 h-5 rounded border-border accent-[hsl(var(--navy))]"
                />
                <span className="font-medium text-foreground">Habilitar importação automática</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field
                  label="Modo de Execução"
                  error={
                    data.cron_mode === 'test'
                      ? 'Modo teste consome muitas requisições! Use apenas para testar.'
                      : undefined
                  }
                >
                  <Select value={data.cron_mode} onChange={e => setData('cron_mode', e.target.value)}>
                    <option value="daily">Diário (Produção) - 1x por dia</option>
                    <option value="test">Teste - A cada 2 minutos</option>
                  </Select>
                </Field>
                <Field label="Horário (Brasília)">
                  <div className="flex gap-2">
                    <Select
                      value={data.cron_hour}
                      onChange={e => setData('cron_hour', e.target.value)}
                      className="flex-1"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{String(i).padStart(2, '0')}h</option>
                      ))}
                    </Select>
                    <Select
                      value={data.cron_minute}
                      onChange={e => setData('cron_minute', e.target.value)}
                      className="flex-1"
                    >
                      {[0, 15, 30, 45].map(m => (
                        <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                      ))}
                    </Select>
                  </div>
                </Field>
                <Field label="Limite por Verificação" hint="Máx. 20 posts por execução">
                  <Input
                    type="number"
                    value={data.auto_import_limit}
                    onChange={e => setData('auto_import_limit', e.target.value)}
                    min="1"
                    max="20"
                  />
                </Field>
              </div>
            </div>
          </Card>

          {/* Perfil Instagram */}
          <Card>
            <CardHeader title="Perfil do Instagram" icon={Instagram} />
            <Field label="URL do Perfil">
              <Input
                type="url"
                value={data.instagram_profile_url}
                onChange={e => setData('instagram_profile_url', e.target.value)}
                placeholder="https://www.instagram.com/seu_perfil"
              />
            </Field>
          </Card>

          {/* RapidAPI */}
          <Card>
            <CardHeader
              title="RapidAPI (Recomendado)"
              description="Método mais confiável para buscar posts do Instagram."
              icon={Rocket}
            />
            <details className="mb-4 bg-navy/5 p-4 rounded-lg border border-navy/20">
              <summary className="cursor-pointer font-medium text-navy">
                Como obter a API Key do RapidAPI
              </summary>
              <ol className="mt-2 ml-4 text-sm text-foreground list-decimal space-y-1">
                <li>
                  Acesse{' '}
                  <a
                    href="https://rapidapi.com/social-api1-instagram/api/instagram-public-bulk-scraper"
                    target="_blank"
                    className="underline text-navy"
                  >
                    RapidAPI Instagram Public Bulk Scraper
                  </a>
                </li>
                <li>Crie uma conta gratuita ou faça login</li>
                <li>Clique em "Subscribe to Test" e escolha o plano Basic (gratuito)</li>
                <li>Copie sua API Key (X-RapidAPI-Key)</li>
                <li>Cole no campo abaixo</li>
              </ol>
            </details>
            <Field label="RapidAPI Key">
              <Input
                type="password"
                value={data.rapidapi_key}
                onChange={e => setData('rapidapi_key', e.target.value)}
                placeholder="Cole sua API Key aqui"
              />
            </Field>
          </Card>

          {/* Cookie Session (Alternativo) */}
          <Card>
            <CardHeader
              title="Autenticação Instagram (Alternativo)"
              description="Para buscar posts via cookie de sessão do Instagram."
              icon={Cookie}
            />
            <details className="mb-4 bg-muted/40 p-4 rounded-lg border border-border">
              <summary className="cursor-pointer font-medium text-foreground">
                Como obter o sessionid
              </summary>
              <ol className="mt-2 ml-4 text-sm text-muted-foreground list-decimal space-y-1">
                <li>Abra o Instagram no navegador e faça login</li>
                <li>Pressione F12 para abrir as Ferramentas do Desenvolvedor</li>
                <li>Vá para a aba Application (Chrome) ou Storage (Firefox)</li>
                <li>Clique em Cookies → instagram.com</li>
                <li>
                  Procure por <code className="bg-muted px-1 rounded">sessionid</code> e copie o valor
                </li>
              </ol>
              <p className="mt-2 text-xs text-destructive">O cookie expira a cada ~90 dias.</p>
            </details>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Session ID">
                <Input
                  type="password"
                  value={data.instagram_sessionid}
                  onChange={e => setData('instagram_sessionid', e.target.value)}
                  placeholder="Cole seu sessionid aqui"
                />
              </Field>
              <Field
                label="User-Agent"
                hint="Deve ser o mesmo do navegador onde pegou o sessionid"
              >
                <Input
                  type="text"
                  value={data.instagram_useragent}
                  onChange={e => setData('instagram_useragent', e.target.value)}
                  placeholder="Mozilla/5.0 ..."
                />
              </Field>
            </div>
          </Card>

          {/* Configurações de IA */}
          <Card>
            <CardHeader title="Inteligência Artificial" icon={BrainCircuit} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Field label="Provedor">
                <div className="space-y-2">
                  {[
                    { value: 'gemini', label: 'Google Gemini' },
                    { value: 'openai', label: 'OpenAI (GPT)' },
                    { value: 'claude', label: 'Anthropic Claude' },
                  ].map(provider => (
                    <label key={provider.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="ai_provider"
                        value={provider.value}
                        checked={data.ai_provider === provider.value}
                        onChange={e => setData('ai_provider', e.target.value)}
                        className="accent-[hsl(var(--navy))]"
                      />
                      <span className="text-sm text-foreground">{provider.label}</span>
                    </label>
                  ))}
                </div>
              </Field>
              <div>
                <Field label="API Key">
                  <Input
                    type="password"
                    value={data.ai_api_key}
                    onChange={e => setData('ai_api_key', e.target.value)}
                    placeholder="Sua chave de API"
                  />
                </Field>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={testAiConnection}
                  disabled={!data.ai_api_key}
                  loading={testingAi}
                >
                  {!testingAi && <TestTube className="w-4 h-4" />}
                  Testar Conexão
                </Button>
                {testResult && (
                  <div
                    className={`mt-2 flex items-center gap-2 text-sm ${
                      testResult.success ? 'text-emerald-600' : 'text-destructive'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {testResult.message}
                  </div>
                )}
              </div>
              <Field label="Modelo">
                <Select value={data.ai_model} onChange={e => setData('ai_model', e.target.value)}>
                  {(aiModels[data.ai_provider] || []).map(model => (
                    <option key={model.value} value={model.value}>{model.label}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="Prompt Personalizado">
              <Textarea
                value={data.ai_prompt}
                onChange={e => setData('ai_prompt', e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use <code className="bg-muted px-1 rounded">{'{CAPTION}'}</code> onde a legenda do
                Instagram deve ser inserida.
              </p>
            </Field>
          </Card>

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" loading={processing}>
              {!processing && <Save className="w-4 h-4" />}
              Salvar Configurações
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
