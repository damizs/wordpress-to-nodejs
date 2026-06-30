import { Link, usePage } from "@inertiajs/react";
import {
  ChevronDown,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";
import { useSiteSettings } from "~/hooks/use_site_settings";
import { isPublicHrefBlocked } from "~/lib/public-access";

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
      { label: "E-SIC", href: "/#esic" },
      { label: "Ouvidoria", href: "/ouvidoria" },
      { label: "Licitações", href: "/licitacoes" },
      { label: "Vereadores", href: "/vereadores" },
      { label: "Atas", href: "/atas" },
      { label: "Mapa do Site", href: "/mapa-do-site" },
      { label: "Dados Abertos", href: "/dados-abertos" },
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

/** Colunas editáveis no painel (/painel/menus); cai no padrão se a setting estiver vazia. */
function parseFooterColumns(raw: string | null | undefined): FooterColumn[] {
  if (!raw) return defaultFooterColumns;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultFooterColumns;
    return parsed
      .filter((column: any) => column && column.title)
      .map((column: any) => ({
        title: String(column.title),
        links: Array.isArray(column.links)
          ? column.links
              .filter((link: any) => link && link.label && link.href)
              .map((link: any) => ({ label: String(link.label), href: String(link.href) }))
          : [],
      }));
  } catch {
    return defaultFooterColumns;
  }
}

function filterBlockedFooterColumns(
  columns: FooterColumn[],
  settings: Record<string, string | null | undefined>
) {
  return columns
    .map((column) => ({
      ...column,
      links: column.links.filter((link) => !isPublicHrefBlocked(settings, link.href)),
    }))
    .filter((column) => column.links.length > 0);
}

