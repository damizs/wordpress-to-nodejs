import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface InfiniteCarouselProps {
  children: ReactNode;
  /** Classe de gap aplicada no trilho flex. Default: 'gap-6' */
  gapClass?: string;
  /** Velocidade do auto-scroll em px por segundo. Default: 6 (bem suave) */
  speed?: number;
  /** Mostra os botões prev/next (passador). Default: true */
  showArrows?: boolean;
  /** Rótulo acessível da região do carrossel */
  ariaLabel?: string;
  /** Classe extra opcional no container externo */
  className?: string;
}

/**
 * Carrossel "marquee" de loop infinito, com auto-scroll suave + botões de
 * navegação (passador).
 *
 * Renderiza cópias de apoio lado a lado dentro de um trilho flex `w-max`.
 * A cada frame (requestAnimationFrame) incrementa `scrollLeft`; quando o scroll
 * passa da largura de UMA volta (posição da segunda cópia), subtrai essa largura
 * — emenda imperceptível, loop infinito.
 *
 * Pausa: hover, foco interno e interação manual (arrasto/scroll/touch/wheel/
 * clique nos botões), retomando alguns segundos após a última interação. Respeita
 * prefers-reduced-motion (fica estático, mas ainda scrollável e navegável).
 */
export const InfiniteCarousel = ({
  children,
  gapClass = "gap-6",
  speed = 6,
  showArrows = true,
  ariaLabel,
  className = "",
}: InfiniteCarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const secondCopyRef = useRef<HTMLDivElement | null>(null);
  const supportCopyRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [copyCount, setCopyCount] = useState(3);
  // Largura de uma volta cacheada (offsetLeft da segunda copia). Recalculada so no
  // mount, em resize e quando os filhos mudam — NUNCA dentro do loop rAF.
  const halfRef = useRef(0);
  // Posição-alvo do auto-scroll em ponto flutuante. ESSENCIAL: o navegador
  // ARREDONDA `scrollLeft` para o pixel (físico) mais próximo. Ler de volta um
  // `scrollLeft += 0.18` devolve o valor arredondado, então o incremento some a
  // cada frame e o carrossel NUNCA anda. Mantemos a posição num ref float e só
  // escrevemos em `scrollLeft` — o acúmulo passa a ser correto e independente do
  // arredondamento/DPR. Sincronizado com o scroll real só durante interação.
  const posRef = useRef(0);
  const canLoopRef = useRef(false);
  // Pausa por interação manual (timestamp) — compartilhada entre o loop e os
  // botões de navegação (que ficam fora do container de scroll).
  const manualPausedUntilRef = useRef(0);

  // Remove as copias de apoio da ordem de foco/interacao por teclado.
  useEffect(() => {
    supportCopyRefs.current.forEach((copy) => {
      if (copy) copy.inert = true;
    });
  }, [children, copyCount]);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    const secondCopy = secondCopyRef.current;
    if (!container || !track || !secondCopy) return;

    // Largura de UMA volta = offsetLeft da 2ª cópia (inclui o gap entre as
    // cópias, mantendo a emenda invisível). Mantém `posRef` dentro de [0, h).
    const measure = () => {
      const lapWidth = secondCopy.offsetLeft;
      halfRef.current = lapWidth;

      if (lapWidth <= 0) {
        canLoopRef.current = false;
        return;
      }

      const neededCopies = Math.min(
        8,
        Math.max(3, Math.ceil(1 + container.clientWidth / lapWidth + 0.25))
      );
      if (neededCopies !== copyCount) {
        setCopyCount(neededCopies);
      }

      const maxScroll = container.scrollWidth - container.clientWidth;
      const loopDist = lapWidth <= maxScroll ? lapWidth : maxScroll;
      canLoopRef.current = maxScroll > 1 && loopDist > 0;
      if (canLoopRef.current) {
        posRef.current = ((posRef.current % loopDist) + loopDist) % loopDist;
      }
    };
    posRef.current = container.scrollLeft;
    measure();

    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(track);

    // Remede depois que imagens/fontes carregam: antes disso a largura das cópias
    // (logo o offsetLeft) pode estar instável e gerar uma volta errada.
    container.addEventListener("load", measure, true); // captura o load de <img>
    window.addEventListener("load", measure);
    document.fonts?.ready?.then(measure).catch(() => {});

    let hoverPaused = false;
    const isPaused = () => hoverPaused || performance.now() < manualPausedUntilRef.current;

    // Mantém o wraparound coerente durante arrasto/scroll/clique nos botões e
    // ressincroniza a posição-alvo do auto-scroll com o scroll real do usuário.
    const onScroll = () => {
      const h = halfRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const loopDist = h > 0 && h <= maxScroll ? h : maxScroll;
      if (loopDist > 0) {
        if (container.scrollLeft >= loopDist) container.scrollLeft -= loopDist;
        else if (container.scrollLeft < 0) container.scrollLeft += loopDist;
      }
      // Só sincroniza quando o movimento é do usuário (em pausa). Durante o
      // auto-scroll, é o próprio loop que escreve em scrollLeft (valor já
      // arredondado), então NÃO devemos sobrescrever a posição float com ele.
      if (isPaused()) posRef.current = container.scrollLeft;
    };

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
      manualPausedUntilRef.current = performance.now() + 5000;
    };

    container.addEventListener("pointerenter", onEnter);
    container.addEventListener("pointerleave", onLeave);
    container.addEventListener("focusin", onFocusIn);
    container.addEventListener("focusout", onFocusOut);
    container.addEventListener("wheel", pauseForManual, { passive: true });
    container.addEventListener("touchmove", pauseForManual, { passive: true });
    container.addEventListener("pointerdown", pauseForManual);
    container.addEventListener("scroll", onScroll, { passive: true });

    // Auto-scroll só roda se o usuário não pediu redução de movimento.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rafId = 0;
    if (!reduceMotion) {
      let lastTime = 0;
      const step = (now: number) => {
        const elapsed = lastTime ? Math.min(now - lastTime, 64) : 0;
        lastTime = now;
        const paused = hoverPaused || document.hidden || now < manualPausedUntilRef.current;
        if (!paused && canLoopRef.current && elapsed > 0) {
          // Só rola se há overflow real (conteúdo mais largo que o container).
          const maxScroll = container.scrollWidth - container.clientWidth;
          if (maxScroll > 1) {
            const h = halfRef.current;
            // Loop perfeito quando uma volta cabe na faixa rolável (caso normal:
            // 1 cópia já é mais larga que o container). Se houver poucos itens —
            // 1 cópia mais estreita que o container, mas 2 cópias transbordam —
            // o loop seamless é impossível com 2 cópias; cai para um loop simples
            // em maxScroll só para não ficar parado.
            const loopDist = h > 0 && h <= maxScroll ? h : maxScroll;
            let pos = posRef.current + (speed * elapsed) / 1000;
            if (pos >= loopDist) pos -= loopDist;
            posRef.current = pos;
            // Acúmulo no ref float; aqui só projetamos para o scroll real.
            container.scrollLeft = pos;
          }
        }
        rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", measure);
      container.removeEventListener("load", measure, true);
      ro?.disconnect();
      container.removeEventListener("pointerenter", onEnter);
      container.removeEventListener("pointerleave", onLeave);
      container.removeEventListener("focusin", onFocusIn);
      container.removeEventListener("focusout", onFocusOut);
      container.removeEventListener("wheel", pauseForManual);
      container.removeEventListener("touchmove", pauseForManual);
      container.removeEventListener("pointerdown", pauseForManual);
      container.removeEventListener("scroll", onScroll);
    };
  }, [speed, children, copyCount]);

  // Botões de navegação: rolam ~70% da largura visível e pausam o auto-scroll.
  const nudge = (dir: 1 | -1) => {
    const container = containerRef.current;
    if (!container) return;
    manualPausedUntilRef.current = performance.now() + 7000;
    const amount = Math.max(260, container.clientWidth * 0.7);
    container.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  const setSupportCopyRef = (index: number) => (node: HTMLDivElement | null) => {
    supportCopyRefs.current[index] = node;
    if (index === 0) {
      secondCopyRef.current = node;
    }
  };

  const supportCopies = Array.from({ length: Math.max(0, copyCount - 1) });

  return (
    <div className={`relative group max-w-full min-w-0 ${className}`}>
      <div
        ref={containerRef}
        role="region"
        aria-label={ariaLabel}
        className="overflow-x-auto overscroll-x-contain max-w-full [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div ref={trackRef} className={`flex w-max ${gapClass}`}>
          {children}
          {/* Copias de apoio para o loop; ocultas para leitores de tela e fora
              da ordem de foco/interacao via `inert` (aplicado por ref). */}
          {supportCopies.map((_, index) => (
            <div
              key={index}
              ref={setSupportCopyRef(index)}
              className={`flex w-max ${gapClass}`}
              aria-hidden="true"
            >
              {children}
            </div>
          ))}
        </div>
      </div>

      {showArrows && (
        <>
          <button
            type="button"
            onClick={() => nudge(-1)}
            aria-label="Anterior"
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-card border border-border shadow-md items-center justify-center text-foreground hover:bg-muted hover:border-primary/30 transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => nudge(1)}
            aria-label="Próximo"
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-10 h-10 rounded-full bg-card border border-border shadow-md items-center justify-center text-foreground hover:bg-muted hover:border-primary/30 transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};
