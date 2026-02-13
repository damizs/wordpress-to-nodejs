import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube } from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";

export const Footer = () => {
  const { get } = useSiteSettings();

  const address = get('footer_address', 'Rua Alice Japiassú de Queiróz, Nº 52 - Centro, Sumé - PB, CEP: 58540-000');
  const phone = get('footer_phone', '(83) 3353-2095');
  const email = get('footer_email', 'contato@camaradesume.pb.gov.br');
  const hours = get('footer_hours', 'Seg a Sex, 8h às 14h');
  const facebook = get('social_facebook', '');
  const instagram = get('social_instagram', '');
  const youtube = get('social_youtube', '');
  const logoUrl = get('logo_url', '');

  return (
    <footer className="bg-gradient-navy text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt="Câmara de Sumé" className="w-12 h-12 rounded-full object-cover border border-primary-foreground/30" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center border border-primary-foreground/30">
                  <span className="text-xl font-serif font-bold">C</span>
                </div>
              )}
              <div>
                <h3 className="font-serif font-bold text-lg">CÂMARA</h3>
                <p className="text-gold text-sm">DE SUMÉ</p>
              </div>
            </div>
            <p className="text-sm opacity-80 mb-4">
              Poder Legislativo Municipal - Comprometida com a transparência e o bem-estar da população sumeense.
            </p>
            <div className="flex gap-3">
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-navy-dark transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-navy-dark transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {youtube && (
                <a href={youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-navy-dark transition-colors">
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-4 text-gold">Links Úteis</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/transparencia" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors">Portal da Transparência</a></li>
              <li><a href="/licitacoes" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors">Licitações</a></li>
              <li><a href="/vereadores" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors">Vereadores</a></li>
              <li><a href="/atas" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors">Sessões Plenárias</a></li>
              <li><a href="/publicacoes-oficiais" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors">Publicações Oficiais</a></li>
              <li><a href="/perguntas-frequentes" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors">Perguntas Frequentes</a></li>
            </ul>
          </div>

          {/* Institutional */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-4 text-gold">Institucional</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/mesa-diretora" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors">Mesa Diretora</a></li>
              <li><a href="/comissoes" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors">Comissões</a></li>
              <li><a href="/atividades-legislativa" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors">Atividades Legislativas</a></li>
              <li><a href="/estrutura-organizacional" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors">Estrutura Organizacional</a></li>
              <li><a href="/carta-servicos" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors">Carta de Serviços</a></li>
              <li><a href="/politica-de-privacidade" className="opacity-80 hover:opacity-100 hover:text-gold transition-colors">Política de Privacidade</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-4 text-gold">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span className="opacity-80">{address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <span className="opacity-80">{phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <span className="opacity-80 break-all">{email}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span className="opacity-80">{hours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

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
