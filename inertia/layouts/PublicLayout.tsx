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
      <TopBar />
      <Header />
      <main id="conteudo" tabIndex={-1} className="flex-1" role="main">
        {children}
      </main>
      <Footer />
    </div>
  )
}
