// Extrai atividades legislativas (CPT `a-legislativa`) + AUTORIA dos vereadores
// (relação JetEngine VEREADOR>>ATIVIDADE = jet_rel_21) de um dump WordPress.
//
// Uso:
//   node scripts/extract_wp_activities.mjs <caminho/database.sql> [prefixo_tabelas]
//   (gera database/wp_activities.json, consumido por `node ace wp:migrate`)
import fs from 'node:fs'
import readline from 'node:readline'

const SQL = process.argv[2] || 'tmp_wp/database.sql'
const OUT = process.argv[4] || 'database/wp_activities.json'
const PREFIX = process.argv[3] || 'sql_camarasume'

function parseRows(payload) {
  const rows = []
  let i = 0
  const n = payload.length
  const skipWs = () => { while (i < n && /\s/.test(payload[i])) i++ }
  while (i < n) {
    skipWs()
    if (payload[i] !== '(') break
    i++
    const row = []
    while (i < n) {
      skipWs()
      let val
      if (payload[i] === "'") {
        i++
        let s = ''
        while (i < n) {
          const c = payload[i]
          if (c === '\\') {
            const nx = payload[i + 1]
            const map = { n: '\n', r: '\r', t: '\t', 0: '\0' }
            s += map[nx] !== undefined ? map[nx] : nx
            i += 2
            continue
          }
          if (c === "'") { i++; break }
          s += c; i++
        }
        val = s
      } else {
        let s = ''
        while (i < n && payload[i] !== ',' && payload[i] !== ')') { s += payload[i]; i++ }
        s = s.trim()
        val = s === 'NULL' ? null : s
      }
      row.push(val)
      skipWs()
      if (payload[i] === ',') { i++; continue }
      if (payload[i] === ')') { i++; break }
    }
    rows.push(row)
    skipWs()
    if (payload[i] === ',') { i++; continue }
  }
  return rows
}

const createCols = {}
const posts = new Map() // id -> {type,title,name,date,content,status}
const meta = new Map() // post_id -> {key:value}
const attachedFile = new Map() // attachment id -> path
const rel21 = []
const WANT_TYPES = new Set(['vereador', 'a-legislativa', 'attachment'])
const WANT_META = new Set([
  '_tipo-de-materia', '_conteudo-e-justificativa', '_conteudo', '_justificativa',
  '_mensagem', '_ano', '_data', '_anexo', '_situacao', '_nome-parlamentar',
  '_wp_attached_file',
])

