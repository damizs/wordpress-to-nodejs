import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  Activity,
  AlertTriangle,
  Cloud,
  Database,
  Eye,
  EyeOff,
  HardDrive,
  Lock,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  Terminal,
  Wifi,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import {
  AdminPage,
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  PageHeader,
  Select,
  StatCard,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Textarea,
} from '~/components/admin/ui'

interface ProviderStatus {
  target: string
  status: 'ok' | 'failed' | 'skipped'
  message?: string
}

interface BackupItem {
  id: number
  status: 'running' | 'success' | 'partial' | 'failed'
  trigger: string
  startedAt: string | null
  finishedAt: string | null
  localPath: string | null
  databasePath: string | null
  uploadsPath: string | null
  sizeBytes: number
  providers: ProviderStatus[]
  error: string | null
}

interface SecurityEvent {
  id: number
  level: 'info' | 'warning' | 'danger'
  type: string
  action: 'observe' | 'block' | 'allow'
  ip: string | null
  method: string | null
  path: string | null
  message: string | null
  createdAt: string | null
}

interface EvolutionSettings {
  enabled: boolean
  baseUrl: string
  instance: string
  apiKeySet: boolean
  recipients: string
  reportFrequencyDays: number
  reportMessage: string
  alertLoginEnabled: boolean
  alertFirewallEnabled: boolean
  alertBackupEnabled: boolean
  lastReportAt: string | null
}

interface EvolutionState {
  ok: boolean
  state: string | null
  error: string | null
}

interface NotificationItem {
  id: number
  type: string
  status: 'pending' | 'success' | 'failed' | 'skipped'
  recipient: string | null
  message: string | null
  error: string | null
  sentAt: string | null
  createdAt: string | null
}

interface Props {
  firewall: {
    enabled: string
    mode: string
    blockedIps: string
    allowedIps: string
    blockedPaths: string
    eventCount: number
    blockedCount: number
  }
  backupEnv: {
    localDir: string
    rcloneTargets: string[]
    hasRcloneTargets: boolean
    pgDumpConfigured: boolean
  }
  evolution: EvolutionSettings
  evolutionState: EvolutionState
  backups: BackupItem[]
  events: SecurityEvent[]
  notifications: NotificationItem[]
}

function formatDate(value: string | null) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatBytes(value: number) {
  if (!value) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = value
  let unit = 0
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit += 1
  }
  return `${size.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`
}

function statusTone(status: string) {
  if (status === 'success' || status === 'ok') return 'success'
  if (status === 'partial' || status === 'warning') return 'warning'
  if (status === 'failed' || status === 'danger' || status === 'block') return 'danger'
  return 'neutral'
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    success: 'Concluido',
    partial: 'Parcial',
    failed: 'Falhou',
    running: 'Rodando',
    pending: 'Pendente',
    skipped: 'Ignorado',
    block: 'Bloqueado',
    observe: 'Monitorado',
    ok: 'OK',
  }
  return labels[status] ?? status
}

function notificationTypeLabel(type: string) {
  const labels: Record<string, string> = {
    report: 'Relatorio',
    test: 'Teste',
    login: 'Login',
    firewall: 'Firewall',
    backup: 'Backup',
    health: 'Conexao',
  }
  return labels[type] ?? type
}

/**
 * Campo de segredo (API key) com botão de mostrar/ocultar (olho Eye/EyeOff).
 * Recebe `id`/`aria-*` do <Field> (via cloneElement) e os repassa ao <Input>.
 * O botão é type="button" (não submete o form) e tem aria-label dinâmico.
 */
function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  ...aria
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
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