export const Footer = ({ logoUrl }: FooterProps) => {
  const settings = useSiteSettings();
  const page = usePage();
  const currentUrl = page.url;
  const isEmbed = /[?&]embed=1/.test(currentUrl);
  const footerColumns = filterBlockedFooterColumns(parseFooterColumns(settings.footer_columns), settings);

  const resolvedLogo = logoUrl ?? settings.logo_url ?? null;
  // Nome institucional: prioriza o setting editável (Aparência); o fallback vem
  // da identidade compartilhada (config/camara via props), em MAIÚSCULAS como o
  // chrome usa. Sem literal de tenant — se a identidade não vier, fica vazio.
  const camaraNome =
    (page.props as { camara?: { nome: string } }).camara?.nome || "";
  const headerTitle = settings.header_title || camaraNome.toUpperCase();
  const [titleFirstWord = "", ...titleRest] = headerTitle.split(" ");
  const description =
    settings.footer_description ||
    "Comprometida com a transparência e o bem-estar da população.";
  // Contato vem 100% de settings (Aparência → Rodapé & Contato); fallback vazio
  // esconde cada item abaixo (sem chumbar endereço/telefone/e-mail de tenant).
  const address = settings.footer_address || "";
  const phone = settings.footer_phone || "";
  const email = settings.footer_email || "";
  const hours = settings.footer_hours || "Seg a Sex, 8h às 14h";

  const socials = [
    { icon: Facebook, label: "Facebook", url: settings.social_facebook },
    { icon: Instagram, label: "Instagram", url: settings.social_instagram },
    { icon: Youtube, label: "YouTube", url: settings.social_youtube },
  ].map((social) => {
    const configured = social.url && social.url.trim() !== "";
    return {
      icon: social.icon,
      label: social.label,
      href: configured ? social.url!.trim() : "/",
      external: !!configured,
    };
  });

  if (isEmbed) return null;

  const renderFooterLink = (link: FooterLink, className: string) =>
    link.href.startsWith("http") ? (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {link.label}
      </a>
    ) : (
      <Link href={link.href} className={className}>
        {link.label}
      </Link>
    );

  return (
    <footer className="bg-navy-dark text-primary-foreground">
      <div className="h-0.5 w-full bg-gold/60" />

      <div className="container min-w-0 py-8 sm:py-10 lg:py-16">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 lg:gap-12">
          <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.04] p-5 text-center md:text-left lg:max-w-xs lg:border-0 lg:bg-transparent lg:p-0">
            <div className="mb-4 flex items-center justify-center gap-3 md:justify-start lg:mb-5">
              {resolvedLogo ? (
                <img
                  src={resolvedLogo}
                  alt={headerTitle}
                  className="h-14 w-auto max-w-[14rem] object-contain sm:h-16"
                />
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary-foreground/30 bg-primary-foreground/10">
                    <span className="text-xl font-bold">{titleFirstWord.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-tight">{titleFirstWord}</h3>
                    <p className="text-sm text-gold">{titleRest.join(" ")}</p>
                  </div>
                </>
              )}
            </div>

            <p className="mx-auto mb-5 max-w-sm text-sm leading-relaxed text-primary-foreground/72 md:mx-0 lg:mb-6">
              {description}
            </p>

            <div className="flex justify-center gap-3 md:justify-start">
              {socials.map((social, index) => {
                const Icon = social.icon;
                const className =
                  "flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground/90 transition-colors duration-200 hover:bg-gold hover:text-navy-dark";
                return social.external ? (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className={className}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                ) : (
                  <Link
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    title={social.label}
                    className={className}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </Link>
                );
              })}
            </div>
          </div>

          {footerColumns.map((column, columnIndex) => (
            <div key={columnIndex}>
              <details className="group rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.04] md:hidden">
                <summary className="flex min-h-[3.5rem] cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wider [&::-webkit-details-marker]:hidden">
                  {column.title}
                  <ChevronDown
                    className="h-4 w-4 text-gold transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <ul className="space-y-1 border-t border-primary-foreground/10 px-3 pb-3 pt-2 text-sm">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      {renderFooterLink(
                        link,
                        "block rounded-xl px-3 py-2.5 text-primary-foreground/72 transition-colors duration-200 no-underline hover:bg-primary-foreground/10 hover:text-gold"
                      )}
                    </li>
                  ))}
                </ul>
              </details>

              <div className="hidden md:block">
                <h4 className="mb-2 text-sm font-bold uppercase tracking-wider">{column.title}</h4>
                <div className="mb-5 h-0.5 w-8 rounded-full bg-gold" />
                <ul className="space-y-3 text-sm">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      {renderFooterLink(
                        link,
                        "text-primary-foreground/70 transition-colors duration-200 no-underline hover:text-gold"
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.04] p-5 lg:border-0 lg:bg-transparent lg:p-0">
            <h4 className="mb-2 text-sm font-bold uppercase tracking-wider">Contato</h4>
            <div className="mb-5 h-0.5 w-8 rounded-full bg-gold" />
            <ul className="space-y-3 text-sm lg:space-y-4">
              {address && (
                <li className="flex items-start gap-3 rounded-xl bg-primary-foreground/[0.03] p-3 lg:bg-transparent lg:p-0">
                  <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gold" />
                  <span className="leading-relaxed text-primary-foreground/75">{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-3 rounded-xl bg-primary-foreground/[0.03] p-3 lg:bg-transparent lg:p-0">
                  <Phone className="h-[18px] w-[18px] shrink-0 text-gold" />
                  <a
                    href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                    className="text-primary-foreground/75 no-underline transition-colors hover:text-gold"
                  >
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li className="flex items-start gap-3 rounded-xl bg-primary-foreground/[0.03] p-3 lg:bg-transparent lg:p-0">
                  <Mail className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gold" />
                  <a
                    href={`mailto:${email}`}
                    className="break-words text-primary-foreground/75 no-underline transition-colors [overflow-wrap:anywhere] hover:text-gold"
                  >
                    {email}
                  </a>
                </li>
              )}
              {hours && (
                <li className="flex items-start gap-3 rounded-xl bg-primary-foreground/[0.03] p-3 lg:bg-transparent lg:p-0">
                  <Clock className="mt-0.5 h-[18px] w-[18px] shrink-0 text-gold" />
                  <span className="text-primary-foreground/75">{hours}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container py-4 sm:py-5">
          <div className="flex flex-col items-center justify-between gap-2 text-center text-[11px] leading-relaxed sm:text-xs md:flex-row md:text-left">
            <p className="max-w-full text-primary-foreground/60 [overflow-wrap:anywhere]">
              © {new Date().getFullYear()} {headerTitle}. Todos os direitos reservados.
            </p>
            <p className="max-w-full text-primary-foreground/50 [overflow-wrap:anywhere]">
              Desenvolvido com transparência e compromisso público.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
