// Extracts the public WordPress legacy archive: posts, pages and upload references.
// Usage:
//   node scripts/extract_wp_legacy_content.mjs <database.sql> [table_prefix] [output.json]
//
// The generated file is consumed by `node ace wp:legacy-content`.
import fs from 'node:fs'
import readline from 'node:readline'

const SQL = process.argv[2] || 'tmp_wp/database.sql'
const OUT = process.argv[4] || 'database/wp_legacy_content.json'

// Prefixo das tabelas do dump — generalizado para QUALQUER câmara.
// Precedência: 1) argv[3] (override explícito) · 2) env WP_TABLE_PREFIX (mesma
// chave lida por config/camara.ts) · 3) AUTO-DETECT escaneando o dump por uma
// tabela `<prefixo>posts` · 4) fallback no default de Sumé ('sql_camarasume').
// DEFAULT = Sumé: sem arg/env, o auto-detect encontra `sql_camarasumeposts` e
// devolve 'sql_camarasume' — saída idêntica ao comportamento atual.
async function detectTablePrefix(sqlPath, fallback) {
  try {
    const rl = readline.createInterface({
      input: fs.createReadStream(sqlPath, 'utf8'),
      crlfDelay: Infinity,
    })
    for await (const line of rl) {
      // Captura tudo ANTES de `posts` (o dump de Sumé não usa '_' antes de posts;
      // um dump WP padrão `wp_posts` devolve o prefixo 'wp_').
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

function parseRows(payload) {
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
            const nx = payload[i + 1]
            const map = { n: '\n', r: '\r', t: '\t', 0: '\0' }
            s += map[nx] !== undefined ? map[nx] : nx
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

const slugify = (text) =>
  String(text || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120)

function safeDecode(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function normalizeUploadPath(value) {
  if (!value) return null
  let text = String(value).trim()
  if (!text || text.startsWith('data:')) return null
  text = text.replace(/&amp;/g, '&')

  const marker = '/wp-content/uploads/'
  const markerIndex = text.toLowerCase().indexOf(marker)
  if (markerIndex >= 0) text = text.slice(markerIndex + marker.length)
  text = text.replace(/^https?:\/\/[^/]+\/wp-content\/uploads\//i, '')
  text = text.replace(/^\/?wp-content\/uploads\//i, '')
  text = text.replace(/^\/+/, '')
  text = text.split(/[?#]/)[0]
  text = safeDecode(text)
  text = text.replace(/\\/g, '/')
  if (!text || text.includes('..')) return null
  return text
}

function collectUploadsFromContent(content) {
  const out = new Set()
  const html = String(content || '')
  const re =
    /(?:https?:\/\/[^"'()\s<>]+\/wp-content\/uploads\/|\/?wp-content\/uploads\/)([^"'()\s<>]+)/gi
  let match
  while ((match = re.exec(html)) !== null) {
    const full = match[0]
    const path = normalizeUploadPath(full)
    if (path) out.add(path)
  }
  return [...out]
}

const createCols = {}
const posts = new Map()
const meta = new Map()
const attachedFiles = new Map()
const taxonomies = new Map()
const terms = new Map()
const termRelationships = []

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
    const idIdx = idx('ID')
    const typeIdx = idx('post_type')
    const statusIdx = idx('post_status')
    const titleIdx = idx('post_title')
    const slugIdx = idx('post_name')
    const contentIdx = idx('post_content')
    const excerptIdx = idx('post_excerpt')
    const dateIdx = idx('post_date')
    const modifiedIdx = idx('post_modified')
    const mimeIdx = idx('post_mime_type')

    for (const row of parseRows(mIns[2])) {
      const type = row[typeIdx]
      if (!['post', 'page', 'attachment'].includes(type)) continue
      posts.set(String(row[idIdx]), {
        wpId: Number(row[idIdx]),
        type,
        status: row[statusIdx],
        title: row[titleIdx] || '',
        slug: row[slugIdx] || slugify(row[titleIdx] || row[idIdx]),
        content: row[contentIdx] || '',
        excerpt: row[excerptIdx] || '',
        date: row[dateIdx] || null,
        modified: row[modifiedIdx] || null,
        mime: row[mimeIdx] || null,
      })
    }
    continue
  }

  if (short === 'postmeta') {
    const postIdx = idx('post_id')
    const keyIdx = idx('meta_key')
    const valueIdx = idx('meta_value')
    for (const row of parseRows(mIns[2])) {
      const postId = String(row[postIdx])
      const key = row[keyIdx]
      const value = row[valueIdx]
      if (key === '_wp_attached_file') {
        const file = normalizeUploadPath(value)
        if (file) attachedFiles.set(postId, file)
      }
      if (!['_thumbnail_id', '_elementor_data', '_elementor_css', '_wp_page_template'].includes(key)) {
        continue
      }
      if (!meta.has(postId)) meta.set(postId, {})
      meta.get(postId)[key] = value
    }
    continue
  }

  if (short === 'terms') {
    const idIdx = idx('term_id')
    const nameIdx = idx('name')
    const slugIdx = idx('slug')
    for (const row of parseRows(mIns[2])) {
      terms.set(String(row[idIdx]), { name: row[nameIdx], slug: row[slugIdx] })
    }
    continue
  }

  if (short === 'term_taxonomy') {
    const ttIdx = idx('term_taxonomy_id')
    const termIdx = idx('term_id')
    const taxonomyIdx = idx('taxonomy')
    for (const row of parseRows(mIns[2])) {
      taxonomies.set(String(row[ttIdx]), { termId: String(row[termIdx]), taxonomy: row[taxonomyIdx] })
    }
    continue
  }

  if (short === 'term_relationships') {
    const objectIdx = idx('object_id')
    const ttIdx = idx('term_taxonomy_id')
    for (const row of parseRows(mIns[2])) {
      termRelationships.push([String(row[objectIdx]), String(row[ttIdx])])
    }
  }
}

const categoryByPost = new Map()
for (const [objectId, taxonomyId] of termRelationships) {
  const taxonomy = taxonomies.get(taxonomyId)
  if (!taxonomy || taxonomy.taxonomy !== 'category') continue
  const term = terms.get(taxonomy.termId)
  if (!term) continue
  if (!categoryByPost.has(objectId)) categoryByPost.set(objectId, [])
  categoryByPost.get(objectId).push(term)
}

function buildItem(post) {
  const postMeta = meta.get(String(post.wpId)) || {}
  const coverPath = normalizeUploadPath(attachedFiles.get(String(postMeta._thumbnail_id)))
  const paths = new Set(collectUploadsFromContent(post.content))
  if (coverPath) paths.add(coverPath)
  return {
    wpId: post.wpId,
    title: post.title,
    slug: post.slug || slugify(post.title || post.wpId),
    status: post.status,
    date: post.date,
    modified: post.modified,
    excerpt: post.excerpt,
    content: post.content,
    coverPath,
    assetPaths: [...paths],
    categories: categoryByPost.get(String(post.wpId)) || [],
    elementorData: postMeta._elementor_data || null,
    pageTemplate: postMeta._wp_page_template || null,
  }
}

const allPosts = [...posts.values()]
const publicPosts = allPosts
  .filter((post) => post.type === 'post' && post.status === 'publish')
  .map(buildItem)
const publicPages = allPosts
  .filter((post) => post.type === 'page' && ['publish', 'private'].includes(post.status))
  .map(buildItem)

const attachments = allPosts
  .filter((post) => post.type === 'attachment')
  .map((post) => ({
    wpId: post.wpId,
    title: post.title,
    slug: post.slug,
    status: post.status,
    mime: post.mime,
    date: post.date,
    path: normalizeUploadPath(attachedFiles.get(String(post.wpId))),
  }))
  .filter((item) => item.path)

const assetPaths = new Set()
for (const item of [...publicPosts, ...publicPages]) {
  for (const path of item.assetPaths) assetPaths.add(path)
}
for (const item of attachments) assetPaths.add(item.path)

const data = {
  generatedAt: new Date().toISOString(),
  source: SQL,
  tablePrefix: PREFIX,
  totals: {
    posts: publicPosts.length,
    pages: publicPages.length,
    attachments: attachments.length,
    assetPaths: assetPaths.size,
  },
  posts: publicPosts,
  pages: publicPages,
  attachments,
  assetPaths: [...assetPaths].sort(),
}

fs.writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8')

console.log('Posts:', data.totals.posts)
console.log('Pages:', data.totals.pages)
console.log('Attachments:', data.totals.attachments)
console.log('Referenced upload paths:', data.totals.assetPaths)
console.log('Output:', OUT)
