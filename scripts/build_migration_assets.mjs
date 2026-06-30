#!/usr/bin/env node
/*
| build_migration_assets.mjs — monta o bundle `wp-migration` de uma câmara
|
| O `wp:migrate` referencia imagens/PDFs por caminhos relativos a
| `/uploads/wp-migration` (news/{slug}.ext, vereadores/{slug}.ext,
| pdfs/{publicacoes,atas}/{arquivo}). Para o Sumé esse bundle veio pronto
| num release .tar.gz; para as demais câmaras montamos a partir do
| `wp-content/uploads` extraído do backup + os JSONs de migração.
|
| Uso:
|   node scripts/build_migration_assets.mjs <uploadsBase> <migration_data.json> <migration_extra.json> <outDir> [liveDomain]
|
|   uploadsBase = .../wp-content/uploads  (raiz onstá 2026/06/foo.jpg)
|   outDir      = destino do bundle (vira /uploads/wp-migration no container)
|   liveDomain  = (opcional) domínio do WP ainda no ar; quando um arquivo NÃO
|                 está no backup extraído, baixa de
|                 https://<liveDomain>/wp-content/uploads/<srcRel> (ex.: capas
|                 do Instagram que o backup não incluiu, mas o site live tem).
*/
import fs from 'node:fs'
import { join, dirname, basename } from 'node:path'

const [, , uploadsBase, dataPath, extraPath, outDir, liveDomain] = process.argv
if (!uploadsBase || !dataPath || !extraPath || !outDir) {
  console.error('args: <uploadsBase> <migration_data.json> <migration_extra.json> <outDir> [liveDomain]')
  process.exit(1)
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
const extra = JSON.parse(fs.readFileSync(extraPath, 'utf-8'))

let copied = 0
let downloaded = 0
const missing = []
const pending = []

async function fetchLive(srcRel, dest) {
  const url = `https://${liveDomain}/wp-content/uploads/${srcRel}`
  try {
    const res = await fetch(url)
    if (!res.ok) return false
    const buf = Buffer.from(await res.arrayBuffer())
    fs.mkdirSync(dirname(dest), { recursive: true })
    fs.writeFileSync(dest, buf)
    downloaded++
    return true
  } catch {
    return false
  }
}

function copy(srcRel, destRel) {
  if (!srcRel || !destRel) return
  const src = join(uploadsBase, srcRel)
  const dest = join(outDir, destRel)
  if (!fs.existsSync(src)) {
    // Não está no backup: tenta o site ao vivo (se informado) ao final.
    if (liveDomain) pending.push({ srcRel, dest })
    else missing.push(srcRel)
    return
  }
  fs.mkdirSync(dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
  copied++
}

// 1) News covers  -> news/{slug}.ext
for (const n of data.news || []) {
  if (n.cover_image && n.new_cover) copy(n.cover_image, n.new_cover)
}
// 2) Vereador photos -> vereadores/{slug}.ext
for (const v of data.vereadores || []) {
  if (v.photo && v.new_photo) copy(v.photo, v.new_photo)
}
// 3) Publicações PDFs -> pdfs/publicacoes/{arquivo}
for (const [, att] of Object.entries(extra.pub_attachments || {})) {
  const p = att?.path
  if (p) copy(p, join('pdfs/publicacoes', basename(p)))
}
// 4) Atas PDFs -> pdfs/atas/{arquivo}
for (const [, att] of Object.entries(extra.ata_attachments || {})) {
  const p = typeof att === 'string' ? att : att?.path
  if (p) copy(p, join('pdfs/atas', basename(p)))
}

// Baixa do site ao vivo os que faltaram no backup (concorrência limitada).
if (pending.length) {
  console.log(`  baixando ${pending.length} ausentes de ${liveDomain}…`)
  const POOL = 8
  for (let i = 0; i < pending.length; i += POOL) {
    const batch = pending.slice(i, i + POOL)
    const oks = await Promise.all(batch.map((p) => fetchLive(p.srcRel, p.dest)))
    batch.forEach((p, j) => {
      if (!oks[j]) missing.push(p.srcRel)
    })
  }
}

console.log(`✓ Bundle montado em ${outDir}`)
console.log(`  copiados do backup: ${copied}`)
console.log(`  baixados do site ao vivo: ${downloaded}`)
console.log(`  ainda faltando: ${missing.length}`)
if (missing.length) console.log('   ex:', missing.slice(0, 8).join('\n       '))