const rl = readline.createInterface({ input: fs.createReadStream(SQL, 'utf8'), crlfDelay: Infinity })
let curCreate = null
for await (const line of rl) {
  const mCreate = line.match(/^CREATE TABLE `([^`]+)` \(/)
  if (mCreate) { curCreate = mCreate[1]; createCols[curCreate] = []; continue }
  if (curCreate) {
    const mCol = line.match(/^\s*`([^`]+)`\s+/)
    if (mCol) { createCols[curCreate].push(mCol[1]); continue }
    if (/^\)\s*ENGINE/.test(line)) { curCreate = null; continue }
    if (/^\s*(PRIMARY|UNIQUE|KEY|CONSTRAINT)/.test(line)) continue
  }
  if (!line.startsWith('INSERT INTO ')) continue
  const mIns = line.match(/^INSERT INTO `([^`]+)` (?:\([^)]*\) )?VALUES (.+);\s*$/)
  if (!mIns) continue
  const table = mIns[1]
  const short = table.startsWith(PREFIX) ? table.slice(PREFIX.length) : table
  const cols = createCols[table] || []

  if (short === 'posts') {
    const idx = (c) => cols.indexOf(c)
    for (const r of parseRows(mIns[2])) {
      const type = r[idx('post_type')]
      if (!WANT_TYPES.has(type)) continue
      posts.set(r[idx('ID')], {
        type,
        title: r[idx('post_title')],
        name: r[idx('post_name')],
        date: r[idx('post_date')],
        content: r[idx('post_content')],
        status: r[idx('post_status')],
      })
    }
    continue
  }
  if (short === 'postmeta') {
    const pIdx = cols.indexOf('post_id')
    const kIdx = cols.indexOf('meta_key')
    const vIdx = cols.indexOf('meta_value')
    for (const r of parseRows(mIns[2])) {
      const k = r[kIdx]
      if (k === '_wp_attached_file') { attachedFile.set(r[pIdx], r[vIdx]); continue }
      if (!WANT_META.has(k)) continue
      const pid = r[pIdx]
      if (!meta.has(pid)) meta.set(pid, {})
      meta.get(pid)[k] = r[vIdx]
    }
    continue
  }
  if (short === 'jet_rel_21') {
    const pIdx = cols.indexOf('parent_object_id')
    const cIdx = cols.indexOf('child_object_id')
    for (const r of parseRows(mIns[2])) rel21.push([r[pIdx], r[cIdx]])
    continue
  }
}

// Build vereador map
const vereadorIds = new Set([...posts].filter(([, p]) => p.type === 'vereador').map(([id]) => id))
const activityIds = new Set([...posts].filter(([, p]) => p.type === 'a-legislativa').map(([id]) => id))

const slugify = (t) => (t || '')
  .normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)

const vereadorInfo = new Map()
for (const id of vereadorIds) {
  const p = posts.get(id)
  const m = meta.get(id) || {}
  const name = (p.title || '').trim()
  if (!name) continue // ignora registro vazio/rascunho
  vereadorInfo.set(id, {
    wpId: id,
    name,
    parliamentaryName: (m['_nome-parlamentar'] || '').trim() || null,
    slug: p.name || slugify(name),
  })
}
const vereadores = [...vereadorInfo.values()]

// authorship: for each rel row, figure which side is vereador
const authorsByActivity = new Map()
let linkOk = 0
for (const [a, b] of rel21) {
  let vId = null
  let actId = null
  if (vereadorIds.has(a) && activityIds.has(b)) { vId = a; actId = b }
  else if (vereadorIds.has(b) && activityIds.has(a)) { vId = b; actId = a }
  else continue
  if (!authorsByActivity.has(actId)) authorsByActivity.set(actId, new Set())
  authorsByActivity.get(actId).add(vId)
  linkOk++
}

const activities = [...activityIds].map((id) => {
  const p = posts.get(id)
  const m = meta.get(id) || {}
  const title = p.title || ''
  const numMatch = title.match(/n[º°o\.]?\s*([\d.]+)\s*\/\s*(\d{4})/i) || title.match(/([\d.]+)\s*\/\s*(\d{4})/)
  const number = numMatch ? numMatch[1].replace(/\.$/, '') : null
  const yearFromTitle = numMatch ? Number(numMatch[2]) : null
  const year = yearFromTitle || (m['_ano'] ? Number(m['_ano']) : null) ||
    (p.date ? Number(String(p.date).slice(0, 4)) : null)
    const content = m['_conteudo-e-justificativa'] || m['_conteudo'] || p.content || ''
    const ementa = (m['_mensagem'] || m['_justificativa'] || '').trim() || null
    const anexoId = m['_anexo']
  let anexoPath = null
  if (anexoId) {
    const raw = String(anexoId).trim()
    if (raw.includes('/') || /\.pdf$/i.test(raw)) {
      anexoPath = raw.replace(/^https?:\/\/[^/]+\/wp-content\/uploads\//i, '').replace(/^\/+/, '')
    } else if (attachedFile.get(raw)) {
      anexoPath = attachedFile.get(raw)
    }
  }
  const authors = [...(authorsByActivity.get(id) || [])]
    .map((vid) => vereadorInfo.get(vid))
    .filter(Boolean)
    .map((v) => ({ name: v.name, parliamentaryName: v.parliamentaryName, slug: v.slug }))
  return {
    wpId: id,
    title,
    slug: p.name || slugify(title),
    type: m['_tipo-de-materia'] || (title.split(/\s+/)[0] || 'Matéria'),
    number,
    year,
    date: m['_data'] || (p.date ? String(p.date).slice(0, 10) : null),
    situacao: m['_situacao'] || null,
    ementa,
    content,
    anexoPath,
    status: p.status,
    authors,
  }
})

fs.writeFileSync(OUT, JSON.stringify({ vereadores, activities }, null, 2), 'utf8')

// ---- verification summary ----
const withAuthors = activities.filter((a) => a.authors.length > 0).length
const types = {}
activities.forEach((a) => { types[a.type] = (types[a.type] || 0) + 1 })
const published = activities.filter((a) => a.status === 'publish').length
console.log('Vereadores:', vereadores.length)
console.log('Activities:', activities.length, '| published:', published)
console.log('Author links:', linkOk, '| activities with >=1 author:', withAuthors)
console.log('Types:', JSON.stringify(types, null, 2))
console.log('\n-- Sample activities with authors --')
activities.filter((a) => a.authors.length > 0).slice(0, 6).forEach((a) => {
  console.log(`  [${a.type}] ${a.title} (n=${a.number}/${a.year}) anexo=${a.anexoPath ? 'sim' : 'não'}`)
  console.log(`      autores: ${a.authors.map((x) => x.name).join(', ')}`)
})
