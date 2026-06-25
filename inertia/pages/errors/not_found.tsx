import { Link } from "@inertiajs/react";
import { SeoHead } from "../../components/SeoHead";

export default function NotFound() {
  return (
    <>
      <SeoHead
        title="Página não encontrada"
        description="A página que você procura não foi encontrada no Portal da Câmara Municipal de Sumé."
      />
      <main className="min-h-screen bg-background text-foreground flex items-center">
        <div className="container py-16 lg:py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Erro 404
          </p>
          <h1 className="mt-3 text-3xl lg:text-4xl font-bold text-navy">
            Página não encontrada
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            A página que você tentou acessar não existe, foi movida ou está
            temporariamente indisponível.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              Voltar para a página inicial
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
