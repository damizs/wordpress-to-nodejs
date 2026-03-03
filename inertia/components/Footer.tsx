import { Link } from "@inertiajs/react";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube } from "lucide-react";

interface FooterProps {
  logoUrl?: string | null;
}

export const Footer = ({ logoUrl }: FooterProps) => {
  return (
    <footer className="bg-gradient-navy text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Câmara Municipal de Sumé" 
                  className="h-16 w-auto object-contain"
                />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center border border-primary-foreground/30">
                    <span className="text-xl font-bold">C</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">CÂMARA</h3>
                    <p className="text-gold text-sm">MUNICIPAL DE SUMÉ</p>
                  </div>
                </>
              )}
            </div>
            <p className="text-sm opacity-80 mb-4">
              Comprometida com a transparência e o bem-estar da população sumeense.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://www.facebook.com/camaradesume" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-navy-dark transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/camaradesume" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-navy-dark transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://www.youtube.com/@camaradesume" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-navy-dark transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-gold">Links Úteis</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/transparencia" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline">Portal da Transparência</Link></li>
              <li><Link href="/e-sic" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline">E-SIC</Link></li>
              <li><Link href="/ouvidoria" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline">Ouvidoria</Link></li>
              <li><Link href="/licitacoes" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline">Licitações</Link></li>
              <li><Link href="/vereadores" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline">Vereadores</Link></li>
              <li><Link href="/atas" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline">Sessões Plenárias</Link></li>
            </ul>
          </div>

          {/* Institutional */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-gold">Institucional</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/historia-da-camara" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline">A Câmara</Link></li>
              <li><Link href="/mesa-diretora" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline">Mesa Diretora</Link></li>
              <li><Link href="/comissoes" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline">Comissões</Link></li>
              <li><Link href="/publicacoes-oficiais" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline">Regimento Interno</Link></li>
              <li><Link href="/publicacoes-oficiais" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline">Lei Orgânica</Link></li>
              <li><Link href="/politica-de-privacidade" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors no-underline">Política de Privacidade</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-gold">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span className="opacity-80">Rua Luiz Grande, S/N, Centro<br />CEP: 58540-000 - Sumé/PB</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <span className="opacity-80">(83) 3353-1974</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <span className="opacity-80 break-all">contato@camaradesume.pb.gov.br</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span className="opacity-80">Segunda à Sexta<br />7h às 13h</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs opacity-70">
            <p>© {new Date().getFullYear()} Câmara Municipal de Sumé. Todos os direitos reservados.</p>
            <p>Desenvolvido com transparência e compromisso público.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
