// Extrai os links do plugin links-rapidos do WordPress e gera
// database/wp_quick_links.json.
//
// Tabelas: <prefix>lr_links e <prefix>lr_secoes.
// No site antigo, secao_id=1 era "Acesso Rapido" e secao_id=2 era
// "Acesso a Informacao". O importador usa os dois grupos, mas so grava os
// links da secao 1 como atalhos da home.
//
// Uso: node scripts/extract_wp_quick_links.mjs [caminho/para/database.sql]

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sqlPath = process.argv[2] || 'tmp/wp_backup_sume_20260615/database.sql'
const sql = readFileSync(sqlPath, 'utf-8')
const TICK = String.fromCharCode(96)

function findTable(suffix) {
  const re = new RegExp('CREATE TABLE ' + TICK + '([a-z0-9_]*' + suffix + ')' + TICK)
  const match = sql.match(re)
  return match ? match[1] : null
}

function columnsOf(table) {
  const re = new RegExp('CREATE TABLE ' + TICK + table + TICK + ' \\(([\\s\\S]*?)\\n\\) ENGINE', 'm')
  const match = sql.match(re)
  if (!match) return []

  const columns = []
  for (const line of match[1].split('\n')) {
    const columnMatch = line.match(new RegExp('^\\s*' + TICK + '([^' + TICK + ']+)' + TICK))
    if (columnMatch) columns.push(columnMatch[1])
  }
  return columns
}

function decodeSqlValue(value) {
  const trimmed = value.trim()
  if (trimmed === 'NULL') return null
  return trimmed
    .replace(/\\0/g, '\0')
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/\\b/g, '\b')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
}

function splitTuple(tuple) {
  const values = []
  let current = ''
  let inString = false

  for (let i = 0; i < tuple.length; i++) {
    const char = tuple[i]
    if (inString) {
      if (char === '\\') {
        current += char + tuple[i + 1]
        i++
      } else if (char === "'") {
        inString = false
      } else {
        current += char
      }
    } else if (char === "'") {
      inString = true
    } else if (char === ',') {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }

  values.push(current)
  return values.map(decodeSqlValue)
}

function tuplesOf(valuesSql) {
  const tuples = []
  let current = ''
  let inString = false
  let depth = 0

  for (let i = 0; i < valuesSql.length; i++) {
    const char = valuesSql[i]

    if (inString) {
      current += char
      if (char === '\\') {
        current += valuesSql[i + 1] || ''
        i++
      } else if (char === "'") {
        inString = false
      }
      continue
    }

    if (char === "'") {
      inString = true
      current += char
      continue
    }

    if (char === '(') {
      if (depth > 0) current += char
      depth++
      continue
    }

    if (char === ')') {
      depth--
      if (depth === 0) {
        tuples.push(current)
        current = ''
      } else {
        current += char
      }
      continue
    }

    if (depth > 0) current += char
  }

  return tuples
}

function rowsOf(table) {
  const columns = columnsOf(table)
  const rows = []
  const re = new RegExp('INSERT INTO ' + TICK + table + TICK + '[^\\n]*?VALUES\\s*([\\s\\S]*?);\\s*\\n', 'g')
  let match

  while ((match = re.exec(sql))) {
    for (const tuple of tuplesOf(match[1])) {
      const values = splitTuple(tuple)
      const row = {}
      columns.forEach((column, index) => {
        row[column] = values[index]
      })
      rows.push(row)
    }
  }

  return rows
}

const linksTable = findTable('lr_links')
const sectionsTable = findTable('lr_secoes')
if (!linksTable) {
  console.error('Tabela lr_links nao encontrada no dump.')
  process.exit(1)
}

const sections = sectionsTable ? rowsOf(sectionsTable) : []
const sectionsById = new Map(sections.map((section) => [String(section.id), section]))

const records = rowsOf(linksTable)
  .map((row) => ({
    wpId: Number.parseInt(row.id || '0') || null,
    secao_id: String(row.secao_id || ''),
    sectionTitle: sectionsById.get(String(row.secao_id))?.titulo || null,
    title: row.titulo || '',
    url: row.url || '',
    icon: row.icone || row.icon || null,
    color: row.cor || row.color || null,
    active: row.ativo !== '0',
    displayOrder: Number.parseInt(row.ordem || '0') || 0,
  }))
  .filter((row) => row.title && row.url)
  .sort((a, b) => a.secao_id.localeCompare(b.secao_id) || a.displayOrder - b.displayOrder)

const bySection = {}
for (const record of records) {
  bySection[record.secao_id] = (bySection[record.secao_id] || 0) + 1
}

const out = {
  generatedAt: new Date().toISOString(),
  source: sqlPath,
  sourceTables: {
    links: linksTable,
    sections: sectionsTable,
  },
  totals: {
    records: records.length,
    bySection,
  },
  records,
}

const outPath = join(__dirname, '..', 'database', 'wp_quick_links.json')
writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf-8')
console.log('OK ->', outPath)
console.log('links:', records.length, '| secoes:', JSON.stringify(bySection))
