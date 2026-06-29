import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  AdminPage,
  Avatar,
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  Field,
  FormSection,
  Input,
  PageHeader,
} from '~/components/admin/ui'
import {
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldAlert,
  ShieldCheck,
  UserCircle,
  UserSquare,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'

/**
 * Campo de senha com botão de mostrar/ocultar (olho Eye/EyeOff). Recebe
 * `id`/`aria-*` do <Field> (via cloneElement) e os repassa ao <Input> para
 * preservar a associação com o label e a mensagem de erro. O botão é
 * type="button" (não submete o form) e tem aria-label dinâmico.
 */
function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  required,
  minLength,
  ...aria
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  required?: boolean
  minLength?: number
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
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className="pr-11"
        {...aria}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={visible}
        title={visible ? 'Ocultar senha' : 'Mostrar senha'}
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

interface AccountUser {
  id: number
  fullName: string
  email: string
  role: 'super_admin' | 'admin' | 'editor' | 'viewer' | string
  avatar: string | null
}

interface Props {
  user: AccountUser
  twofaEnabled: boolean
  presetAvatars: string[]
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super administrador',
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Leitor',
}

export default function AccountIndex({ user, twofaEnabled, presetAvatars }: Props) {
  const profile = useForm({
    fullName: user.fullName,
    avatar: user.avatar ?? '',
  })

  const password = useForm({
    currentPassword: '',
    newPassword: '',
    confirm: '',
  })

  function submitProfile(event: FormEvent) {
    event.preventDefault()
    profile.post('/painel/conta/perfil', { preserveScroll: true })
  }

  function submitPassword(event: FormEvent) {
    event.preventDefault()
    password.post('/painel/conta/senha', {
      preserveScroll: true,
      onSuccess: () => password.reset(),
    })
  }

  const selectedAvatar = profile.data.avatar || null
  const roleLabel = ROLE_LABELS[user.role] ?? user.role

  return (
    <AdminLayout title="Minha conta">
      <Head title="Minha conta - Painel" />

      <AdminPage>
        <PageHeader
          icon={UserCircle}
          eyebrow="Conta"
          title="Minha conta"
          description="Atualize seu perfil, troque a senha e gerencie a verificação em duas etapas."
        />

        <div className="space-y-6">
          {/* ============================== Perfil ============================== */}
          <form onSubmit={submitProfile}>
            <FormSection
              title="Perfil"
              description="Seu nome aparece no painel e nas ações registradas. Escolha um avatar para personalizar."
              icon={UserSquare}
            >
              <div className="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
                {/* Avatar atual grande */}
                <div className="flex flex-col items-center gap-3">
                  <Avatar
                    src={selectedAvatar}
                    name={profile.data.fullName || user.fullName}
                    size="lg"
                    className="!w-28 !h-28 !text-3xl ring-4 ring-navy/10 shadow-sm"
                  />
                  <span className="text-xs text-muted-foreground">
                    {selectedAvatar ? 'Avatar selecionado' : 'Iniciais do seu nome'}
                  </span>
                </div>

                <div className="space-y-5">
                  {/* Seletor de avatares */}
                  <fieldset>
                    <legend className="block text-[13px] font-semibold text-foreground mb-2">
                      Escolha um avatar
                    </legend>
                    <div role="radiogroup" aria-label="Avatares disponíveis" className="flex flex-wrap gap-3">
                      {/* Opção: usar iniciais (sem avatar) */}
                      <button
                        type="button"
                        role="radio"
                        aria-checked={!selectedAvatar}
                        aria-label="Usar iniciais do nome"
                        onClick={() => profile.setData('avatar', '')}
                        className={`relative rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                          !selectedAvatar
                            ? 'ring-2 ring-navy ring-offset-2 ring-offset-card'
                            : 'ring-1 ring-border hover:ring-navy/40'
                        } rounded-full`}
                      >
                        <Avatar name={profile.data.fullName || user.fullName} size="md" className="!w-12 !h-12" />
                        {!selectedAvatar && (
                          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-navy text-white shadow">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>

                      {presetAvatars.map((src, index) => {
                        const active = selectedAvatar === src
                        return (
                          <button
                            key={src}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            aria-label={`Avatar ${index + 1}`}
                            onClick={() => profile.setData('avatar', src)}
                            className={`relative rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                              active
                                ? 'ring-2 ring-navy ring-offset-2 ring-offset-card'
                                : 'ring-1 ring-border hover:ring-navy/40'
                            }`}
                          >
                            <Avatar src={src} name={`Avatar ${index + 1}`} size="md" className="!w-12 !h-12" />
                            {active && (
                              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-navy text-white shadow">
                                <Check className="h-3 w-3" />
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </fieldset>

                  {/* Nome + email */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Nome completo" required error={profile.errors.fullName}>
                      <Input
                        value={profile.data.fullName}
                        onChange={(event) => profile.setData('fullName', event.target.value)}
                        autoComplete="name"
                        placeholder="Seu nome"
                        required
                      />
                    </Field>

                    <Field label="E-mail" hint="O e-mail de acesso não pode ser alterado por aqui.">
                      <Input value={user.email} readOnly disabled autoComplete="email" />
                    </Field>
                  </div>

                  <div className="flex items-center justify-end">
                    <Button type="submit" loading={profile.processing}>
                      <Check className="h-4 w-4" />
                      Salvar perfil
                    </Button>
                  </div>
                </div>
              </div>
            </FormSection>
          </form>

          {/* ========================= Segurança — senha ========================= */}
          <form onSubmit={submitPassword}>
            <FormSection
              title="Segurança — senha"
              description="Use uma senha forte com pelo menos 8 caracteres. Você precisa informar a senha atual."
              icon={Lock}
            >
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Senha atual" required error={password.errors.currentPassword}>
                  <PasswordInput
                    value={password.data.currentPassword}
                    onChange={(value) => password.setData('currentPassword', value)}
                    autoComplete="current-password"
                    required
                  />
                </Field>

                <Field
                  label="Nova senha"
                  required
                  error={password.errors.newPassword}
                  hint="Mínimo de 8 caracteres."
                >
                  <PasswordInput
                    value={password.data.newPassword}
                    onChange={(value) => password.setData('newPassword', value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </Field>

                <Field label="Confirmar nova senha" required error={password.errors.confirm}>
                  <PasswordInput
                    value={password.data.confirm}
                    onChange={(value) => password.setData('confirm', value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </Field>
              </div>

              <div className="flex items-center justify-end">
                <Button type="submit" loading={password.processing}>
                  <KeyRound className="h-4 w-4" />
                  Alterar senha
                </Button>
              </div>
            </FormSection>
          </form>

          {/* ===================== Autenticação em duas etapas ===================== */}
          <Card>
            <CardHeader
              title="Autenticação em duas etapas (2FA)"
              description="Adicione uma camada extra de segurança exigindo um código do app autenticador no login."
              icon={twofaEnabled ? ShieldCheck : ShieldAlert}
              actions={
                <Badge tone={twofaEnabled ? 'success' : 'warning'}>
                  {twofaEnabled ? 'Ativa' : 'Inativa'}
                </Badge>
              }
            />

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                {twofaEnabled
                  ? 'A verificação em duas etapas está ativa na sua conta. Você pode gerenciar os códigos de backup ou desativá-la na tela de segurança.'
                  : 'A verificação em duas etapas está inativa. Recomendamos ativá-la para proteger melhor o acesso ao painel.'}
              </p>
              <ButtonLink
                href="/painel/conta/seguranca"
                variant={twofaEnabled ? 'secondary' : 'primary'}
              >
                <ShieldCheck className="h-4 w-4" />
                {twofaEnabled ? 'Gerenciar 2FA' : 'Ativar 2FA'}
              </ButtonLink>
            </div>
          </Card>
        </div>
      </AdminPage>
    </AdminLayout>
  )
}
