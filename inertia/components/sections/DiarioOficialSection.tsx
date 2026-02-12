import { BookOpen, Download, Calendar, ArrowRight } from 'lucide-react'

interface GazetteItem { id: number; editionNumber: string; publicationDate: string; description: string | null; fileUrl: string | null }

export function DiarioOficialSection({ latestGazette }: { latestGazette: GazetteItem | null }) {
  return (
    <section className="py-16 px-4 bg-navy-50">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-100 text-navy-700 text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" /> Diário Oficial
            </div>
            <h2 className="text-3xl font-heading font-bold text-navy-900 mb-4">Diário Oficial Eletrônico</h2>
            <p className="text-navy-600 mb-6">Acompanhe as publicações oficiais da Câmara Municipal de Sumé.</p>
            <a href="/diario-oficial" className="group inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white rounded-xl font-medium hover:bg-navy-800 transition-colors">
              Ver todas as edições <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
          {latestGazette ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-navy-100">
              <div className="flex items-center gap-2 text-navy-400 text-sm mb-3">
                <Calendar className="w-4 h-4" />
                {new Date(latestGazette.publicationDate).toLocaleDateString('pt-BR')}
              </div>
              <h3 className="font-heading font-bold text-navy-900 text-xl mb-2">Edição Nº {latestGazette.editionNumber}</h3>
              {latestGazette.description && <p className="text-navy-600 text-sm mb-4">{latestGazette.description}</p>}
              {latestGazette.fileUrl && (
                <a href={latestGazette.fileUrl} className="inline-flex items-center gap-2 px-4 py-2 bg-gold-400 text-navy-900 rounded-lg text-sm font-medium hover:bg-gold-500 transition-colors" target="_blank">
                  <Download className="w-4 h-4" /> Baixar PDF
                </a>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-navy-100 text-center text-navy-400">
              Nenhuma edição publicada ainda.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
