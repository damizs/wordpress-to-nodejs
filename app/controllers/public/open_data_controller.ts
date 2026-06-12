import type { HttpContext } from '@adonisjs/core/http'
import Councilor from '#models/councilor'
import LegislativeActivity from '#models/legislative_activity'
import Licitacao from '#models/licitacao'
import OfficialPublication from '#models/official_publication'
import NominalVoting from '#models/nominal_voting'
import PlenarySession from '#models/plenary_session'

type Row = Record<string, string | number | boolean | null>

interface DatasetMeta {
  id: string
  title: string
  description: string
  fields: string[]
}

/** Catálogo exibido na página /dados-abertos (mantido em sincronia com QUERIES) */
const DATASETS: DatasetMeta[] = [
  {
    id: 'vereadores',
    title: 'Vereadores',
    description: 'Composição atual da Câmara: nome, nome parlamentar, partido, cargo e contatos.',
    fields: ['id', 'nome', 'nome_parlamentar', 'partido', 'cargo', 'email', 'telefone'],
  },
  {
    id: 'materias',
    title: 'Matérias Legislativas',
    description:
      'Projetos de lei, requerimentos e demais proposições com tipo, número, ano, ementa, autoria e situação.',
    fields: [
      'id',
      'tipo',
      'numero',
      'ano',
      'titulo',
      'ementa',
      'situacao',
      'autor',
      'data_sessao',
      'arquivo',
    ],
  },
  {
    id: 'licitacoes',
    title: 'Licitações',
    description:
      'Processos licitatórios da Câmara: modalidade, objeto, valor estimado, datas e situação.',
    fields: [
      'id',
      'titulo',
      'numero',
      'modalidade',
      'situacao',
      'objeto',
      'valor_estimado',
      'data_abertura',
      'ano',
    ],
  },
  {
    id: 'publicacoes',
    title: 'Publicações Oficiais',
    description: 'Portarias, decretos, editais e demais atos oficiais publicados pela Câmara.',
    fields: ['id', 'titulo', 'tipo', 'numero', 'data_publicacao', 'descricao', 'arquivo'],
  },
  {
    id: 'votacoes',
    title: 'Votações Nominais',
    description: 'Resultado das votações em plenário, com data, matéria votada e resultado.',
    fields: ['id', 'titulo', 'descricao', 'data_votacao', 'ano', 'resultado', 'unanime'],
  },
  {
    id: 'sessoes',
    title: 'Sessões Plenárias',
    description: 'Agenda e histórico das sessões: tipo, data, situação e link do vídeo.',
    fields: ['id', 'titulo', 'tipo', 'data_sessao', 'ano', 'situacao', 'video'],
  },
]

const QUERIES: Record<string, () => Promise<Row[]>> = {
  async vereadores() {
    const rows = await Councilor.query()
      .where('is_active', true)
      .orderBy('display_order')
      .orderBy('name')
    return rows.map((c) => ({
      id: c.id,
      nome: c.name,
      nome_parlamentar: c.parliamentaryName,
      partido: c.party,
      cargo: c.role,
      email: c.email,
      telefone: c.phone,
    }))
  },
  async materias() {
    const rows = await LegislativeActivity.query()
      .where('is_active', true)
      .orderBy('year', 'desc')
      .orderBy('id', 'desc')
    return rows.map((a) => ({
      id: a.id,
      tipo: a.type,
      numero: a.number,
      ano: a.year,
      titulo: a.title,
      ementa: a.summary,
      situacao: a.status,
      autor: a.author,
      data_sessao: a.sessionDate,
      arquivo: a.fileUrl,
    }))
  },
  async licitacoes() {
    const rows = await Licitacao.query()
      .where('is_active', true)
      .orderBy('year', 'desc')
      .orderBy('id', 'desc')
    return rows.map((l) => ({
      id: l.id,
      titulo: l.title,
      numero: l.number,
      modalidade: l.modality,
      situacao: l.status,
      objeto: l.object,
      valor_estimado: l.estimatedValue,
      data_abertura: l.openingDate,
      ano: l.year,
    }))
  },
  async publicacoes() {
    const rows = await OfficialPublication.query().orderBy('publication_date', 'desc')
    return rows.map((p) => ({
      id: p.id,
      titulo: p.title,
      tipo: p.type,
      numero: p.number,
      data_publicacao: p.publicationDate,
      descricao: p.description,
      arquivo: p.fileUrl,
    }))
  },
  async votacoes() {
    const rows = await NominalVoting.query()
      .where('is_published', true)
      .orderBy('voting_date', 'desc')
    return rows.map((v) => ({
      id: v.id,
      titulo: v.title,
      descricao: v.description,
      data_votacao: v.votingDate,
      ano: v.year,
      resultado: v.result,
      unanime: v.isUnanimous,
    }))
  },
  async sessoes() {
    const rows = await PlenarySession.query().orderBy('session_date', 'desc')
    return rows.map((s) => ({
      id: s.id,
      titulo: s.title,
      tipo: s.type,
      data_sessao: s.sessionDate,
      ano: s.year,
      situacao: s.status,
      video: s.videoUrl,
    }))
  },
}

/** CSV com separador ";" (padrão Excel pt-BR) e BOM UTF-8 */
function toCsv(rows: Row[], fields: string[]): string {
  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return ''
    const text = String(value)
    return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }
  const lines = [
    fields.join(';'),
    ...rows.map((row) => fields.map((f) => escape(row[f])).join(';')),
  ]
  const bom = String.fromCharCode(0xfeff)
  return bom + lines.join('\r\n')
}

export default class OpenDataController {
  async index({ inertia }: HttpContext) {
    return inertia.render('public/dados-abertos/index', { datasets: DATASETS })
  }

  async dataset({ params, response }: HttpContext) {
    const dataset = String(params.dataset || '').toLowerCase()
    const format = String(params.format || '').toLowerCase()

    const meta = DATASETS.find((d) => d.id === dataset)
    if (!meta || !['json', 'csv'].includes(format)) {
      return response.notFound({ error: 'Conjunto de dados ou formato não encontrado.' })
    }

    const rows = await QUERIES[dataset]()
    response.header('Cache-Control', 'public, max-age=300')

    if (format === 'csv') {
      response.header('Content-Type', 'text/csv; charset=utf-8')
      response.header('Content-Disposition', `attachment; filename="${dataset}.csv"`)
      return response.send(toCsv(rows, meta.fields))
    }

    response.header('Content-Disposition', `attachment; filename="${dataset}.json"`)
    return response.json({
      conjunto: dataset,
      fonte: 'Câmara Municipal de Sumé - PB',
      gerado_em: new Date().toISOString(),
      total: rows.length,
      dados: rows,
    })
  }
}
