import { Head, Link } from '@inertiajs/react'
import PublicLayout from '~/layouts/PublicLayout'
import { Info, FolderOpen } from 'lucide-react'

interface Props { categories: any[] }

export default function InformationIndex({ categories }: Props) {
  return (
    <PublicLayout>
      <Head title="Acesso à Informação - Câmara de Sumé" />
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <Info className="w-12 h-12 mx-auto text-navy mb-3" />
            <h1 className="text-3xl font-bold text-gray-900">Acesso à Informação</h1>
            <p className="text-gray-500 mt-2">
              Em cumprimento à Lei nº 12.527/2011 (Lei de Acesso à Informação), disponibilizamos
              documentos e informações de interesse público.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat: any) => (
              <Link key={cat.slug} href={`/acesso-informacao/${cat.slug}`}
                className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow group">
                <div className="w-10 h-10 bg-navy/5 rounded-lg flex items-center justify-center mb-3 group-hover:bg-navy/10 transition-colors">
                  <FolderOpen className="w-5 h-5 text-navy" />
                </div>
                <h3 className="font-medium text-gray-800 text-sm">{cat.name}</h3>
              </Link>
            ))}
          </div>

          {categories.length === 0 && (
            <p className="text-center text-gray-400 py-12">Nenhuma categoria cadastrada.</p>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}
