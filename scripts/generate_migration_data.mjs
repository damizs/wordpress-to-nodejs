// Gera os 2 JSONs consumidos por `node ace wp:migrate` a partir de um dump
// MySQL do WordPress (database.sql) — GENERALIZADO para QUALQUER câmara.
//
//   database/migration_data.json  → news, vereadores, faqs, mesa_diretora,
//                                    comissoes, survey_questions
//   database/migration_extra.json → lr_links, registros_pntp, anexos_pntp,
//                                    materias, publicacoes, pub_attachments,
//                                    atas, ata_attachments, transparencia
//
// Uso:
//   node scripts/generate_migration_data.mjs <database.sql> [prefixo] \
//        [saida_migration_data.json] [saida_migration_extra.json]
//
//   argv[2] = caminho do database.sql       (default: tmp_wp/database.sql)
//   argv[3] = prefixo das tabelas (override) senão env WP_TABLE_PREFIX,
//             senão AUTO-DETECT (<prefixo>posts), senão 'sql_camarasume'
//   argv[4] = saída do migration_data.json  (default: database/migration_data.json)
//   argv[5] = saída do migration_extra.json (default: database/migration_extra.json)
//
// IMPORTANTE: passe argv[4]/argv[5] (ex.: /tmp/...) para NÃO sobrescrever os
// arquivos committados do Sumé ao validar.
//
// Os CPTs/tabelas são os mesmos em todas as câmaras (plugins: vereador,
// publicacoes, atas, transparencia, perguntas-frequentes, links-rapidos,
// portal-transparencia/pntp_*, pesquisa-satisfacao/ps_config, JetEngine CCT
// materia). Mesa Diretora e Comissões são páginas institucionais (HTML).
import fs from 'node:fs'
import readline from 'node:readline'
import { dirname } from 'node:path'

const SQL = process.argv[2] || 'tmp_wp/database.sql'
const OUT_DATA = process.argv[4] || 'database/migration_data.json'
const OUT_EXTRA = process.argv[5] || 'database/migration_extra.json'

// ── Prefixo das tabelas (mesma precedência dos scripts extract_wp_*.mjs) ──
async function detectTablePrefix(sqlPath, fallback) {
  try {
    const rl = readline.createInterface({
      input: fs.createReadStream(sqlPath, 'utf8'),
      crlfDelay: Infinity,
    })
    for await (const line of rl) {
      const m = line.match(/^CREATE TABLE `?([a-z0-9_]*)posts`?/i)
      if (m) {
        rl.close()
        return m[1]
      }
    }
  } catch {
    /* dump ilegível/ausente: usa o fallback */
  }
  return fallback
}

const PREFIX =
  process.argv[3] || process.env.WP_TABLE_PREFIX || (await detectTablePrefix(SQL, 'sql_camarasume'))

// ── Parser RAW dos tuplos de um INSERT ──────────────────────────────────────
// Devolve cada valor exatamente como está no dump, PRESERVANDO as sequências de
// escape do MySQL (\r \n \" \' \\). É assim que o gerador original do Sumé
// gravava `content`/`titulo`/etc. — o consumidor (commands/wp_migrate.ts →
// cleanContent) é quem desfaz `\r\n`, `\"`, `\\`, `\'`. NULL vira null.
function parseRowsRaw(payload) {
  const rows = []
  let i = 0
  const n = payload.length
  const skipWs = () => {
    while (i < n && /\s/.test(payload[i])) i++
  }
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
            // mantém a barra E o próximo caractere (raw); só consome p/ delimitar
            s += c + (payload[i + 1] ?? '')
            i += 2
            continue
          }
          if (c === "'") {
            i++
            break
          }
          s += c
          i++
        }
        val = s
      } else {
        let s = ''
        while (i < n && payload[i] !== ',' && payload[i] !== ')') {
          s += payload[i]
          i++
        }
        s = s.trim()
        val = s === 'NULL' ? null : s
      }
      row.push(val)
      skipWs()
      if (payload[i] === ',') {
        i++
        continue
      }
      if (payload[i] === ')') {
        i++
        break
      }
    }
    rows.push(row)
    skipWs()
    if (payload[i] === ',') {
      i++
      continue
    }
  }
  return rows
}

