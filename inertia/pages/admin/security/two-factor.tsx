import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { ShieldCheck, ShieldAlert, KeyRound, Copy, Check, Download } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, CardHeader, Field, Input, Badge, PageHeader } from '~/components/admin/ui'

interface TwoFactorProps {
  enabled: boolean
  setup: { secret: string; otpauth: string; qr: string } | null
  generatedBackupCodes: string[] | null
  backupCodesRemaining: number
  backupCodeCount: number
}

function BackupCodesPanel({ codes }: { codes: string[] }) {
  const [copied, setCopied] = useState(false)

  function copyAll() {
    const text = codes.join('\n')
    navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      },
      () => {}
    )
  }

  function downloadTxt() {
    const blob = new Blob(
      [
        'Codigos de backup - Verificacao em duas etapas\n',
        'Camara Municipal de Sume\n\n',
        'Cada codigo pode ser usado UMA vez. Guarde em local seguro.\n\n',
        codes.join('\n'),
        '\n',
      ],
      { type: 'text/plain' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'codigos-backup-2fa.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="border-l-4 border-l-gold">
      <CardHeader
        title="Seus códigos de backup"
        description="Mostrados apenas UMA vez. Cada código funciona uma única vez se você perder o app."
        icon={KeyRound}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-sm">
        {codes.map((c) => (
          <div
            key={c}
            className="rounded-lg border border-border bg-muted px-3 py-2 text-center tracking-wider text-foreground"
          >
            {c}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={copyAll}>
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copiado' : 'Copiar todos'}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={downloadTxt}>
          <Download className="w-4 h-4" />
          Baixar .txt
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Anote ou baixe agora. Por segurança, eles não serão exibidos novamente.
      </p>
    </Card>
  )
}

export default function TwoFactor({
  enabled,
  setup,
  generatedBackupCodes,
  backupCodesRemaining,
  backupCodeCount,
}: TwoFactorProps) {
  const confirmForm = useForm({ code: '' })
  const disableForm = useForm({ password: '', code: '' })
  const regenForm = useForm({ password: '', code: '' })
  const [secretCopied, setSecretCopied] = useState(false)

  function startSetup() {
    router.post('/painel/conta/seguranca/iniciar')
  }
  function cancelSetup() {
    router.post('/painel/conta/seguranca/cancelar')
  }
  function confirmActivate(e: React.FormEvent) {
    e.preventDefault()
    confirmForm.post('/painel/conta/seguranca/ativar')
  }
  function disable2fa(e: React.FormEvent) {
    e.preventDefault()
    disableForm.post('/painel/conta/seguranca/desativar')
  }
  function regenCodes(e: React.FormEvent) {
    e.preventDefault()
    regenForm.post('/painel/conta/seguranca/backup-codes')
  }
  function copySecret() {
    if (!setup) return
    navigator.clipboard?.writeText(setup.secret).then(
      () => {
        setSecretCopied(true)
        setTimeout(() => setSecretCopied(false), 2000)
      },
      () => {}
    )
  }

  return (
    <AdminLayout title="Verificação em duas etapas">
      <Head title="Segurança da conta - Painel" />

      <PageHeader
        title="Verificação em duas etapas"
        description="Proteja sua conta com um segundo fator de autenticação além da senha."
        icon={ShieldCheck}
        eyebrow="Minha conta"
      />

      <div className="space-y-6">
        {/* Status */}
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  enabled ? 'bg-emerald-600/10 text-emerald-600' : 'bg-muted text-muted-foreground'
                }`}
              >
                {enabled ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              </div>
              <div>
                <h2 className="text-[15px] font-bold text-foreground leading-tight">
                  Verificação em duas etapas (2FA)
                </h2>
                <p className="text-[13px] text-muted-foreground mt-0.5">
                  Um código temporário do seu celular, além da senha, ao entrar no painel.
                </p>
              </div>
            </div>
            <Badge tone={enabled ? 'success' : 'neutral'}>{enabled ? 'Ativa' : 'Inativa'}</Badge>
          </div>
        </Card>

        {/* Códigos recém-gerados (uma vez) */}
        {generatedBackupCodes && generatedBackupCodes.length > 0 && (
          <BackupCodesPanel codes={generatedBackupCodes} />
        )}

        {/* Estado: INATIVO, sem setup → botão ativar */}
        {!enabled && !setup && (
          <Card>
            <CardHeader
              title="Ativar a verificação em duas etapas"
              description="Você vai precisar de um app autenticador (Google Authenticator, Authy, 1Password, etc.)."
              icon={ShieldCheck}
            />
            <Button type="button" onClick={startSetup}>
              Ativar agora
            </Button>
          </Card>
        )}

        {/* Estado: INATIVO, em setup → QR + confirmação */}
        {!enabled && setup && (
          <Card>
            <CardHeader
              title="1. Escaneie o QR code"
              description="Abra o app autenticador e escaneie. Ou insira a chave manualmente."
              icon={ShieldCheck}
            />
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <img
                src={setup.qr}
                alt="QR code para configurar o autenticador"
                className="w-44 h-44 rounded-lg border border-border bg-white p-2 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-foreground mb-1.5">Chave manual</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 break-all rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground">
                    {setup.secret}
                  </code>
                  <Button type="button" variant="secondary" size="sm" onClick={copySecret}>
                    {secretCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Tipo: baseado em tempo (TOTP), 6 dígitos.
                </p>
              </div>
            </div>

            <form onSubmit={confirmActivate} className="mt-6 border-t border-border pt-5 space-y-4">
              <p className="text-[15px] font-bold text-foreground">2. Confirme o código</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Código de 6 dígitos do app"
                  required
                  error={confirmForm.errors.code}
                >
                  <Input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    className="tracking-widest"
                    value={confirmForm.data.code}
                    onChange={(e) => confirmForm.setData('code', e.target.value)}
                  />
                </Field>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" loading={confirmForm.processing}>
                  Confirmar e ativar
                </Button>
                <Button type="button" variant="ghost" onClick={cancelSetup}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Estado: ATIVO → regenerar backup + desativar */}
        {enabled && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader
                title="Códigos de backup"
                description={`Você tem ${backupCodesRemaining} de ${backupCodeCount} códigos restantes. Gere novos se estiver com poucos ou suspeitar de exposição.`}
                icon={KeyRound}
              />
              <form onSubmit={regenCodes} className="space-y-4">
                <Field
                  label="Confirme com a senha atual ou um código do app"
                  hint="Preencha um dos dois campos."
                  error={regenForm.errors.password || regenForm.errors.code}
                >
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Sua senha atual"
                    value={regenForm.data.password}
                    onChange={(e) => regenForm.setData('password', e.target.value)}
                  />
                </Field>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="ou código de 6 dígitos do app"
                  className="tracking-widest"
                  value={regenForm.data.code}
                  onChange={(e) => regenForm.setData('code', e.target.value)}
                />
                <Button type="submit" variant="secondary" loading={regenForm.processing}>
                  Gerar novos códigos de backup
                </Button>
              </form>
            </Card>

            <Card className="border-l-4 border-l-destructive">
              <CardHeader
                title="Desativar a verificação em duas etapas"
                description="Sua conta ficará protegida apenas pela senha. Não recomendado."
                icon={ShieldAlert}
              />
              <form onSubmit={disable2fa} className="space-y-4">
                <Field
                  label="Confirme com a senha atual ou um código do app"
                  hint="Preencha um dos dois campos."
                  error={disableForm.errors.password || disableForm.errors.code}
                >
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Sua senha atual"
                    value={disableForm.data.password}
                    onChange={(e) => disableForm.setData('password', e.target.value)}
                  />
                </Field>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="ou código de 6 dígitos do app"
                  className="tracking-widest"
                  value={disableForm.data.code}
                  onChange={(e) => disableForm.setData('code', e.target.value)}
                />
                <Button type="submit" variant="destructive" loading={disableForm.processing}>
                  Desativar 2FA
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
