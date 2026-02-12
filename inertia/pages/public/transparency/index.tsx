import { Head } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { ExternalLink, Shield } from 'lucide-react'

interface Props { sections: any[] }

export default function TransparencyIndex({ sections }: Props) {
  return (
    <PublicLayout>
      <Head title="Portal da Transparência - Câmara de Sumé" />
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <Shield className="w-12 h-12 mx-auto text-navy mb-3" />
            <h1 className="text-3xl font-bold text-gray-900">Portal da Transparência</h1>
            <p className="text-gray-500 mt-2">Acesse informações sobre a gestão da Câmara Municipal</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section: any) => (
              <div key={section.id} className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="font-semibold text-gray-800 text-lg mb-3">{section.name}</h2>
                {section.description && <p className="text-sm text-gray-500 mb-4">{section.description}</p>}
                <div className="space-y-2">
                  {section.links?.map((link: any) => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener"
                      className="flex items-center gap-2 text-sm text-navy hover:underline py-1">
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" /> {link.title}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
