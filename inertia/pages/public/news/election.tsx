import { SeoHead } from "~/components/SeoHead";
import { TopBar } from "~/components/TopBar";
import { Header } from "~/components/Header";
import { Breadcrumb } from "~/components/Breadcrumb";
import { PageHero } from "~/components/PageHero";
import { Footer } from "~/components/Footer";
import { ElectionModeNotice } from "~/components/ElectionModeNotice";
import { DEFAULT_ELECTION_MESSAGE } from "~/lib/election-mode";

interface Props {
  message?: string;
}

export default function NewsElection({ message = DEFAULT_ELECTION_MESSAGE }: Props) {
  return (
    <>
      <SeoHead
        title="Notícias temporariamente indisponíveis - Câmara Municipal de Sumé"
        description="Conteúdo institucional temporariamente indisponível durante o período eleitoral."
        url="/noticias"
      />
      <div className="min-h-screen bg-background overflow-x-clip">
        <TopBar />
        <Header />
        <Breadcrumb items={[{ label: "Notícias" }]} />
        <PageHero
          badge="Período eleitoral"
          title="Notícias temporariamente indisponíveis"
          subtitle={message}
        />

        <main id="conteudo" tabIndex={-1} role="main">
          <section className="py-10 lg:py-14">
            <div className="container">
              <ElectionModeNotice message={message} />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
