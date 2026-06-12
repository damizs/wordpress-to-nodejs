import { Link, usePage } from "@inertiajs/react";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube } from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";
import { HolidaysStrip } from "~/components/HolidaysStrip";

interface FooterProps {
  logoUrl?: string | null;
}

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const defaultFooterColumns: FooterColumn[] = [
  {
    title: "Links Úteis",
    links: [
      { label: "Portal da Transparência", href: "/transparencia" },
      { label: "E-SIC", href: "/transparencia" },
      { label: "Ouvidoria", href: "/ouvidoria" },
      { label: "Licitações", href: "/licitacoes" },
      { label: "Vereadores", href: "/vereadores" },
      { label: "Atas", href: "/atas" },
    ],
  },
  {
    title: "Institucional",
    links: [
      { label: "A Câmara", href: "/historia-da-camara" },
      { label: "Mesa Diretora", href: "/mesa-diretora" },
      { label: "Comissões", href: "/comissoes" },
      { label: "Publicações Oficiais", href: "/publicacoes-oficiais" },
      { label: "Leis Municipais", href: "/leis" },
      { label: "Política de Privacidade", href: "/politica-de-privacidade" },
    ],
  },
];

/** Colunas editáveis no painel (/painel/menus); cai no padrão se a setting estiver vazia */
function parseFooterColumns(raw: string | null | undefined): FooterColumn[] {
  if (!raw) return defaultFooterColumns;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultFooterColumns;
    return parsed
      .filter((c: any) => c && c.title)
      .map((c: any) => ({
        title: String(c.title),
        links: Array.isArray(c.links)
          ? c.links
              .filter((l: any) => l && l.label && l.href)
              .map((l: any) => ({ label: String(l.label), href: String(l.href) }))
          : [],
      }));
  } catch {
    return defaultFooterColumns;
  }
}

export const Footer = ({ logoUrl }: FooterProps) => {
  const settings = useSiteSettings();
  // Modo embed (?embed=1): página renderizada dentro de um modal/iframe — sem rodapé
  const { url: currentUrl } = usePage();
  const isEmbed = /[?&]embed=1/.test(currentUrl);
  const footerColumns = parseFooterColumns(settings.footer_columns);

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

  const socials = [
    { icon: Facebook, url: settings.social_facebook },
    { icon: Instagram, url: settings.social_instagram },
    { icon: Youtube, url: settings.social_youtube },
  ].filter((s) => s.url && s.url.trim() !== "");

  if (isEmbed) return null;

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

          {/* Colunas de links (editáveis em /painel/menus) */}
          {footerColumns.map((column, ci) => (
            <div key={ci}>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-1.5">{column.title}</h4>
              <div className="w-8 h-0.5 bg-gold rounded-full mb-4" />
              <ul className="space-y-2.5 text-sm">
                {column.links.map((link, li) => (
                  <li key={li}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block opacity-75 hover:opacity-100 hover:text-gold hover:translate-x-1 transition-all duration-200 no-underline"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="inline-block opacity-75 hover:opacity-100 hover:text-gold hover:translate-x-1 transition-all duration-200 no-underline"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

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

      {/* Próximos feriados — linha discreta acima da bottom bar */}
      <div className="container mx-auto">
        <HolidaysStrip variant="footer" />
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
