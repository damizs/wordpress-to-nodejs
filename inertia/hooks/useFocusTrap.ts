import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(active: boolean, onEscape?: () => void) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lastFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return

    lastFocused.current = document.activeElement as HTMLElement

    const focusables = () => {
      if (!containerRef.current) return [] as HTMLElement[]
      return Array.from(containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
    }

    focusables()[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onEscape?.()
        return
      }
      if (e.key !== 'Tab') return

      const els = focusables()
      if (els.length === 0) return

      const first = els[0]
      const last = els[els.length - 1]
      const current = document.activeElement

      if (e.shiftKey && current === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && current === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      lastFocused.current?.focus?.()
    }
  }, [active, onEscape])

  return containerRef
}
