import { Head, useForm, usePage } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { Star, Send, CheckCircle } from 'lucide-react'
import { useState } from 'react'

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [hover, setHover] = useState(0)
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button key={star} type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110">
            <Star className={`w-7 h-7 ${(hover || value) >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
          </button>
        ))}
        <span className="text-xs text-gray-400 ml-2 self-center">{value ? `${value}/5` : ''}</span>
      </div>
    </div>
  )
}

export default function PesquisaSatisfacaoIndex() {
  const { flash } = usePage().props as any
  const { data, setData, post, processing, reset } = useForm({
    name: '',
    email: '',
    phone: '',
    rating_atendimento: 0,
    rating_transparencia: 0,
    rating_legislativo: 0,
    rating_infraestrutura: 0,
    rating_geral: 0,
    suggestions: '',
    complaints: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('/pesquisa-de-satisfacao', { onSuccess: () => reset() })
  }

  return (
    <PublicLayout>
      <Head title="Pesquisa de Satisfação - Câmara de Sumé" />
      <section className="py-12 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Pesquisa de Satisfação</h1>
            <p className="text-gray-500 mt-2">
              Sua opinião é fundamental para melhorarmos os serviços da Câmara Municipal de Sumé.
              Participe da nossa pesquisa de satisfação!
            </p>
          </div>

          {flash?.success && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-green-800 font-medium text-lg">Obrigado pela sua participação!</p>
              <p className="text-green-600 text-sm mt-1">Sua opinião é muito importante para nós.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados pessoais (opcionais) */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Identificação <span className="text-xs text-gray-400 font-normal">(opcional)</span></h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nome</label>
                  <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">E-mail</label>
                  <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm text-gray-600 mb-1">Telefone</label>
                <input type="tel" value={data.phone} onChange={(e) => setData('phone', e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full sm:w-1/2 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
              </div>
            </div>

            {/* Avaliações */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Avalie os serviços</h2>
              <div className="space-y-5">
                <StarRating label="Atendimento ao público" value={data.rating_atendimento}
                  onChange={(v) => setData('rating_atendimento', v)} />
                <StarRating label="Transparência e acesso à informação" value={data.rating_transparencia}
                  onChange={(v) => setData('rating_transparencia', v)} />
                <StarRating label="Atuação legislativa (projetos, sessões)" value={data.rating_legislativo}
                  onChange={(v) => setData('rating_legislativo', v)} />
                <StarRating label="Infraestrutura e instalações" value={data.rating_infraestrutura}
                  onChange={(v) => setData('rating_infraestrutura', v)} />
                <div className="pt-3 border-t border-gray-100">
                  <StarRating label="Avaliação geral da Câmara *" value={data.rating_geral}
                    onChange={(v) => setData('rating_geral', v)} />
                </div>
              </div>
            </div>

            {/* Comentários */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Comentários</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Sugestões de melhoria</label>
                  <textarea value={data.suggestions} onChange={(e) => setData('suggestions', e.target.value)}
                    rows={3} placeholder="O que podemos melhorar?"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Reclamações</label>
                  <textarea value={data.complaints} onChange={(e) => setData('complaints', e.target.value)}
                    rows={3} placeholder="Relate algum problema encontrado"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none" />
                </div>
              </div>
            </div>

            <div className="text-center">
              <button type="submit" disabled={processing || !data.rating_geral}
                className="inline-flex items-center gap-2 px-8 py-3 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium disabled:opacity-50">
                <Send className="w-4 h-4" /> {processing ? 'Enviando...' : 'Enviar Pesquisa'}
              </button>
              {!data.rating_geral && (
                <p className="text-xs text-gray-400 mt-2">* Avaliação geral é obrigatória</p>
              )}
            </div>
          </form>
        </div>
      </section>
    </PublicLayout>
  )
}
