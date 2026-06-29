import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import {
  ArrowLeft,
  Check,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  ShieldCheck,
  User,
} from 'lucide-react'
import { useState, type FormEvent } from 'react'
import {
  Button,
  ButtonLink,
  Card,
  CardHeader,
  Field,
  FormSection,
  Input,
  PageHeader,
} from '~/components/admin/ui'

/**
 * Inteiro aleatório criptograficamente forte em [0, max).
 * Usa window.crypto.getRandomValues (NÃO Math.random) e descarta o resto que
 * causaria viés de módulo, garantindo distribuição uniforme.
 */
function secureRandomInt(max: number): number {
  const arr = new Uint32Array(1)
  const limit = Math.floor(0xffffffff / max) * max
  let value: number
  do {
    window.crypto.getRandomValues(arr)
    value = arr[0]
  } while (value >= limit)
  return value % max
}

/**
 * Gera uma senha forte (12–16 caracteres) com pelo menos uma letra maiúscula,
 * uma minúscula, um número e um símbolo. Conjuntos sem caracteres ambíguos
 * (0/O, 1/l/I) para facilitar a leitura quando o admin copia/repassa a senha.
 */
function generateStrongPassword(): string {
  const groups = [
    'abcdefghijkmnpqrstuvwxyz', // minúsculas
    'ABCDEFGHJKLMNPQRSTUVWXYZ', // maiúsculas
    '23456789', // números
    '!@#$%&*?-_+=', // símbolos
  ]
  const all = groups.join('')
  const length = 12 + secureRandomInt(5) // 12..16

  // Garante ao menos um caractere de cada grupo.
  const chars = groups.map((g) => g[secureRandomInt(g.length)])
  while (chars.length < length) {
    chars.push(all[secureRandomInt(all.length)])
  }

  // Embaralha (Fisher-Yates) para não fixar a posição de cada categoria.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join('')
}

/**
 * Campo de senha com olhinho (mostrar/ocultar), gerador de senha forte e botão
 * copiar. Recebe `id`/`aria-*` do <Field> (via cloneElement) e os repassa ao
 * <Input> para manter a associação com o label e o erro.
 */
function PasswordField({
  id,
  value,
  onChange,
  required,
  ...aria
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleGenerate() {
    onChange(generateStrongPassword())
    setVisible(true) // já deixa visível para o admin conferir/copiar
    setCopied(false)
  }

  async function handleCopy() {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setVisible(true)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard indisponível (contexto não seguro): exibe a senha para cópia manual.
      setVisible(true)
    }
  }

  return (
    <div>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            setCopied(false)
          }}
          required={required}
          minLength={8}
          autoComplete="new-password"
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

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={handleGenerate}>
          <RefreshCw className="w-3.5 h-3.5" /> Gerar senha forte
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copiada!' : 'Copiar'}
          </Button>
        )}
      </div>
    </div>
  )
}

interface RoleOption {
  id: number
  name: string
  description: string | null
}

interface UserData {
  id: number
  fullName: string
  email: string
  isActive: boolean
  roleIds: number[]
}

export default function UserForm({ user, roles }: { user: UserData | null; roles: RoleOption[] }) {
  const isEdit = !!user

  const { data, setData, post, put, processing, errors } = useForm({
    full_name: user?.fullName ?? '',
    email: user?.email ?? '',
    password: '',
    is_active: user?.isActive ?? true,
    role_ids: user?.roleIds ?? ([] as number[]),
  })

  function toggleRole(roleId: number) {
    setData(
      'role_ids',
      data.role_ids.includes(roleId)
        ? data.role_ids.filter((id) => id !== roleId)
        : [...data.role_ids, roleId]
    )
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isEdit) {
      put(`/painel/usuarios/${user!.id}`)
    } else {
      post('/painel/usuarios')
    }
  }

  return (
    <AdminLayout title={isEdit ? 'Editar Usuário' : 'Novo Usuário'}>
      <Head title={`${isEdit ? 'Editar' : 'Novo'} Usuário - Painel`} />

      <PageHeader
        title={isEdit ? 'Editar Usuário' : 'Novo Usuário'}
        description={
          isEdit
            ? `Editando o perfil de ${user!.fullName}`
            : 'Crie um novo usuário e atribua papéis de acesso ao painel.'
        }
        icon={User}
        eyebrow="Sistema"
        actions={
          <ButtonLink href="/painel/usuarios" variant="secondary">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </ButtonLink>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Dados do usuário" icon={User} columns={2}>
          <Field label="Nome completo" required error={errors.full_name}>
            <Input
              type="text"
              value={data.full_name}
              onChange={(e) => setData('full_name', e.target.value)}
              required
            />
          </Field>

          <Field label="E-mail" required error={errors.email}>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              required
            />
          </Field>

          <Field
            label={`Senha ${isEdit ? '(deixe em branco para manter a atual)' : ''}`.trim()}
            required={!isEdit}
            error={errors.password}
            hint="Mínimo de 8 caracteres. Use o gerador para criar uma senha forte e copie para repassar ao usuário."
          >
            <PasswordField
              value={data.password}
              onChange={(value) => setData('password', value)}
              required={!isEdit}
            />
          </Field>

          <div className="flex items-center md:pt-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.is_active}
                onChange={(e) => setData('is_active', e.target.checked)}
                className="w-4 h-4 rounded border-border accent-[hsl(var(--navy))]"
              />
              <span className="text-sm text-foreground">Usuário ativo</span>
            </label>
          </div>
        </FormSection>

        <Card>
          <CardHeader
            title="Papéis"
            description="O usuário só acessa as áreas do painel cobertas pelos papéis marcados. Pode combinar mais de um."
            icon={ShieldCheck}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {roles.map((role) => (
              <label
                key={role.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  data.role_ids.includes(role.id)
                    ? 'border-navy/30 bg-navy/5'
                    : 'border-border hover:bg-muted/40'
                }`}
              >
                <input
                  type="checkbox"
                  checked={data.role_ids.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                  className="w-4 h-4 mt-0.5 rounded border-border accent-[hsl(var(--navy))]"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{role.name}</p>
                  {role.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        </Card>

        <div>
          <Button type="submit" loading={processing}>
            <Save className="w-4 h-4" /> {isEdit ? 'Salvar Alterações' : 'Criar Usuário'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
