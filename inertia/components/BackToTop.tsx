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
      className={`fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full bg-navy text-white shadow-lg flex items-center justify-center transition-all duration-500 hover:bg-gold hover:text-navy-dark hover:shadow-md hover:-translate-y-1 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  )
}
