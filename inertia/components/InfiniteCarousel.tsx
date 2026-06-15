import { useEffect, useRef, type ReactNode } from "react";

interface InfiniteCarouselProps {
  children: ReactNode;
  /** Classe de gap aplicada no trilho flex. Default: 'gap-6' */
  gapClass?: string;
  /** Velocidade do auto-scroll em px por frame (~60fps). Default: 0.6 */
  speed?: number;
  /** Rótulo acessível da região do carrossel */
  ariaLabel?: string;
  /** Classe extra opcional no container externo */
  className?: string;
}

/**
 * Carrossel "marquee" de loop infinito.
 *
 * Renderiza os filhos DUAS vezes lado a lado dentro de um trilho flex `w-max`.
 * A cada frame (requestAnimationFrame) incrementa `scrollLeft`; quando o scroll
 * passa da largura de UMA cópia (medida real via offsetWidth da primeira cópia),
 * subtrai essa largura do scrollLeft. Como a segunda cópia é idêntica à
 * primeira, a emenda é imperceptível e o loop nunca termina.
 *
 * Para a emenda ser perfeita, o gap ENTRE as duas cópias precisa ser igual ao
 * gap interno. Por isso o trilho aplica `gapClass` diretamente sobre os cards
 * (ambas as cópias são renderizadas via Fragment, sem wrappers que quebrariam o
 * espaçamento) e a largura de UMA cópia é medida pelo primeiro "trecho".
 *
 * Pausa: hover (pointerenter), foco interno (focusin/out) e interação manual
 * (arrasto/scroll/touch/wheel), retomando ~2s após a última interação.
 * Respeita prefers-reduced-motion (fica estático, mas ainda scrollável).
 */
export const InfiniteCarousel = ({
  children,
  gapClass = "gap-6",
  speed = 0.6,
  ariaLabel,
  className = "",
}: InfiniteCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const secondCopyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    const secondCopy = secondCopyRef.current;
    if (!container || !track || !secondCopy) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let rafId = 0;
    let hoverPaused = false; // pausa por hover/foco
    let manualPausedUntil = 0; // timestamp até quando ficar pausado por interação manual

    // Distância exata de UMA volta = posição (offsetLeft) da segunda cópia
    // dentro do trilho. Inclui o gap entre as cópias, então a emenda fica
    // perfeita: ao subtrair esse valor o conteúdo coincide pixel a pixel.
    const half = () => secondCopy.offsetLeft;

    const step = () => {
      const paused = hoverPaused || performance.now() < manualPausedUntil;
      if (!paused) {
        container.scrollLeft += speed;
        const h = half();
        if (h > 0 && container.scrollLeft >= h) {
          container.scrollLeft -= h;
        }
      }
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);

    const onEnter = () => {
      hoverPaused = true;
    };
    const onLeave = () => {
      hoverPaused = false;
    };
    const onFocusIn = () => {
      hoverPaused = true;
    };
    const onFocusOut = () => {
      if (!container.contains(document.activeElement)) hoverPaused = false;
    };
    const pauseForManual = () => {
      manualPausedUntil = performance.now() + 2000;
    };

    // Mantém o wraparound coerente durante arrasto/scroll manual
    const onScroll = () => {
      const h = half();
      if (h <= 0) return;
      if (container.scrollLeft >= h) container.scrollLeft -= h;
      else if (container.scrollLeft < 0) container.scrollLeft += h;
    };

    container.addEventListener("pointerenter", onEnter);
    container.addEventListener("pointerleave", onLeave);
    container.addEventListener("focusin", onFocusIn);
    container.addEventListener("focusout", onFocusOut);
    container.addEventListener("wheel", pauseForManual, { passive: true });
    container.addEventListener("touchmove", pauseForManual, { passive: true });
    container.addEventListener("pointerdown", pauseForManual);
    container.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener("pointerenter", onEnter);
      container.removeEventListener("pointerleave", onLeave);
      container.removeEventListener("focusin", onFocusIn);
      container.removeEventListener("focusout", onFocusOut);
      container.removeEventListener("wheel", pauseForManual);
      container.removeEventListener("touchmove", pauseForManual);
      container.removeEventListener("pointerdown", pauseForManual);
      container.removeEventListener("scroll", onScroll);
    };
  }, [speed]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={ariaLabel}
      className={`overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      <div ref={trackRef} className={`flex w-max ${gapClass}`}>
        {children}
        {/* Segunda cópia idêntica para o loop; oculta para leitores de tela */}
        <div ref={secondCopyRef} className={`flex w-max ${gapClass}`} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
};
