// Extrai as materias sincronizadas pelo plugin diario-oficial-sync do WordPress
// e gera database/wp_diario_oficial.json.
//
// Tabela: <prefix>dos_materias. As credenciais do GET Public ficam em
// wp_options (dos_*), mas NAO sao exportadas por este script.
//
// Uso: node scripts/extract_wp_diario.mjs [caminho/para/database.sql]

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

function decodeHtml(text) {
  if (!text) return ''
  const named = {
    amp: '&',
    apos: "'",
    ccedil: 'ç',
    Ccedil: 'Ç',
    Atilde: 'Ã',
    atilde: 'ã',
    Aacute: 'Á',
    aacute: 'á',
    Acirc: 'Â',
    acirc: 'â',
    Agrave: 'À',
    agrave: 'à',
    Eacute: 'É',
    eacute: 'é',
    Ecirc: 'Ê',
    ecirc: 'ê',
    Iacute: 'Í',
    iacute: 'í',
    Oacute: 'Ó',
    oacute: 'ó',
    Ocirc: 'Ô',
    ocirc: 'ô',
    Otilde: 'Õ',
    otilde: 'õ',
    Uacute: 'Ú',
    uacute: 'ú',
    nbsp: ' ',
    ordm: 'º',
    ordf: 'ª',
    quot: '"',
  }

  return text.replace(/&(#x?[0-9a-f]+|[a-zA-Z]+);/g, (full, entity) => {
    if (entity[0] === '#') {
      const isHex = entity[1]?.toLowerCase() === 'x'
      const code = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : full
    }
    return Object.prototype.hasOwnProperty.call(named, entity) ? named[entity] : full
  })
}

function dateOnly(value) {
  if (!value) return null
  const match = String(value).match(/\d{4}-\d{2}-\d{2}/)
  return match ? match[0] : null
}

function getpublicPdfUrl(code) {
  // Visualizador público da matéria (mesmo link do site). NÃO usar /api/document/<id>/pdf.
  return /^\d{14}$/.test(code || '')
    ? `https://getpublic.inf.br/system/visualizar-materia?materia=${code}&link=CMSU`
    : null
}

const table = findTable('dos_materias')
if (!table) {
  console.error('Tabela dos_materias nao encontrada no dump.')
  process.exit(1)
}

const rows = rowsOf(table)
const records = rows
  .map((row) => {
    const code = row.materia_codigo || ''
    const title = decodeHtml(row.materia_titulo || '').replace(/\s+/g, ' ').trim()
    const content = decodeHtml(row.materia_conteudo || '').trim() || null
    return {
      codigo: code,
      titulo: title,
      tipo: decodeHtml(row.materia_tipo || '').trim() || null,
      data: dateOnly(row.materia_data || row.created_at),
      link: row.materia_link || null,
      pdfUrl: getpublicPdfUrl(code) || row.materia_link || null,
      postId: row.post_id ? Number.parseInt(row.post_id, 10) : null,
      tipoEntidadeId: row.tipo_entidade_id ? Number.parseInt(row.tipo_entidade_id, 10) : null,
      createdAt: row.created_at || null,
      content,
    }
  })
  .filter((record) => record.codigo && record.titulo)
  .sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')))

const byYear = {}
for (const record of records) {
  const year = record.data?.slice(0, 4) || 'sem-data'
  byYear[year] = (byYear[year] || 0) + 1
}

const out = {
  generatedAt: new Date().toISOString(),
  source: sqlPath,
  sourceTable: table,
  totals: {
    records: records.length,
    years: byYear,
  },
  records,
}

const outPath = join(__dirname, '..', 'database', 'wp_diario_oficial.json')
writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf-8')
console.log('OK ->', outPath)
console.log('registros:', records.length)
console.log('anos:', JSON.stringify(byYear))
