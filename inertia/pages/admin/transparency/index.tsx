import { Head, Link, router } from '@inertiajs/react'
import AdminLayout from '~/layouts/AdminLayout'
import { Plus, Pencil, Trash2, Shield, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface Section {
  id: number
  title: string
  slug: string
  display_order: number
  is_active: boolean
  links: { id: number; title: string; url: string; display_order: number; is_external: boolean }[]
}

export default function TransparencyIndex({ sections }: { sections: Section[] }) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  function toggle(id: number) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function handleDeleteSection(id: number, title: string) {
    if (confirm(`Excluir a seção "${title}" e todos os seus links?`)) {
      router.delete(`/painel/transparencia/secoes/${id}`)
    }
  }

  function handleDeleteLink(id: number, title: string) {
    if (confirm(`Excluir o link "${title}"?`)) {
      router.delete(`/painel/transparencia/links/${id}`)
    }
  }

  return (
    <AdminLayout title="Transparência">
      <Head title="Transparência - Painel" />

      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{sections.length} seção(ões) — Portal da Transparência</p>
        <Link href="/painel/transparencia/secoes/criar"
          className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white rounded-xl hover:bg-navy-dark transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Nova Seção
        </Link>
      </div>

      <div className="space-y-3">
        {sections.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhuma seção cadastrada</p>
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {/* Section header */}
              <div className="flex items-center justify-between px-5 py-4">
                <button onClick={() => toggle(section.id)} className="flex items-center gap-3 flex-1 text-left">
                  {expanded[section.id] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  <div>
                    <h3 className="font-medium text-gray-800 text-sm">{section.title}</h3>
                    <p className="text-xs text-gray-400">{section.links.length} link(s) • Ordem: {section.display_order}</p>
                  </div>
                  <span className={`ml-3 inline-block px-2 py-0.5 rounded-full text-xs ${
                    section.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>{section.is_active ? 'Ativa' : 'Inativa'}</span>
                </button>
                <div className="flex items-center gap-1">
                  <Link href={`/painel/transparencia/secoes/${section.id}/links/criar`}
                    className="p-2 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors" title="Adicionar link">
                    <Plus className="w-4 h-4" />
                  </Link>
                  <Link href={`/painel/transparencia/secoes/${section.id}/editar`}
                    className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button onClick={() => handleDeleteSection(section.id, section.title)}
                    className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Links list (expanded) */}
              {expanded[section.id] && section.links.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50/50">
                  {section.links.map((link) => (
                    <div key={link.id} className="flex items-center justify-between px-5 py-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-6">{link.display_order}</span>
                        <span className="text-sm text-gray-700">{link.title}</span>
                        {link.is_external && <ExternalLink className="w-3 h-3 text-gray-400" />}
                        <span className="text-xs text-blue-500 truncate max-w-xs">{link.url}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link href={`/painel/transparencia/links/${link.id}/editar`}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => handleDeleteLink(link.id, link.title)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  )
}
