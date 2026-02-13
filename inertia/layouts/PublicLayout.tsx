import { type ReactNode } from 'react'
import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'

interface PublicLayoutProps {
  children: ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip to content - accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:bg-gold focus:text-navy-dark focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium">
        Pular para o conteúdo principal
      </a>
      <TopBar />
      <Header />
      <main id="main-content" className="flex-1" role="main">
        {children}
      </main>
      <Footer />
    </div>
  )
}
