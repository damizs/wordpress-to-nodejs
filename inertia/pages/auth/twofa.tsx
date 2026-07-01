import { Head, useForm, usePage } from '@inertiajs/react'
import { FlashMessages } from '~/components/FlashMessages'
import { DynamicFavicon } from '~/components/DynamicFavicon'
import { DynamicTheme } from '~/components/DynamicTheme'
import { ShieldCheck, KeyRound } from 'lucide-react'

interface TwofaProps {
  siteSettings?: Record<string, string | null>
}

export default function Twofa({ siteSettings = {} }: TwofaProps) {
  const camara = (usePage().props as {
    camara?: { nome: string };
  }).camara
  const { data, setData, post, processing, errors } = useForm({ code: '' })

  const loginTitle = siteSettings.login_title || 'Painel Administrativo'
  const loginSubtitle =
    siteSettings.login_subtitle || siteSettings.header_title || camara?.nome || 'Câmara Municipal'
  const loginLogo = siteSettings.login_logo_url || siteSettings.logo_url || ''

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('/login/2fa')
  }

  return (
    <>
      <Head title={`Verificação - ${loginTitle}`} />
      <DynamicTheme />
      <DynamicFavicon />
      <FlashMessages />

      <div
        className="min-h-screen flex items-center justify-center px-4 py-10"
        style={{ background: 'var(--gradient-hero)' }}
      >
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-3 flex justify-center">
              <div className="flex min-h-20 min-w-20 items-center justify-center rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-md border border-white/20">
                {loginLogo ? (
                  <img src={loginLogo} alt={loginSubtitle} className="max-h-16 max-w-56 object-contain" />
                ) : (
                  <ShieldCheck className="w-8 h-8 text-gold" aria-hidden="true" />
                )}
              </div>
            </div>

            <p className="mb-3 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Verificação em duas etapas
            </p>
            <h1 className="text-2xl font-bold text-white">Confirme sua identidade</h1>
            <p className="text-white/80 text-sm mt-1">
              Digite o código de 6 dígitos do seu app autenticador.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card text-card-foreground rounded-2xl shadow-xl p-8 space-y-5">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-foreground mb-1.5">
                Código de verificação
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  value={data.code}
                  onChange={(e) => setData('code', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-input bg-background text-foreground placeholder:text-muted-foreground rounded-xl text-sm tracking-widest focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none transition-all"
                  placeholder="000000 ou código de backup"
                  required
                  aria-invalid={!!errors.code}
                  aria-describedby={errors.code ? 'code-error' : 'code-help'}
                />
              </div>
              {errors.code ? (
                <p id="code-error" role="alert" className="mt-1.5 text-xs text-destructive">
                  {errors.code}
                </p>
              ) : (
                <p id="code-help" className="mt-1.5 text-xs text-muted-foreground">
                  Perdeu o acesso ao app? Use um dos seus códigos de backup.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 bg-navy text-white font-medium rounded-xl hover:bg-navy-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Verificando...' : 'Verificar e entrar'}
            </button>

            <a
              href="/login"
              className="block text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Voltar ao login
            </a>
          </form>

          <p className="text-center text-white/70 text-xs mt-6">
            © {new Date().getFullYear()} {loginSubtitle}
          </p>
        </div>
      </div>
    </>
  )
}
