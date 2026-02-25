import SeoHead from '~/components/SeoHead'
import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import { PageTitle } from '~/components/PageTitle'
import { MessageSquare, Phone, Mail, MapPin, Clock } from 'lucide-react'
import { useState } from 'react'
import { useSiteSettings } from '~/hooks/use_site_settings'

export default function Ouvidoria() {
  const { get } = useSiteSettings()
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    tipo: '',
    assunto: '',
    mensagem: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [mensagemSucesso, setMensagemSucesso] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    
    // Aqui você pode implementar o envio real do formulário
    // Por enquanto, apenas simula um envio
    setTimeout(() => {
      setEnviando(false)
      setMensagemSucesso('Sua manifestação foi registrada com sucesso! Em breve entraremos em contato.')
      setFormData({ nome: '', email: '', tipo: '', assunto: '', mensagem: '' })
    }, 1500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <>
      <SeoHead
        title="Ouvidoria | Câmara Municipal de Sumé"
        description="Entre em contato com a Ouvidoria da Câmara Municipal de Sumé. Registre sugestões, reclamações, denúncias ou elogios."
        url="/ouvidoria"
      />
      <div className="min-h-screen bg-background" style={{ fontFamily: "Verdana, Geneva, Tahoma, sans-serif" }}>
        <TopBar />
        <Header />

        <main>
          <Breadcrumb items={[{ label: "Ouvidoria" }]} />
          <PageTitle title="OUVIDORIA" />

          <section className="py-12">
            <div className="container mx-auto px-4 max-w-4xl">
              {/* O que é a Ouvidoria */}
              <div className="card-modern p-6 md:p-8 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">O que é a Ouvidoria?</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  A Ouvidoria da Câmara Municipal de Sumé é o canal de comunicação direta entre o cidadão 
                  e o Poder Legislativo. Através dela, você pode registrar sugestões, reclamações, denúncias, 
                  elogios e solicitações de informações relacionadas às atividades da Câmara.
                </p>
              </div>

              {/* Contatos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="card-modern p-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Telefone</h3>
                    <p className="text-muted-foreground text-sm">
                      {get('footer_phone', '(83) 3353-2095')}
                    </p>
                  </div>
                </div>
                <div className="card-modern p-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">E-mail</h3>
                    <p className="text-muted-foreground text-sm">
                      {get('footer_email', 'ouvidoria@camaradesume.pb.gov.br')}
                    </p>
                  </div>
                </div>
                <div className="card-modern p-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Endereço</h3>
                    <p className="text-muted-foreground text-sm">
                      {get('footer_address', 'Rua Alice Japiassú de Queiróz, Nº 52 - Centro, Sumé - PB')}
                    </p>
                  </div>
                </div>
                <div className="card-modern p-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Horário de Atendimento</h3>
                    <p className="text-muted-foreground text-sm">
                      {get('footer_hours', 'Segunda a Sexta, 08h às 14h')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Formulário */}
              <div className="card-modern p-6 md:p-8">
                <h2 className="text-xl font-bold text-foreground mb-6">Registrar Manifestação</h2>
                
                {mensagemSucesso && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    {mensagemSucesso}
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Nome</label>
                      <input 
                        type="text" 
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        placeholder="Seu nome completo" 
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">E-mail</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="seu@email.com" 
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Tipo de Manifestação</label>
                    <select 
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="sugestao">Sugestão</option>
                      <option value="reclamacao">Reclamação</option>
                      <option value="denuncia">Denúncia</option>
                      <option value="elogio">Elogio</option>
                      <option value="informacao">Solicitação de Informação</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Assunto</label>
                    <input 
                      type="text" 
                      name="assunto"
                      value={formData.assunto}
                      onChange={handleChange}
                      placeholder="Assunto da manifestação" 
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Mensagem</label>
                    <textarea 
                      name="mensagem"
                      value={formData.mensagem}
                      onChange={handleChange}
                      rows={5} 
                      placeholder="Descreva sua manifestação detalhadamente..." 
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={enviando}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enviando ? 'Enviando...' : 'Enviar Manifestação'}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}
