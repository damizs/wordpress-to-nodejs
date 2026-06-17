/**
 * Sincroniza títulos e classificações oficiais PNTP 2026 (Poder Legislativo)
 * em app/helpers/atricon_matrix.ts, preservando hints/rotas/autoCheck.
 *
 * Fonte: tmp_pntp2026/criteria_2026.json (gerado da planilha oficial)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const JSON_PATH = path.join(ROOT, 'database/pntp2026_criteria.json')
const MATRIX_PATH = path.join(ROOT, 'app/helpers/atricon_matrix.ts')

const APPLY = new Set([
  'COMUM',
  'COMUM (EXCETO ESTATAIS INDEPENDENTES)',
  'COMUM (EXCETO ESTATAIS)',
  'PODER LEGISLATIVO',
])

const DIM_MAP = {
  'Informações Prioritárias': 'prioritarias',
  'Informações Institucionais': 'institucionais',
  Receita: 'receita',
  Despesa: 'despesa',
  'Convênios e Transferências': 'convenios',
  'Recursos Humanos': 'rh',
  Diárias: 'diarias',
  Licitações: 'licitacoes',
  Contratos: 'contratos',
  Obras: 'obras',
  'Planejamento e Prestação de contas': 'planejamento',
  'Serviço de Informação ao Cidadão (SIC)': 'sic',
  'Serviço de Informação ao Cidadão - SIC': 'sic',
  Acessibilidade: 'acessibilidade',
  Ouvidorias: 'ouvidoria',
  'Lei Geral de Proteção de Dados (LGPD) e Governo Digital': 'lgpd',
  'Atividades Finalísticas - PL': 'legislativo',
}

/** Erratas e notas técnicas PNTP 2026 (jun/2026). */
const HINT_PATCHES = {
  '3.1':
    'Duodécimos/repasses com previsão e realização. Para o Legislativo, a atualidade considera o repasse até o dia 20 de cada mês (art. 168 CF). Geralmente via portal de transparência do sistema contábil.',
  '4.3':
    'Detalhamento individualizado do empenho: credor/beneficiário, valor, objeto e nº do procedimento licitatório. Critério essencial desde 2026. Sem exigência de gravação de relatórios (errata 15/06/2026).',
  '6.1':
    'Tabela HTML com nome, cargo/função, lotação setorial (setor/departamento — não basta “Câmara Municipal”), datas de admissão/exoneração e carga horária.',
  '6.4':
    'Nome, data de contratação e término. PDF pesquisável aceito para exportação (flexibilização 2026). Declarar inexistência quando for o caso.',
  '6.5':
    'Nome completo, função/atividade e razão social da empregadora. PDF pesquisável aceito para exportação (flexibilização 2026).',
  '8.7':
    'Nomes dos sancionados (art. 156, III e IV, Lei 14.133/2021). PDF pesquisável aceito para exportação. Declarar inexistência quando for o caso.',
  '9.3':
    'No módulo Contratos, preencha fiscal e portaria — a lista consolidada aparece no site. PDF pesquisável aceito para exportação (flexibilização 2026).',
  '14.1':
    'Endereço físico, telefone e horário da Ouvidoria no portal (sistema externo).',
  '20.3':
    'Ementa, anexos/PDF, situação, autor e relator. PDF pesquisável + botão Baixar PDF na listagem (/atividades-legislativas). Relator pode constar quando houver.',
  '20.4':
    'Pautas publicadas antes das sessões. PDF pesquisável conta como exportação/gravação de relatórios (errata 02/04/2026).',
  '20.5':
    'Pautas das comissões (aceita pauta conjunta). PDF pesquisável aceito para exportação (flexibilização 2026).',
  '20.6':
    'Atas do Plenário com lista de presença. PDF pesquisável aceito para exportação (flexibilização 2026).',
}

const { all: criteria } = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'))
const official = Object.fromEntries(
  criteria.filter((c) => APPLY.has(c.matriz)).map((c) => [c.code, c])
)

let src = fs.readFileSync(MATRIX_PATH, 'utf8')

// Cabeçalho
src = src.replace(
  /\/\*\*[\s\S]*?\*\/\s*\nexport type AtriconClassification/,
  `/**
 * Matriz PNTP/ATRICON 2026 — Poder Legislativo Municipal (Câmara).
 * Fonte oficial: planilha "Matriz de Critérios 2026 (Final)" + Erratas (abr–jun/2026)
 * + Nota Técnica PNTP (15/06/2026) + Síntese das alterações ciclo 2026.
 *
 * Aplicável ao Legislativo: matriz COMUM (60) + COMUM exceto estatais
 * independentes (4) + COMUM exceto estatais (8) + PODER LEGISLATIVO (11)
 * = 83 critérios.
 *
 * Classificação: essencial (2) | obrigatória (1,5) | recomendada (1).
 * Itens de verificação: disponibilidade, atualidade, série histórica,
 * gravação de relatórios e filtro de pesquisa (variam por critério).
 */

export type AtriconClassification`
)

// Dimensão LGPD
src = src.replace(
  "{ key: 'lgpd', label: 'LGPD e Governo Digital', weight: 1 }",
  "{ key: 'lgpd', label: 'LGPD e Governo Digital', weight: 1 }"
)

let updated = 0
for (const [code, off] of Object.entries(official)) {
  const escTitle = off.title.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  const re = new RegExp(
    `(code: '${code.replace('.', '\\.')}',\\s+dimension: ')[^']+(',\\s+title: ')(?:\\\\'|[^'])*(',\\s+classification: ')(\\w+)(')`,
    's'
  )
  const dimKey = DIM_MAP[off.dimension] || off.dimension
  if (re.test(src)) {
    src = src.replace(re, `$1${dimKey}$2${escTitle}$3${off.classification}$5`)
    updated++
  }

  if (HINT_PATCHES[code]) {
    const hintRe = new RegExp(
      `(code: '${code.replace('.', '\\.')}'[\\s\\S]*?hint: ')(?:\\\\'|[^'])*(')`,
      's'
    )
    const hintEsc = HINT_PATCHES[code].replace(/\\/g, '\\\\').replace(/'/g, "\\'")
    if (hintRe.test(src)) {
      src = src.replace(hintRe, `$1${hintEsc}$2`)
    }
  }
}

// Errata 4.3 — remover Gravação de relatórios
src = src.replace(
  /(code: '4\.3',[\s\S]*?verification: \[)([^\]]*G[^\]]*)(\])/,
  (m, pre, mid, post) => {
    const items = mid
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !s.includes('Gravação'))
    return `${pre}${items.join(', ')}${post}`
  }
)

fs.writeFileSync(MATRIX_PATH, src, 'utf8')
console.log(`Synced ${updated} criteria titles/classifications. Patched hints.`)
