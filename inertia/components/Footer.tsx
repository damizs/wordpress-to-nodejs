import { Link } from "@inertiajs/react";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube } from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";

interface FooterProps {
  logoUrl?: string | null;
}

export const Footer = ({ logoUrl }: FooterProps) => {
  const settings = useSiteSettings();

  const resolvedLogo = logoUrl ?? settings.logo_url ?? null;
  const headerTitle = settings.header_title || "CÂMARA MUNICIPAL DE SUMÉ";
  const [titleFirstWord, ...titleRest] = headerTitle.split(" ");
  const description =
    settings.footer_description ||
    "Comprometida com a transparência e o bem-estar da população.";
  const address = settings.footer_address || "Rua Antônio Vieira Lima, S/N, Centro, Sumé - PB";
  const phone = settings.footer_phone || "(83) 3353-1175";
  const email = settings.footer_email || "contato@camaradesume.pb.gov.br";
  const hours = settings.footer_hours || "Seg a Sex, 8h às 14h";
  const esicUrl = settings.esic_new_url && settings.esic_new_url !== "#" ? settings.esic_new_url : "/transparencia";

  const socials = [
    { icon: Facebook, url: settings.social_facebook },
    { icon: Instagram, url: settings.social_instagram },
    { icon: Youtube, url: settings.social_youtube },
  ].filter((s) => s.url && s.url.trim() !== "");

  return (
    <footer className="bg-gradient-navy text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {resolvedLogo ? (
                <img 
                  src={resolvedLogo} 
                  alt={headerTitle} 
                  className="h-16 w-auto object-contain"
                />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center border border-primary-foreground/30">
                    <span className="text-xl font-bold">{titleFirstWord.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{titleFirstWord}</h3>
                    <p className="text-gold text-sm">{titleRest.join(" ")}</p>
                  </div>
                </>
              )}
            </div>
            <p className="text-sm opacity-80 mb-4 leading-relaxed">
              {description}
            </p>
            {socials.length > 0 && (
              <div className="flex gap-3">
                {socials.map((social, index) => (
                  <a
                    key={index}
                    href={social.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-gold hover:text-navy-dark transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-1.5">Links Úteis</h4>
            <div className="w-8 h-0.5 bg-gold rounded-full mb-4" />
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/transparencia" className="inline-block opacity-75 hover:opacity-100 hover:text-gold hover:translate-x-1 transition-all duration-200 no-underline">Portal da Transparência</Link></li>
              <li><a href={esicUrl} target={esicUrl.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="inline-block opacity-75 hover:opacity-100 hover:text-gold hover:translate-x-1 transition-all duration-200 no-underline">E-SIC</a></li>
              <li><Link href="/ouvidoria" className="inline-block opacity-75 hover:opacity-100 hover:text-gold hover:translate-x-1 transition-all duration-200 no-underline">Ouvidoria</Link></li>
              <li><Link href="/licitacoes" className="inline-block opacity-75 hover:opacity-100 hover:text-gold hover:translate-x-1 transition-all duration-200 no-underline">Licitações</Link></li>
              <li><Link href="/vereadores" className="inline-block opacity-75 hover:opacity-100 hover:text-gold hover:translate-x-1 transition-all duration-200 no-underline">Vereadores</Link></li>
              <li><Link href="/atas" className="inline-block opacity-75 hover:opacity-100 hover:text-gold hover:translate-x-1 transition-all duration-200 no-underline">Atas</Link></li>
            </ul>
          </div>

          {/* Institutional */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-1.5">Institucional</h4>
            <div className="w-8 h-0.5 bg-gold rounded-full mb-4" />
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/historia-da-camara" className="inline-block opacity-75 hover:opacity-100 hover:text-gold hover:translate-x-1 transition-all duration-200 no-underline">A Câmara</Link></li>
              <li><Link href="/mesa-diretora" className="inline-block opacity-75 hover:opacity-100 hover:text-gold hover:translate-x-1 transition-all duration-200 no-underline">Mesa Diretora</Link></li>
              <li><Link href="/comissoes" className="inline-block opacity-75 hover:opacity-100 hover:text-gold hover:translate-x-1 transition-all duration-200 no-underline">Comissões</Link></li>
              <li><Link href="/publicacoes-oficiais" className="inline-block opacity-75 hover:opacity-100 hover:text-gold hover:translate-x-1 transition-all duration-200 no-underline">Publicações Oficiais</Link></li>
              <li><Link href="/leis" className="inline-block opacity-75 hover:opacity-100 hover:text-gold hover:translate-x-1 transition-all duration-200 no-underline">Leis Municipais</Link></li>
              <li><Link href="/politica-de-privacidade" className="inline-block opacity-75 hover:opacity-100 hover:text-gold hover:translate-x-1 transition-all duration-200 no-underline">Política de Privacidade</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-1.5">Contato</h4>
            <div className="w-8 h-0.5 bg-gold rounded-full mb-4" />
            <ul className="space-y-3 text-sm">
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <span className="opacity-80">{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gold shrink-0" />
                  <span className="opacity-80">{phone}</span>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gold shrink-0" />
                  <span className="opacity-80 break-all">{email}</span>
                </li>
              )}
              {hours && (
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <span className="opacity-80">{hours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs opacity-70">
            <p>© {new Date().getFullYear()} {headerTitle}. Todos os direitos reservados.</p>
            <p>Desenvolvido com transparência e compromisso público.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
