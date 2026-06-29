import { useEffect } from 'react'

/**
 * Motor de animações on-scroll. Elementos com [data-reveal] entram com um
 * reveal sutil (fade + leve translate/zoom; timing/easing em app.css) ao
 * atingir o viewport — uma única vez, com stagger via data-reveal-delay.
 * Direções: data-reveal="" | "up" | "left" | "right" | "zoom".
 * Respeita prefers-reduced-motion e funciona entre navegações Inertia.
 */
export function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = document.documentElement
    root.classList.add('js-anim')

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    )

    const scan = () => {
      const elements = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-revealed)')
      elements.forEach((el) => {
        if (el.dataset.revealBound) return
        el.dataset.revealBound = 'true'

        // Acima da dobra no primeiro paint: mostra sem animar (evita flash)
        const rect = el.getBoundingClientRect()
        if (rect.top < window.innerHeight * 0.9) {
          el.classList.add('is-revealed', 'no-transition')
          requestAnimationFrame(() => el.classList.remove('no-transition'))
          return
        }

        const delay = Number(el.dataset.revealDelay) || 0
        if (delay) el.style.transitionDelay = `${delay}ms`
        io.observe(el)
      })
    }

    scan()

    // Re-escaneia quando o Inertia troca de página. Debounce via rAF: uma
    // varredura por frame, mesmo com muitas mutações do React (perf).
    let frame = 0
    const mo = new MutationObserver(() => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        scan()
      })
    })
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      io.disconnect()
      mo.disconnect()
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return null
}