export default function AdminSecurityIndex({
  firewall,
  backupEnv,
  evolution,
  evolutionState,
  backups,
  events,
  notifications,
}: Props) {
  const [runningBackup, setRunningBackup] = useState(false)
  const [testingEvolution, setTestingEvolution] = useState(false)
  const [sendingReport, setSendingReport] = useState(false)
  const form = useForm({
    enabled: firewall.enabled !== 'false',
    mode: firewall.mode === 'monitor' ? 'monitor' : 'block',
    blocked_ips: firewall.blockedIps || '',
    allowed_ips: firewall.allowedIps || '',
    blocked_paths: firewall.blockedPaths || '',
  })
  const evolutionForm = useForm({
    enabled: evolution.enabled,
    base_url: evolution.baseUrl || '',
    instance: evolution.instance || '',
    api_key: '',
    recipients: evolution.recipients || '',
    report_frequency_days: String(evolution.reportFrequencyDays || 15),
    report_message: evolution.reportMessage || '',
    alert_login_enabled: evolution.alertLoginEnabled,
    alert_firewall_enabled: evolution.alertFirewallEnabled,
    alert_backup_enabled: evolution.alertBackupEnabled,
  })

  function submitFirewall(event: FormEvent) {
    event.preventDefault()
    form.post('/painel/seguranca/firewall', { preserveScroll: true })
  }

  function runBackup() {
    router.post(
      '/painel/seguranca/backups/run',
      {},
      {
        preserveScroll: true,
        onStart: () => setRunningBackup(true),
        onFinish: () => setRunningBackup(false),
      }
    )
  }

  function submitEvolution(event: FormEvent) {
    event.preventDefault()
    evolutionForm.post('/painel/seguranca/evolution', { preserveScroll: true })
  }

  function testEvolution() {
    router.post(
      '/painel/seguranca/evolution/test',
      {},
      {
        preserveScroll: true,
        onStart: () => setTestingEvolution(true),
        onFinish: () => setTestingEvolution(false),
      }
    )
  }

  function sendReportNow() {
    router.post(
      '/painel/seguranca/evolution/relatorio',
      {},
      {
        preserveScroll: true,
        onStart: () => setSendingReport(true),
        onFinish: () => setSendingReport(false),
      }
    )
  }

  const lastBackup = backups[0]

  return (
    <AdminLayout title="Seguranca e backups">
      <Head title="Seguranca e backups - Painel" />

      <AdminPage>
        <PageHeader
          title="Segurança e Backups"
          description="Firewall de aplicação, auditoria de eventos e backups locais com envio externo."
          icon={ShieldCheck}
          eyebrow="Sistema"
          variant="hero"
          actions={
            <Button onClick={runBackup} loading={runningBackup} variant="gold">
              <RefreshCw className="w-4 h-4" />
              Gerar backup agora
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5 mb-6">
          <StatCard
            label="Firewall"
            value={form.data.enabled ? 'Ativo' : 'Inativo'}
            icon={ShieldCheck}
            hint={form.data.mode === 'block' ? 'Bloqueando ameacas' : 'Somente monitorando'}
          />
          <StatCard
            label="Eventos"
            value={firewall.eventCount}
            icon={Activity}
            hint={`${firewall.blockedCount} bloqueio(s) registrados`}
          />
          <StatCard
            label="Ultimo backup"
            value={lastBackup ? statusLabel(lastBackup.status) : 'Nenhum'}
            icon={Database}
            hint={lastBackup ? formatDate(lastBackup.startedAt) : 'Ainda sem execucao'}
          />
          <StatCard
            label="Nuvem"
            value={backupEnv.hasRcloneTargets ? 'Configurada' : 'Pendente'}
            icon={Cloud}
            hint={backupEnv.rcloneTargets.length ? backupEnv.rcloneTargets.join(', ') : 'Drive/Dropbox via rclone'}
          />
          <StatCard
            label="WhatsApp"
            value={evolution.enabled ? (evolutionState.ok ? 'Online' : 'Ajustar') : 'Inativo'}
            icon={MessageCircle}
            hint={
              evolution.enabled
                ? evolutionState.error || `Estado: ${evolutionState.state || 'desconhecido'}`
                : 'Evolution API desativada'
            }
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <Card>
            <CardHeader
              title="Firewall de aplicacao"
              description="Bloqueia sondagens comuns e permite regras manuais por IP ou caminho."
              icon={Lock}
            />

            <form onSubmit={submitFirewall} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
                  <input
                    type="checkbox"
                    checked={form.data.enabled}
                    onChange={(event) => form.setData('enabled', event.currentTarget.checked)}
                    className="h-4 w-4 accent-navy"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Firewall ativo</span>
                    <span className="block text-xs text-muted-foreground">
                      Mantem as regras em tempo real para novas requisicoes.
                    </span>
                  </span>
                </label>

                <Field label="Modo">
                  <Select value={form.data.mode} onChange={(event) => form.setData('mode', event.target.value)}>
                    <option value="block">Bloquear e registrar</option>
                    <option value="monitor">Somente monitorar</option>
                  </Select>
                </Field>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <Field
                  label="IPs bloqueados"
                  hint="Um por linha. Use 192.168.0.* para prefixo."
                >
                  <Textarea
                    value={form.data.blocked_ips}
                    onChange={(event) => form.setData('blocked_ips', event.target.value)}
                    placeholder="203.0.113.10"
                  />
                </Field>
                <Field label="IPs liberados" hint="Sempre passam pelo firewall.">
                  <Textarea
                    value={form.data.allowed_ips}
                    onChange={(event) => form.setData('allowed_ips', event.target.value)}
                    placeholder="127.0.0.1"
                  />
                </Field>
                <Field label="Trechos de URL bloqueados" hint="Ex.: /rota-temporaria">
                  <Textarea
                    value={form.data.blocked_paths}
                    onChange={(event) => form.setData('blocked_paths', event.target.value)}
                    placeholder="/wp-admin"
                  />
                </Field>
              </div>

              <div className="flex justify-end">
                <Button type="submit" loading={form.processing}>
                  Salvar firewall
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <CardHeader
              title="Backup geral"
              description="Gera dump do banco e pacote do site. Envio externo usa rclone no servidor."
              icon={HardDrive}
            />

            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="font-semibold text-foreground">Pasta local</p>
                <p className="mt-1 break-all text-muted-foreground">{backupEnv.localDir}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="font-semibold text-foreground">Banco de dados</p>
                <Badge tone={backupEnv.pgDumpConfigured ? 'success' : 'warning'}>
                  {backupEnv.pgDumpConfigured ? 'Variaveis configuradas' : 'Verificar variaveis DB_*'}
                </Badge>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="font-semibold text-foreground">Google Drive / Dropbox</p>
                {backupEnv.rcloneTargets.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {backupEnv.rcloneTargets.map((target) => (
                      <Badge key={target} tone="info">
                        {target}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-muted-foreground">
                    Configure BACKUP_RCLONE_TARGETS no servidor, por exemplo:
                    gdrive:camara-sume,dropbox:camara-sume
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="font-semibold text-foreground">Agendamento recomendado</p>
                <p className="mt-1 text-muted-foreground">
                  Rodar <code className="rounded bg-card px-1.5 py-0.5">node ace backup:run</code> diariamente.
                </p>
              </div>
            </div>
          </Card>

          <Card className="xl:col-span-2">
            <CardHeader
              title="Alertas WhatsApp"
              description="Integra a Evolution API para relatorios quinzenais e alertas criticos."
              icon={MessageCircle}
              actions={
                <Badge tone={evolution.enabled && evolutionState.ok ? 'success' : evolution.enabled ? 'warning' : 'neutral'}>
                  {evolution.enabled
                    ? evolutionState.ok
                      ? 'Conectado'
                      : evolutionState.state || 'Verificar'
                    : 'Desativado'}
                </Badge>
              }
            />

            <form onSubmit={submitEvolution} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
                  <input
                    type="checkbox"
                    checked={evolutionForm.data.enabled}
                    onChange={(event) => evolutionForm.setData('enabled', event.currentTarget.checked)}
                    className="h-4 w-4 accent-navy"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">Evolution ativa</span>
                    <span className="block text-xs text-muted-foreground">
                      Libera testes, relatorios e alertas.
                    </span>
                  </span>
                </label>

                <Field label="URL da Evolution">
                  <Input
                    value={evolutionForm.data.base_url}
                    onChange={(event) => evolutionForm.setData('base_url', event.target.value)}
                    placeholder="https://evolution.seudominio.com"
                  />
                </Field>

                <Field label="Instancia">
                  <Input
                    value={evolutionForm.data.instance}
                    onChange={(event) => evolutionForm.setData('instance', event.target.value)}
                    placeholder="camara-sume"
                  />
                </Field>

                <Field
                  label="API key"
                  hint={evolution.apiKeySet ? 'Chave cadastrada. Preencha apenas para trocar.' : 'Cole a chave da Evolution.'}
                >
                  <PasswordInput
                    value={evolutionForm.data.api_key}
                    onChange={(value) => evolutionForm.setData('api_key', value)}
                    placeholder={evolution.apiKeySet ? '********' : 'apikey'}
                  />
                </Field>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <Field label="Numeros destinatarios" hint="Um por linha. Use DDI+DDD+numero, ex.: 5583999999999.">
                  <Textarea
                    value={evolutionForm.data.recipients}
                    onChange={(event) => evolutionForm.setData('recipients', event.target.value)}
                    placeholder="5583999999999"
                    className="min-h-[150px]"
                  />
                </Field>

                <Field
                  label="Mensagem do relatorio"
                  hint="Variaveis: {data}, {periodo}, {eventos_seguranca}, {bloqueios}, {ultimo_backup}, {url_painel}."
                >
                  <Textarea
                    value={evolutionForm.data.report_message}
                    onChange={(event) => evolutionForm.setData('report_message', event.target.value)}
                    className="min-h-[150px] font-mono text-xs"
                  />
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Frequencia do relatorio">
                  <Input
                    type="number"
                    min={1}
                    value={evolutionForm.data.report_frequency_days}
                    onChange={(event) =>
                      evolutionForm.setData('report_frequency_days', event.target.value)
                    }
                  />
                </Field>

                {[
                  ['alert_login_enabled', 'Login suspeito'],
                  ['alert_firewall_enabled', 'Bloqueios do firewall'],
                  ['alert_backup_enabled', 'Falhas de backup'],
                ].map(([field, label]) => (
                  <label
                    key={field}
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(evolutionForm.data[field as keyof typeof evolutionForm.data])}
                      onChange={(event) =>
                        evolutionForm.setData(
                          field as 'alert_login_enabled' | 'alert_firewall_enabled' | 'alert_backup_enabled',
                          event.currentTarget.checked
                        )
                      }
                      className="h-4 w-4 accent-navy"
                    />
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                  </label>
                ))}
              </div>

              {evolutionState.error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {evolutionState.error}
                </div>
              )}

              <div className="flex flex-wrap justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Agende <code className="rounded bg-muted px-1.5 py-0.5">node ace evolution:alerts</code> diariamente.
                  O comando envia apenas quando o periodo vencer.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={testEvolution} loading={testingEvolution}>
                    <Send className="w-4 h-4" />
                    Testar envio
                  </Button>
                  <Button type="button" variant="secondary" onClick={sendReportNow} loading={sendingReport}>
                    <Wifi className="w-4 h-4" />
                    Relatorio agora
                  </Button>
                  <Button type="submit" loading={evolutionForm.processing}>
                    Salvar alertas
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-2 mt-6">
          <Card padding={false}>
            <div className="p-5 lg:p-6">
              <CardHeader
                title="Historico de backups"
                description="Ultimas execucoes locais e externas."
                icon={Terminal}
              />
            </div>
            <Table className="border-0 rounded-none shadow-none" scrollLabel="Historico de backups">
              <THead>
                <TH>Status</TH>
                <TH>Data</TH>
                <TH>Tamanho</TH>
                <TH>Destino externo</TH>
              </THead>
              <TBody>
                {backups.map((backup) => (
                  <TR key={backup.id}>
                    <TD>
                      <Badge tone={statusTone(backup.status) as any}>{statusLabel(backup.status)}</Badge>
                    </TD>
                    <TD>
                      <p className="text-sm">{formatDate(backup.startedAt)}</p>
                      {backup.localPath && (
                        <p className="mt-1 max-w-[240px] truncate text-xs text-muted-foreground">
                          {backup.localPath}
                        </p>
                      )}
                    </TD>
                    <TD>{formatBytes(backup.sizeBytes)}</TD>
                    <TD>
                      {backup.providers.length === 0 ? (
                        <Badge>Local</Badge>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {backup.providers.map((provider) => (
                            <Badge key={`${backup.id}-${provider.target}`} tone={statusTone(provider.status) as any}>
                              {provider.target}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TD>
                  </TR>
                ))}
                {backups.length === 0 && (
                  <TR>
                    <TD colSpan={4} className="py-10 text-center text-muted-foreground">
                      Nenhum backup executado ainda.
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </Card>

          <Card padding={false}>
            <div className="p-5 lg:p-6">
              <CardHeader
                title="Eventos recentes"
                description="Auditoria das requisicoes suspeitas e regras manuais."
                icon={AlertTriangle}
              />
            </div>
            <Table className="border-0 rounded-none shadow-none" scrollLabel="Eventos de seguranca">
              <THead>
                <TH>Evento</TH>
                <TH>Origem</TH>
                <TH>Quando</TH>
              </THead>
              <TBody>
                {events.map((event) => (
                  <TR key={event.id}>
                    <TD>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={statusTone(event.action) as any}>{statusLabel(event.action)}</Badge>
                        <span className="font-medium">{event.type}</span>
                      </div>
                      <p className="mt-1 max-w-[360px] truncate text-xs text-muted-foreground">
                        {event.method} {event.path}
                      </p>
                    </TD>
                    <TD>{event.ip || '-'}</TD>
                    <TD>{formatDate(event.createdAt)}</TD>
                  </TR>
                ))}
                {events.length === 0 && (
                  <TR>
                    <TD colSpan={3} className="py-10 text-center text-muted-foreground">
                      Nenhum evento registrado.
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </Card>

          <Card padding={false} className="xl:col-span-2">
            <div className="p-5 lg:p-6">
              <CardHeader
                title="Historico de notificacoes"
                description="Ultimos envios, falhas e verificacoes da Evolution API."
                icon={MessageCircle}
              />
            </div>
            <Table className="border-0 rounded-none shadow-none" scrollLabel="Historico de notificacoes">
              <THead>
                <TH>Tipo</TH>
                <TH>Destino</TH>
                <TH>Mensagem</TH>
                <TH>Quando</TH>
              </THead>
              <TBody>
                {notifications.map((notification) => (
                  <TR key={notification.id}>
                    <TD>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={statusTone(notification.status) as any}>
                          {statusLabel(notification.status)}
                        </Badge>
                        <span className="font-medium">{notificationTypeLabel(notification.type)}</span>
                      </div>
                      {notification.error && (
                        <p className="mt-1 max-w-[320px] truncate text-xs text-destructive">
                          {notification.error}
                        </p>
                      )}
                    </TD>
                    <TD>{notification.recipient || '-'}</TD>
                    <TD>
                      <p className="max-w-[520px] truncate text-sm text-muted-foreground">
                        {notification.message || '-'}
                      </p>
                    </TD>
                    <TD>{formatDate(notification.sentAt || notification.createdAt)}</TD>
                  </TR>
                ))}
                {notifications.length === 0 && (
                  <TR>
                    <TD colSpan={4} className="py-10 text-center text-muted-foreground">
                      Nenhuma notificacao registrada ainda.
                    </TD>
                  </TR>
                )}
              </TBody>
            </Table>
          </Card>
        </div>
      </AdminPage>
    </AdminLayout>
  )
}
