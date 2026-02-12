import { Instagram } from 'lucide-react'

export function InstagramFeedSection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-50 text-pink-600 text-sm font-medium mb-4">
          <Instagram className="w-4 h-4" /> Instagram
        </div>
        <h2 className="text-3xl font-heading font-bold text-navy-900 mb-4">Siga-nos no Instagram</h2>
        <p className="text-navy-500 mb-6">Acompanhe as novidades da Câmara Municipal de Sumé</p>
        <a href="https://instagram.com/camaradesume" target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
          <Instagram className="w-5 h-5" /> @camaradesume
        </a>
      </div>
    </section>
  )
}
