import { Link } from "@inertiajs/react";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gradient-navy text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center border border-primary-foreground/30">
                <span className="text-xl font-bold">C</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">CÂMARA</h3>
                <p className="text-gold text-sm">MUNICIPAL DE SUMÉ</p>
              </div>
            </div>
            <p className="text-sm opacity-80 mb-4">
              Estado da Paraíba - Comprometida com a transparência e o bem-estar da população sumeense.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-navy-dark transition-colors no-underline">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-navy-dark transition-colors no-underline">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-navy-dark transition-colors no-underline">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-gold">Links Úteis</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/transparencia" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline text-primary-foreground">Portal da Transparência</Link></li>
              <li><Link href="/ouvidoria" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline text-primary-foreground">e-SIC / Ouvidoria</Link></li>
              <li><Link href="/licitacoes" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline text-primary-foreground">Licitações</Link></li>
              <li><Link href="/vereadores" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline text-primary-foreground">Vereadores</Link></li>
              <li><Link href="/atividades-legislativas" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline text-primary-foreground">Atividades Legislativas</Link></li>
              <li><Link href="/atas" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline text-primary-foreground">Atas das Sessões</Link></li>
            </ul>
          </div>

          {/* Institutional */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-gold">Institucional</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/historia-da-camara" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline text-primary-foreground">História da Câmara</Link></li>
              <li><Link href="/mesa-diretora" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline text-primary-foreground">Mesa Diretora</Link></li>
              <li><Link href="/comissoes" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline text-primary-foreground">Comissões Permanentes</Link></li>
              <li><Link href="/publicacoes-oficiais" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline text-primary-foreground">Publicações Oficiais</Link></li>
              <li><Link href="/perguntas-frequentes" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline text-primary-foreground">Perguntas Frequentes</Link></li>
              <li><Link href="/politica-de-privacidade" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline text-primary-foreground">Política de Privacidade</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-gold">Contato</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 text-gold flex-shrink-0" />
                <span className="opacity-80">Rua Francisco Antonio de Barros, 110 - Centro, Sumé - PB, 58540-000</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <span className="opacity-80">(83) 3353-1185</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                <span className="opacity-80">camaradesume@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gold flex-shrink-0" />
                <span className="opacity-80">Seg - Sex: 08h às 14h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p className="opacity-60 text-center md:text-left">
              © {new Date().getFullYear()} Câmara Municipal de Sumé. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/politica-de-privacidade" className="opacity-60 hover:opacity-100 transition-opacity no-underline text-primary-foreground">
                Privacidade
              </Link>
              <span className="opacity-40">|</span>
              <Link href="/perguntas-frequentes" className="opacity-60 hover:opacity-100 transition-opacity no-underline text-primary-foreground">
                FAQ
              </Link>
              <span className="opacity-40">|</span>
              <a href="/admin/login" className="opacity-60 hover:opacity-100 transition-opacity no-underline text-primary-foreground">
                Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
