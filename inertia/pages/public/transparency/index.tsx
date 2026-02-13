import { Head } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { PageHero } from '~/components/PageHero'
import { ExternalLink, Shield, FolderOpen } from 'lucide-react'

interface Props { sections: any[] }

export default function TransparencyIndex({ sections }: Props) {
  return (
    <PublicLayout>
      <Head title="Portal da Transparência - Câmara de Sumé" />
      <PageHero title="Portal da Transparência" subtitle="Acesse informações sobre a gestão pública municipal conforme a Lei de Acesso à Informação"
        icon={<Shield className="w-8 h-8" />} breadcrumbs={[{ label: 'Transparência' }]} />
      <section className="py-10 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sections.map((s: any) => (
              <div key={s.id} className="bg-white rounded-lg border hover:border-navy/30 hover:shadow-md transition-all overflow-hidden">
                <div className="bg-navy/5 px-5 py-4 border-b">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-navy" /> {s.title}
                  </h3>
                </div>
                <div className="p-4">
                  {s.links?.map((l: any) => (
                    <a key={l.id} href={l.url} target={l.url?.startsWith('http') ? '_blank' : '_self'} rel="noopener"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 hover:text-navy hover:bg-gray-50 rounded-lg transition-colors">
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" /> {l.title}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {sections.length === 0 && (
            <div className="bg-white rounded-lg border p-12 text-center"><Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Seções de transparência em construção.</p></div>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}
