import { Link } from '@inertiajs/react'
import { SeoHead } from '~/components/SeoHead'

export default function ServerError() {
  return (
    <>
      <SeoHead
        title="Erro interno"
        description="Ocorreu um erro inesperado no Portal da Câmara Municipal de Sumé."
      />
      <main className="min-h-screen bg-background text-foreground flex items-center">
        <div className="container py-16 lg:py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Erro 500
          </p>
          <h1 className="mt-3 text-3xl lg:text-4xl font-bold text-foreground">Algo deu errado</h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Ocorreu um erro inesperado ao processar sua solicitação. Já fomos notificados. Tente
            novamente em instantes.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:opacity-90 no-underline"
            >
              Voltar para a página inicial
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
