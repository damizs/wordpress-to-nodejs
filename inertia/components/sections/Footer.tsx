import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-navy-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-heading font-bold mb-4">Câmara Municipal de Sumé</h3>
            <p className="text-navy-300 text-sm leading-relaxed">Poder Legislativo do Município de Sumé, Estado da Paraíba.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm text-navy-300">
              {['Transparência', 'Vereadores', 'Licitações', 'Diário Oficial', 'Ouvidoria'].map(l => (
                <li key={l}><a href={`/${l.toLowerCase().replace(/ê/g,'e').replace(/ç/g,'c').replace(/ã/g,'a').replace(/ /g,'-')}`} className="hover:text-gold-400 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-3 text-sm text-navy-300">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold-400" /> (83) 3353-1191</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-gold-400" /> contato@camaradesume.pb.gov.br</li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gold-400 mt-0.5" /> Rua Antônio Ramalho, S/N, Centro, Sumé-PB</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Redes Sociais</h4>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Youtube, href: '#', label: 'YouTube' },
              ].map(s => (
                <a key={s.label} href={s.href} className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center hover:bg-gold-400 hover:text-navy-900 transition-all" aria-label={s.label}>
                  <s.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-navy-800 mt-8 pt-8 text-center text-sm text-navy-400">
          © {new Date().getFullYear()} Câmara Municipal de Sumé. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
