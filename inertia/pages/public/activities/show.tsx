import { Link } from '@inertiajs/react'
import { TopBar } from '~/components/TopBar'
import { Header } from '~/components/Header'
import { Footer } from '~/components/Footer'
import { Breadcrumb } from '~/components/Breadcrumb'
import SeoHead from '~/components/SeoHead'
import { ArrowLeft, Download } from 'lucide-react'

const typeLabels: Record<string, string> = {
  projeto_lei: 'Projeto de Lei', requerimento: 'Requerimento', mocao: 'Moção',
  indicacao: 'Indicação', resolucao: 'Resolução', emenda: 'Emenda',
}

interface Props { activity: any }

export default function ActivityShow({ activity }: Props) {
  const title = `${typeLabels[activity.type] || activity.type} Nº ${activity.number}/${activity.year}`
  
  return (
    <>
      <SeoHead
        title={`${title} - Câmara Municipal de Sumé`}
        description={activity.summary}
        url={`/atividades-legislativas/${activity.id}`}
      />
      <div className="min-h-screen bg-background">
        <TopBar />
        <Header />
        <main>
          <Breadcrumb items={[
            { label: 'Atividades Legislativas', href: '/atividades-legislativas' },
            { label: title }
          ]} />
          
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-4xl">
              <Link href="/atividades-legislativas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Link>
              <article className="card-modern p-8">
                <h1 className="text-2xl font-bold text-foreground mb-3">{title}</h1>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                    activity.status === 'aprovado' ? 'bg-green-100 text-green-700' : 
                    activity.status === 'rejeitado' ? 'bg-red-100 text-red-600' : 
                    activity.status === 'arquivado' ? 'bg-gray-200 text-gray-600' : 
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {activity.status}
                  </span>
                  {activity.author && <span className="text-sm bg-muted text-muted-foreground px-3 py-1 rounded-full">Autor: {activity.author}</span>}
                  {activity.session_date && <span className="text-sm bg-muted text-muted-foreground px-3 py-1 rounded-full">Sessão: {activity.session_date}</span>}
                </div>
                <div className="mb-6">
                  <h2 className="font-semibold text-foreground mb-2">Ementa</h2>
                  <p className="text-muted-foreground leading-relaxed">{activity.summary}</p>
                </div>
                {activity.content && (
                  <div className="mb-6">
                    <h2 className="font-semibold text-foreground mb-2">Conteúdo</h2>
                    <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: activity.content }} />
                  </div>
                )}
                {activity.file_url && (
                  <a href={activity.file_url} target="_blank" rel="noopener"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
                    <Download className="w-4 h-4" /> Baixar documento
                  </a>
                )}
              </article>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  )
}
