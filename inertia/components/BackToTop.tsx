import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      aria-label="Voltar ao topo"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed left-3 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-40 flex h-11 w-11 items-center justify-center rounded-full bg-navy text-white shadow-lg transition-all duration-500 hover:-translate-y-1 hover:bg-gold hover:text-navy-dark hover:shadow-md sm:left-6 sm:bottom-6 sm:h-12 sm:w-12 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  )
}
