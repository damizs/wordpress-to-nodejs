// Extrai os Registros de Informação (PNTP) do dump do WordPress (plugin
// portal-transparencia) e gera database/wp_pntp.json.
//
// Tabelas: <prefix>pntp_registros, <prefix>pntp_anexos, <prefix>pntp_declaracoes.
// Cada anexo traz a URL COMPLETA do PDF no site ao vivo — o importador
// (app/services/wp_pntp_importer.ts) baixa esses arquivos para o portal.
//
// Uso:
//   node scripts/extract_wp_pntp.mjs [caminho/para/database.sql] [saida.json]

import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sqlPath = process.argv[2] || 'C:/Users/arauj/Downloads/_bkp_sume/database.sql'
const outPath = process.argv[3] || join(__dirname, '..', 'database', 'wp_pntp.json')
const sql = readFileSync(sqlPath, 'utf-8')
const TICK = String.fromCharCode(96)

function findTable(suffix) {
  const re = new RegExp('CREATE TABLE ' + TICK + '([a-z0-9_]*' + suffix + ')' + TICK, 'i')
  const m = sql.match(re)
  return m ? m[1] : null
}

function columnsOf(table) {
  const re = new RegExp('CREATE TABLE ' + TICK + table + TICK + ' \\(([\\s\\S]*?)\\n\\) ENGINE', 'm')
  const m = sql.match(re)
  if (!m) return []
  const cols = []
  for (const line of m[1].split('\n')) {
    const cm = line.match(new RegExp('^\\s*' + TICK + '([^' + TICK + ']+)' + TICK))
    if (cm) cols.push(cm[1])
  }
  return cols
}

function splitTuple(t) {
  const out = []
  let cur = ''
  let inStr = false
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (inStr) {
      if (c === '\\') {
        cur += c + t[i + 1]
        i++
      } else if (c === "'") {
        inStr = false
      } else cur += c
    } else {
      if (c === "'") inStr = true
      else if (c === ',') {
        out.push(cur)
        cur = ''
      } else cur += c
    }
  }
  out.push(cur)
  return out.map((v) => {
    const x = v.trim()
    if (x === 'NULL') return null
    return x
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\r/g, '')
      .replace(/\\n/g, '\n')
      .replace(/\\\\/g, '\\')
  })
}

function rowsOf(table) {
  const cols = columnsOf(table)
  const rows = []
  const re = new RegExp('INSERT INTO ' + TICK + table + TICK + '[^\\n]*?VALUES\\s*(.*?);\\s*\\n', 'gs')
  let m
  while ((m = re.exec(sql))) {
    const tuples = m[1].replace(/^\(/, '').replace(/\)$/, '').split(/\),\s*\(/)
    for (const tup of tuples) {
      const vals = splitTuple(tup)
      const obj = {}
      cols.forEach((c, i) => (obj[c] = vals[i]))
      rows.push(obj)
    }
  }
  return rows
}

const regTable = findTable('pntp_registros')
const anxTable = findTable('pntp_anexos')
const decTable = findTable('pntp_declaracoes')
if (!regTable) {
  console.error('Tabela pntp_registros não encontrada no dump.')
  process.exit(1)
}

const registros = rowsOf(regTable)
const anexos = anxTable ? rowsOf(anxTable) : []
const declaracoes = decTable ? rowsOf(decTable) : []

// anexos por registro
const anexosByReg = new Map()
for (const a of anexos) {
  const rid = a.registro_id
  if (!anexosByReg.has(rid)) anexosByReg.set(rid, [])
  anexosByReg.get(rid).push({
    nome: a.nome_arquivo || null,
    url: a.url || null,
    mime: a.tipo_mime || null,
    ordem: Number.parseInt(a.ordem || '0') || 0,
  })
}

// declarações ativas: secao+ano -> texto (fallback de conteúdo)
const decBySecaoAno = new Map()
for (const d of declaracoes) {
  if (d.ativo === '1' && d.texto) decBySecaoAno.set(`${d.secao}|${d.ano}`, d.texto)
}

const records = registros.map((r) => {
  const list = (anexosByReg.get(r.id) || []).sort((x, y) => x.ordem - y.ordem)
  return {
    secao: r.secao,
    ano: Number.parseInt(r.ano || '0') || null,
    titulo: r.titulo || '',
    conteudo: (r.conteudo && r.conteudo.trim()) || decBySecaoAno.get(`${r.secao}|${r.ano}`) || null,
    dataReferencia: r.data_referencia || null,
    ordem: Number.parseInt(r.ordem || '0') || 0,
    ativo: r.ativo !== '0',
    anexos: list,
  }
})

const secCount = {}
for (const r of records) secCount[r.secao] = (secCount[r.secao] || 0) + 1

const out = {
  generatedAt: new Date().toISOString(),
  source: sqlPath,
  totals: {
    registros: records.length,
    anexos: anexos.length,
    declaracoesAtivas: decBySecaoAno.size,
    secoes: Object.keys(secCount).length,
  },
  secoesCount: secCount,
  records,
}

writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf-8')
console.log('OK →', outPath)
console.log('registros:', records.length, '| anexos:', anexos.length, '| seções:', Object.keys(secCount).length)
console.log('seções:', JSON.stringify(secCount))
