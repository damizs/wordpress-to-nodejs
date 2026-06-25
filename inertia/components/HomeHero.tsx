import { QuickAccessSection } from "~/components/QuickAccessSection";
import { useSiteSettings } from "~/hooks/use_site_settings";

interface QuickLinkItem {
  title: string;
  url: string;
  icon: string | null;
  color: string | null;
  open_mode?: string | null;
  hide_chrome?: boolean | null;
}

interface HomeHeroProps {
  template: string;
  quickLinks?: QuickLinkItem[];
}

/** Abertura da home — só o modelo Compacto (delega ao QuickAccessSection). */
export function HomeHero({ template, quickLinks = [] }: HomeHeroProps) {
  const settings = useSiteSettings();
  const subtitle = settings.header_subtitle || "Estado da Paraíba";

  if (template !== "compacto") return null;

  return (
    <QuickAccessSection
      variant="compact"
      quickLinks={quickLinks}
      badge={subtitle}
      title="Acesso rápido"
      showSearch
      itemLimit={6}
      showTransparenciaCta={false}
    />
  );
}
