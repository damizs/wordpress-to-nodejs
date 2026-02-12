import { Head, useForm } from '@inertiajs/react'
import { FlashMessages } from '~/components/FlashMessages'
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const { data, setData, post, processing } = useForm({
    email: '',
    password: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('/login')
  }

  return (
    <>
      <Head title="Login - Painel Administrativo" />
      <FlashMessages />
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--gradient-hero)' }}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-4">
              <span className="text-3xl font-serif font-bold text-gold">C</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-white">Painel Administrativo</h1>
            <p className="text-white/60 text-sm mt-1">Câmara Municipal de Sumé</p>
          </div>

          {/* Form Card */}
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
                  placeholder="admin@camaradesume.pb.gov.br"
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
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
            © {new Date().getFullYear()} Câmara Municipal de Sumé
          </p>
        </div>
      </div>
    </>
  )
}
