import type { ReactNode } from "react";

interface SectionHeadingProps {
  /** Eyebrow exibido SEMPRE acima do título (ex.: "Navegação Rápida") */
  badge?: string;
  /** Título principal. Aceita string ou JSX (ex.: título com <br/> e destaque) */
  title: ReactNode;
  /** Subtítulo/descrição opcional */
  subtitle?: ReactNode;
  /** Alinhamento do bloco. 'center' (padrão) centraliza; 'left' alinha à esquerda */
  align?: "center" | "left";
  /** Tom de cor. 'light' (padrão) para fundos claros; 'dark' para fundos escuros */
  tone?: "light" | "dark";
  /**
   * Ação opcional (ex.: link "Ver todas"). No modo 'left' fica à direita do
   * bloco de título via flex; no modo 'center' é renderizada abaixo, centralizada.
   */
  action?: ReactNode;
  /** Classe extra opcional no wrapper */
  className?: string;
}

/**
 * Cabeçalho padronizado das seções: a badge (eyebrow) fica SEMPRE acima do
 * título, com espaçamento e alinhamento idênticos entre as seções.
 */
export const SectionHeading = ({
  badge,
  title,
  subtitle,
  align = "center",
  tone = "light",
  action,
  className = "",
}: SectionHeadingProps) => {
  const isDark = tone === "dark";
  const isLeft = align === "left";

  const badgeClass = isDark
    ? "inline-block px-4 py-1.5 bg-white/15 text-white rounded-full text-xs font-semibold tracking-wider uppercase mb-4"
    : "inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold tracking-wider uppercase mb-4";

  const titleColor = isDark ? "text-white" : "text-foreground";
  const titleAccent = isLeft ? "heading-accent heading-accent-left" : "heading-accent";
  const titleClass = `${titleAccent} text-2xl md:text-3xl lg:text-4xl font-bold ${titleColor} mb-4`;

  const subtitleColor = isDark ? "text-white/70" : "text-muted-foreground";
  const subtitleClass = isLeft
    ? `${subtitleColor} max-w-2xl text-lg`
    : `${subtitleColor} max-w-2xl mx-auto text-lg`;

  const block = (
    <div className={isLeft ? "" : "text-center"}>
      {/* A badge fica em um bloco próprio: o título usa .heading-accent
          (display:inline-block), então sem este wrapper a badge (também
          inline-block) ficaria LADO A LADO com o título em vez de acima. */}
      {badge && (
        <div>
          <span className={badgeClass}>{badge}</span>
        </div>
      )}
      <h2 className={titleClass}>{title}</h2>
      {subtitle && <p className={subtitleClass}>{subtitle}</p>}
    </div>
  );

  if (isLeft) {
    return (
      <div
        className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-12 lg:mb-14 ${className}`.trim()}
        data-reveal
      >
        {block}
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  }

  return (
    <div className={`mb-12 lg:mb-14 ${className}`.trim()} data-reveal>
      {block}
      {action && <div className="mt-6 text-center">{action}</div>}
    </div>
  );
};
