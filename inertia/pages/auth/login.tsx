import { Head, useForm } from '@inertiajs/react'
import { FlashMessages } from '~/components/FlashMessages'
import { DynamicFavicon } from '~/components/DynamicFavicon'
import { DynamicTheme } from '~/components/DynamicTheme'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useState } from 'react'

interface LoginProps {
  siteSettings?: Record<string, string | null>
}

export default function Login({ siteSettings = {} }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false)
  const { data, setData, post, processing } = useForm({
    email: '',
    password: '',
  })

  const loginTitle = siteSettings.login_title || 'Painel Administrativo'
  const loginSubtitle =
    siteSettings.login_subtitle || siteSettings.header_title || 'Camara Municipal de Sume'
  const loginLogo = siteSettings.login_logo_url || siteSettings.logo_url || ''

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('/login')
  }

  return (
    <>
      <Head title={`Login - ${loginTitle}`} />
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
                  <span className="text-3xl font-bold text-gold">C</span>
                )}
              </div>
            </div>

            <p className="mb-3 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-gold">
              Acesso restrito
            </p>
            <h1 className="text-2xl font-bold text-white">{loginTitle}</h1>
            <p className="text-white/65 text-sm mt-1">{loginSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  className="w-full pl-11 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none transition-all"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 bg-navy text-white font-medium rounded-xl hover:bg-navy-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-white/40 text-xs mt-6">
            {new Date().getFullYear()} {loginSubtitle}
          </p>
        </div>
      </div>
    </>
  )
}
