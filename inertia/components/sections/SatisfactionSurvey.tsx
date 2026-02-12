import { MessageCircle } from 'lucide-react'

export function SatisfactionSurvey() {
  return (
    <section className="py-16 px-4 bg-navy-50">
      <div className="container mx-auto text-center max-w-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 text-sky-600 text-sm font-medium mb-4">
          <MessageCircle className="w-4 h-4" /> Pesquisa de Satisfação
        </div>
        <h2 className="text-3xl font-heading font-bold text-navy-900 mb-4">Sua opinião é importante</h2>
        <p className="text-navy-500 mb-6">Ajude-nos a melhorar nossos serviços respondendo nossa pesquisa de satisfação.</p>
        <a href="/pesquisa" className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 text-white rounded-xl font-medium hover:bg-sky-600 transition-colors">
          Responder Pesquisa
        </a>
      </div>
    </section>
  )
}