// Desfaz os escapes do MySQL — usado só para PARSEAR HTML das páginas
// institucionais (Mesa Diretora / Comissões), nunca para os campos de conteúdo.
function sqlUnescape(s) {
  return String(s || '')
    .replace(/\\r/g, '')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, ' ')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\//g, '/')
    .replace(/\\\\/g, '\\')
}

const DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g')
const slugify = (text) =>
  String(text || '')
    .normalize('NFKD')
    .replace(DIACRITICS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const stripAccents = (text) =>
  String(text || '')
    .normalize('NFKD')
    .replace(DIACRITICS, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

// Title-case PT-BR: minúsculas em conectivos; capitaliza após hífen.
const LOWER_WORDS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'as', 'os', 'em', 'para',
  'com', 'por', 'no', 'na', 'nos', 'nas', 'ao', 'aos', 'à', 'às',
])
const capWord = (w) =>
  w
    .split('-')
    .map((p) => (p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : p))
    .join('-')
const titleCasePt = (s) =>
  String(s || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .split(' ')
    .map((w, idx) => (idx > 0 && LOWER_WORDS.has(w) ? w : capWord(w)))
    .join(' ')

// Normaliza caminho/URL de upload → relativo a wp-content/uploads (ex.: "2025/01/3.png")
function normalizeUploadPath(value) {
  if (!value) return null
  let text = String(value).trim()
  if (!text) return null
  text = text.replace(/&amp;/g, '&')
  const marker = '/wp-content/uploads/'
  const idx = text.toLowerCase().indexOf(marker)
  if (idx >= 0) text = text.slice(idx + marker.length)
  text = text.replace(/^https?:\/\/[^/]+\/wp-content\/uploads\//i, '')
  text = text.replace(/^\/?wp-content\/uploads\//i, '')
  text = text.replace(/^\/+/, '')
  text = text.split(/[?#]/)[0]
  text = text.replace(/\\/g, '/')
  if (!text || text.includes('..')) return null
  return text
}
const extOf = (path) => {
  const m = String(path || '').match(/\.([a-z0-9]+)$/i)
  return m ? m[1] : 'jpg'
}

// ─────────────────────────────────────────────────────────────────────────────
// LEITURA DO DUMP (streaming)
// ─────────────────────────────────────────────────────────────────────────────
const KEEP_POST_TYPES = new Set([
  'post', 'page', 'vereador', 'publicacoes', 'atas', 'transparencia', 'attachment',
  'perguntas-frequentes', 'faq',
])
const VEREADOR_META = {
  _foto: 'foto',
  '_nome-parlamentar': 'nome_parlamentar',
  _genero: 'genero',
  '_estado-civil': 'estado_civil',
  '_grau-de-instrucao': 'grau_instrucao',
  '_e-mail': 'email',
  _historia: 'bio',
  _descricao: 'descricao',
}
// Tabelas "planas" coletadas como objetos {coluna: valor}
const FLAT_TABLES = new Set([
  'lr_links', 'pntp_registros', 'pntp_anexos', 'ps_config', 'jet_cct_materia',
])

const createCols = {}
const posts = new Map() // id -> {type,status,title,name,date,content,excerpt,parent,mime}
const thumbId = new Map() // postId -> attachmentId
const attachedFile = new Map() // attachmentId/postId -> uploads path
const vereadorMeta = new Map() // postId -> {foto,nome_parlamentar,...}
const terms = new Map() // term_id -> {name,slug}
const taxonomies = new Map() // term_taxonomy_id -> {termId,taxonomy}
const termRelationships = [] // [object_id, term_taxonomy_id]
const flat = Object.fromEntries([...FLAT_TABLES].map((t) => [t, []]))

const rl = readline.createInterface({ input: fs.createReadStream(SQL, 'utf8'), crlfDelay: Infinity })
let curCreate = null

for await (const line of rl) {
  const mCreate = line.match(/^CREATE TABLE `([^`]+)` \(/)
  if (mCreate) {
    curCreate = mCreate[1]
    createCols[curCreate] = []
    continue
  }
  if (curCreate) {
    const mCol = line.match(/^\s*`([^`]+)`\s+/)
    if (mCol) {
      createCols[curCreate].push(mCol[1])
      continue
    }
    if (/^\)\s*ENGINE/.test(line)) {
      curCreate = null
      continue
    }
    if (/^\s*(PRIMARY|UNIQUE|KEY|CONSTRAINT)/.test(line)) continue
  }

  if (!line.startsWith('INSERT INTO ')) continue
  const mIns = line.match(/^INSERT INTO `([^`]+)` (?:\([^)]*\) )?VALUES (.+);\s*$/)
  if (!mIns) continue
  const table = mIns[1]
  const short = table.startsWith(PREFIX) ? table.slice(PREFIX.length) : table
  const cols = createCols[table] || []
  const idx = (name) => cols.indexOf(name)

  if (short === 'posts') {
    const idI = idx('ID')
    const tI = idx('post_type')
    const sI = idx('post_status')
    const tlI = idx('post_title')
    const slI = idx('post_name')
    const dI = idx('post_date')
    const cI = idx('post_content')
    const eI = idx('post_excerpt')
    const pI = idx('post_parent')
    const mI = idx('post_mime_type')
    for (const r of parseRowsRaw(mIns[2])) {
      const type = r[tI]
      if (!KEEP_POST_TYPES.has(type)) continue
      const keepContent =
        type === 'post' ||
        type === 'publicacoes' ||
        type === 'atas' ||
        type === 'page' ||
        type === 'perguntas-frequentes' ||
        type === 'faq'
      posts.set(String(r[idI]), {
        type,
        status: r[sI],
        title: r[tlI] ?? '',
        name: r[slI] ?? '',
        date: r[dI] ?? null,
        content: keepContent ? (r[cI] ?? '') : '',
        excerpt: r[eI] ?? '',
        parent: String(r[pI] ?? '0'),
        mime: r[mI] ?? null,
      })
    }
    continue
  }

  if (short === 'postmeta') {
    const pI = idx('post_id')
    const kI = idx('meta_key')
    const vI = idx('meta_value')
    for (const r of parseRowsRaw(mIns[2])) {
      const postId = String(r[pI])
      const key = r[kI]
      const value = r[vI]
      if (key === '_thumbnail_id') thumbId.set(postId, String(value))
      else if (key === '_wp_attached_file') attachedFile.set(postId, value)
      else if (VEREADOR_META[key]) {
        if (!vereadorMeta.has(postId)) vereadorMeta.set(postId, {})
        vereadorMeta.get(postId)[VEREADOR_META[key]] = value
      }
    }
    continue
  }

  if (short === 'terms') {
    const idI = idx('term_id')
    const nI = idx('name')
    const slI = idx('slug')
    for (const r of parseRowsRaw(mIns[2]))
      terms.set(String(r[idI]), { name: r[nI], slug: r[slI] })
    continue
  }
  if (short === 'term_taxonomy') {
    const ttI = idx('term_taxonomy_id')
    const tI = idx('term_id')
    const txI = idx('taxonomy')
    for (const r of parseRowsRaw(mIns[2]))
      taxonomies.set(String(r[ttI]), { termId: String(r[tI]), taxonomy: r[txI] })
    continue
  }
  if (short === 'term_relationships') {
    const oI = idx('object_id')
    const ttI = idx('term_taxonomy_id')
    for (const r of parseRowsRaw(mIns[2]))
      termRelationships.push([String(r[oI]), String(r[ttI])])
    continue
  }

  if (FLAT_TABLES.has(short)) {
    for (const r of parseRowsRaw(mIns[2])) {
      const obj = {}
      cols.forEach((c, i) => (obj[c] = r[i]))
      flat[short].push(obj)
    }
    continue
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ÍNDICES auxiliares
// ─────────────────────────────────────────────────────────────────────────────
// PDF filho por post (post_parent → 1º anexo .pdf)
const pdfChildByParent = new Map() // parentId -> {path, mime}
for (const [id, p] of posts) {
  if (p.type !== 'attachment') continue
  const file = attachedFile.get(id)
  if (!file || !/\.pdf$/i.test(file)) continue
  if (!pdfChildByParent.has(p.parent)) pdfChildByParent.set(p.parent, { path: file, mime: p.mime || 'application/pdf' })
}
// Categorias por post (taxonomy = category)
const categoriesByPost = new Map()
for (const [objectId, ttId] of termRelationships) {
  const tax = taxonomies.get(ttId)
  if (!tax || tax.taxonomy !== 'category') continue
  const term = terms.get(tax.termId)
  if (!term) continue
  if (!categoriesByPost.has(objectId)) categoriesByPost.set(objectId, [])
  categoriesByPost.get(objectId).push(term)
}

// ─────────────────────────────────────────────────────────────────────────────
// migration_data.json
// ─────────────────────────────────────────────────────────────────────────────

// 1. NEWS — post_type=post publicado na categoria "Notícias" (slug noticias)
const NEWS_CAT = /not[ií]cias?/i
const news = [...posts.entries()]
  .filter(([id, p]) => {
    if (p.type !== 'post' || p.status !== 'publish') return false
    const cats = categoriesByPost.get(id) || []
    return cats.some((c) => NEWS_CAT.test(c.name || '') || NEWS_CAT.test(c.slug || ''))
  })
  .map(([id, p]) => {
    const coverImage = normalizeUploadPath(attachedFile.get(thumbId.get(id)))
    const slug = p.name || slugify(p.title || id)
    return {
      wp_id: id,
      date: p.date,
      content: p.content,
      title: p.title,
      excerpt: p.excerpt,
      slug,
      cover_image: coverImage,
      new_cover: coverImage ? `news/${slug.slice(0, 60)}.${extOf(coverImage)}` : null,
    }
  })
  .sort((a, b) => String(b.date).localeCompare(String(a.date)))

// 2. VEREADORES — CPT vereador publicado (ordenado por wp_id asc)
const vereadores = [...posts.entries()]
  .filter(([, p]) => p.type === 'vereador' && p.status === 'publish')
  .sort((a, b) => Number(a[0]) - Number(b[0]))
  .map(([id, p]) => {
    const meta = vereadorMeta.get(id) || {}
    const photo = normalizeUploadPath(meta.foto)
    const slug = p.name || slugify(p.title || id)
    return {
      wp_id: id,
      name: p.title,
      slug,
      photo,
      new_photo: photo ? `vereadores/${slug}.${extOf(photo)}` : null,
      parliamentary_name: (meta.nome_parlamentar || '').trim(),
      email: (meta.email || '').trim(),
      marital_status: (meta.estado_civil || '').trim(),
      education: (meta.grau_instrucao || '').trim(),
      gender: (meta.genero || '').trim(),
      bio: (meta.bio || meta.descricao || '').trim(),
    }
  })

const vereadorByNorm = new Map(vereadores.map((v) => [stripAccents(v.name), v.name]))
const resolveVereadorName = (raw) => vereadorByNorm.get(stripAccents(raw)) || raw.replace(/\s+/g, ' ').trim()

// 3. FAQs — CPT perguntas-frequentes/faq publicado (question=título, answer=conteúdo)
const faqs = [...posts.values()]
  .filter((p) => /perguntas?-frequentes|^faq$/.test(p.type) && p.status === 'publish')
  // mantém a ordem natural do dump (igual ao gabarito)
  .map((p) => ({ question: p.title, answer: p.content }))

// 4. MESA DIRETORA + 5. COMISSÕES — páginas institucionais (HTML)
const findPageByName = (names, titleRe) => {
  for (const p of posts.values()) {
    if (p.type !== 'page') continue
    if (names.includes((p.name || '').toLowerCase())) return p
  }
  for (const p of posts.values()) {
    if (p.type === 'page' && titleRe.test(p.title || '')) return p
  }
  return null
}

// Mesa Diretora: cada bloco é "{nome do vereador} ... <h2>{CARGO}</h2>"
function parseMesa(page) {
  if (!page) return []
  const html = sqlUnescape(page.content)
  const found = []
  for (const v of vereadores) {
    const at = stripAccents(html).indexOf(stripAccents(v.name))
    if (at < 0) continue
    // procura o nome no texto original respeitando acentos via índice aproximado
    const realAt = html.toLowerCase().indexOf(v.name.toLowerCase())
    const pos = realAt >= 0 ? realAt : at
    const after = html.slice(pos, pos + 400)
    const m = after.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)
    if (!m) continue
    found.push({ name: v.name, role: titleCasePt(m[1].replace(/<[^>]+>/g, ' ')), pos })
  }
  return found
    .sort((a, b) => a.pos - b.pos)
    .map((m, i) => ({ name: m.name, role: m.role, order: i + 1 }))
}

// Comissões: blocos <h3>NOME</h3><p>descr</p> + membros <h4>NOME</h4> ... CARGO
function parseComissoes(page) {
  if (!page) return []
  const html = sqlUnescape(page.content)
  // corpo (após estilos)
  const body = html.includes('<body') ? html.slice(html.indexOf('<body')) : html
  const out = []
  const h3re = /<h3[^>]*>([\s\S]*?)<\/h3>/gi
  const heads = []
  let mh
  while ((mh = h3re.exec(body)) !== null) heads.push({ name: mh[1], start: mh.index, end: h3re.lastIndex })
  for (let k = 0; k < heads.length; k++) {
    const block = body.slice(heads[k].end, k + 1 < heads.length ? heads[k + 1].start : body.length)
    const name = titleCasePt(heads[k].name.replace(/<[^>]+>/g, ' '))
    if (!/comiss/i.test(name)) continue
    // descrição: 1º <p> antes do 1º <h4>
    const beforeMembers = block.split(/<h4[^>]*>/i)[0]
    const pm = beforeMembers.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
    const description = pm ? pm[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : ''
    // membros
    const members = []
    const h4re = /<h4[^>]*>([\s\S]*?)<\/h4>/gi
    let mm
    while ((mm = h4re.exec(block)) !== null) {
      const rawName = mm[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      // texto após o </h4> até o próximo <h4>/<a> — 1ª linha não vazia (sem <p>) = cargo
      let tail = block.slice(h4re.lastIndex).split(/<h4[^>]*>|<a\b/i)[0]
      tail = tail.replace(/<p[^>]*>[\s\S]*?<\/p>/gi, '').replace(/<[^>]+>/g, '\n')
      const role =
        tail
          .split('\n')
          .map((x) => x.trim())
          .filter(Boolean)
          .find((x) => x.toLowerCase() !== 'em exercício') || ''
      members.push({ name: resolveVereadorName(rawName), role })
    }
    out.push({ name, description, members })
  }
  return out
}

const mesaPage = findPageByName(['mesa-diretora', 'mesa', 'mesa_diretora'], /mesa\s+diretora/i)
const comissoesPage = findPageByName(['comissoes', 'comissões', 'comissao', 'comissão'], /comiss[õo]es/i)
const mesa_diretora = parseMesa(mesaPage)
const comissoes = parseComissoes(comissoesPage)

// 6. SURVEY QUESTIONS — ps_config (tipo=camara, ativo=1)
const camaraRows = flat.ps_config.filter((r) => r.tipo === 'camara')
const survey_questions = (camaraRows.length ? camaraRows : flat.ps_config.filter((r) => r.ativo === '1'))
  .filter((r) => r.ativo === '1' || r.ativo === 1)
  .map((r) => ({ number: Number(r.pergunta_numero), text: r.pergunta_texto }))
  .sort((a, b) => a.number - b.number)

// ─────────────────────────────────────────────────────────────────────────────
// migration_extra.json
// ─────────────────────────────────────────────────────────────────────────────

// lr_links (todas as seções)
const lr_links = flat.lr_links
  .map((r) => ({
    id: String(r.id),
    secao_id: String(r.secao_id),
    title: r.titulo || '',
    description: r.descricao || '',
    icon: r.icone || null,
    color: r.cor_icone || null,
    url: r.url || '',
    new_tab: r.abrir_nova_aba === '1' || r.abrir_nova_aba === 1,
    tipo: r.tipo_abertura || null,
    order: Number.parseInt(r.ordem || '0') || 0,
    active: r.ativo !== '0',
  }))
  .sort((a, b) => Number(a.id) - Number(b.id))

// registros_pntp + anexos_pntp (plugin portal-transparencia)
const registros_pntp = flat.pntp_registros
  .map((r) => ({
    id: String(r.id),
    secao: r.secao || '',
    ano: Number.parseInt(r.ano || '0') || null,
    titulo: r.titulo || '',
    conteudo: r.conteudo || '',
    ativo: r.ativo !== '0',
    ordem: Number.parseInt(r.ordem || '0') || 0,
  }))
  .sort((a, b) => Number(a.id) - Number(b.id))
const anexos_pntp = flat.pntp_anexos
  .map((r) => ({
    id: String(r.id),
    registro_id: String(r.registro_id),
    nome: r.nome_arquivo || null,
    path: normalizeUploadPath(r.url),
  }))
  .sort((a, b) => Number(a.id) - Number(b.id))

// materias — JetEngine CCT "materia" (publicadas)
const materias = flat.jet_cct_materia
  .filter((r) => !r.cct_status || r.cct_status === 'publish')
  .map((r) => ({
    id: String(r._ID),
    codigo: r.materia_codigo || '',
    titulo: r.materia_titulo || '',
    tipo: r.materia_tipo || '',
    conteudo: r.materia_conteudo || '',
    dt_publicacao: r.materia_dt_publicacao || null,
  }))
  .sort((a, b) => Number(a.id) - Number(b.id))

// publicacoes + pub_attachments (CPT publicacoes publicado)
const pub_attachments = {}
const publicacoes = [...posts.entries()]
  .filter(([, p]) => p.type === 'publicacoes' && p.status === 'publish')
  .sort((a, b) => Number(a[0]) - Number(b[0]))
  .map(([id, p]) => {
    const pdf = pdfChildByParent.get(id)
    if (pdf) pub_attachments[id] = { path: pdf.path, mime: pdf.mime }
    return {
      wp_id: id,
      date: String(p.date || '').slice(0, 10),
      content: p.content,
      title: p.title,
      slug: p.name || slugify(p.title || id),
    }
  })

// atas + ata_attachments (CPT atas publicado — todas as sessões)
const ata_attachments = {}
const atas = [...posts.entries()]
  .filter(([, p]) => p.type === 'atas' && p.status === 'publish')
  .sort((a, b) => String(a[1].date).localeCompare(String(b[1].date)))
  .map(([id, p]) => {
    const pdf = pdfChildByParent.get(id)
    if (pdf) ata_attachments[id] = pdf.path
    return {
      wp_id: id,
      date: String(p.date || '').slice(0, 10),
      content: p.content,
      title: p.title,
      slug: p.name || slugify(p.title || id),
    }
  })

// transparencia (CPT transparencia publicado)
const transparencia = [...posts.entries()]
  .filter(([, p]) => p.type === 'transparencia' && p.status === 'publish')
  .sort((a, b) => Number(a[0]) - Number(b[0]))
  .map(([id, p]) => ({ wp_id: id, title: p.title }))

// ─────────────────────────────────────────────────────────────────────────────
// SAÍDA
// ─────────────────────────────────────────────────────────────────────────────
const migrationData = { news, vereadores, faqs, mesa_diretora, comissoes, survey_questions }
const migrationExtra = {
  lr_links,
  registros_pntp,
  anexos_pntp,
  materias,
  publicacoes,
  pub_attachments,
  atas,
  ata_attachments,
  transparencia,
}

for (const out of [OUT_DATA, OUT_EXTRA]) {
  const dir = dirname(out)
  if (dir && dir !== '.' && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}
fs.writeFileSync(OUT_DATA, JSON.stringify(migrationData, null, 2), 'utf8')
fs.writeFileSync(OUT_EXTRA, JSON.stringify(migrationExtra, null, 2), 'utf8')

console.log('Prefixo:', PREFIX)
console.log('Fonte  :', SQL)
console.log('— migration_data.json →', OUT_DATA)
console.log(
  `   news=${news.length} vereadores=${vereadores.length} faqs=${faqs.length}` +
    ` mesa_diretora=${mesa_diretora.length} comissoes=${comissoes.length} survey_questions=${survey_questions.length}`
)
console.log('— migration_extra.json →', OUT_EXTRA)
console.log(
  `   lr_links=${lr_links.length} registros_pntp=${registros_pntp.length} anexos_pntp=${anexos_pntp.length}` +
    ` materias=${materias.length} publicacoes=${publicacoes.length} pub_attachments=${Object.keys(pub_attachments).length}` +
    ` atas=${atas.length} ata_attachments=${Object.keys(ata_attachments).length} transparencia=${transparencia.length}`
)
