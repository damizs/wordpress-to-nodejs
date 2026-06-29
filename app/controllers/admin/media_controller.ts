import type { HttpContext } from '@adonisjs/core/http'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import MediaFile from '#models/media_file'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir, stat, unlink, readdir, realpath, lstat } from 'node:fs/promises'
import { join, extname, relative, resolve, isAbsolute, sep } from 'node:path'
import { existsSync } from 'node:fs'
import { isOptimizableImage, saveOptimizedImage } from '#helpers/image_upload'
import { assertSafeUpload } from '#helpers/upload_security'

const UPLOAD_OPTIONS = {
  size: '20mb',
  extnames: [
    'png',
    'jpg',
    'jpeg',
    'webp',
    'gif',
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'csv',
    'zip',
  ],
}

/** Extensões reconhecidas na varredura do disco (sistema de arquivos). */
const SCAN_IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'])
const SCAN_DOC_EXTS = new Set(['pdf', 'doc', 'docx'])

/**
 * Teto de segurança da varredura: a pasta de uploads pode ter milhares de
 * arquivos (migração do WP). Limitamos a quantidade coletada para não estourar
 * memória/CPU, e sinalizamos `truncated` para a UI avisar o usuário.
 */
const MAX_SCAN_FILES = 5000

type ScanType = 'image' | 'document'

interface ScannedFile {
  /** Caminho relativo à raiz de uploads, em estilo posix (ex.: "news/foo.jpg") */
  path: string
  /** URL pública (ex.: "/uploads/news/foo.jpg") */
  url: string
  name: string
  size: number
  /** epoch ms (mtime) — usado para ordenar */
  mtime: number
  type: ScanType
}

/**
 * Varre recursivamente a raiz de uploads e devolve os arquivos de imagem e
 * documento encontrados. Ignora links simbólicos (evita loops/escapar da raiz)
 * e para ao atingir `MAX_SCAN_FILES` (sinalizando `truncated`).
 */
async function scanUploads(root: string): Promise<{ files: ScannedFile[]; truncated: boolean }> {
  const out: ScannedFile[] = []
  let truncated = false

  if (!existsSync(root)) return { files: out, truncated }

  async function walk(dir: string): Promise<void> {
    if (truncated) return
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (truncated) return
      // Nunca seguimos symlinks: protege contra loops e contra escapar da raiz.
      if (entry.isSymbolicLink()) continue
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
        continue
      }
      if (!entry.isFile()) continue
      const ext = extname(entry.name).slice(1).toLowerCase()
      const isImg = SCAN_IMAGE_EXTS.has(ext)
      const isDoc = SCAN_DOC_EXTS.has(ext)
      if (!isImg && !isDoc) continue
      let info
      try {
        info = await stat(full)
      } catch {
        continue
      }
      const relPath = relative(root, full).split(sep).join('/')
      out.push({
        path: relPath,
        url: `/uploads/${relPath}`,
        name: entry.name,
        size: info.size,
        mtime: info.mtimeMs,
        type: isImg ? 'image' : 'document',
      })
      if (out.length >= MAX_SCAN_FILES) {
        truncated = true
        return
      }
    }
  }

  await walk(root)
  return { files: out, truncated }
}

export default class MediaController {
  /**
   * Listagem da Biblioteca de Mídia em duas abas:
   * - `library`: registros enviados pela própria biblioteca (tabela media_files),
   *   paginado, com filtro por tipo e busca por nome (comportamento original).
   * - `all`: varredura do SISTEMA DE ARQUIVOS em public/uploads — TODOS os arquivos
   *   (inclusive os vindos da migração), marcando se cada um está "rastreado" em
   *   media_files. Paginado/limitado em memória por sanidade de performance.
   */
  async index({ request, inertia }: HttpContext) {
    const tab = String(request.input('tab', 'all') || 'all') === 'library' ? 'library' : 'all'
    const page = Number(request.input('page', 1)) || 1
    const type = String(request.input('type', '') || '')
    const search = String(request.input('search', '') || '').trim()

    let library: Record<string, unknown> | null = null
    let allFiles: {
      data: Array<{
        path: string
        url: string
        name: string
        size: number
        mtime: string
        type: ScanType
        tracked: boolean
        trackedId: number | null
      }>
      meta: { total: number; per_page: number; current_page: number; last_page: number }
      truncated: boolean
      scanned: number
    } | null = null

    if (tab === 'library') {
      const query = MediaFile.query().orderBy('created_at', 'desc')

      if (type === 'image') {
        query.whereILike('mime_type', 'image/%')
      } else if (type === 'document') {
        query.whereNot((q) => q.whereILike('mime_type', 'image/%'))
      }

      if (search) {
        query.whereILike('filename', `%${search}%`)
      }

      const paginated = await query.paginate(page, 24)
      library = paginated.serialize()
    } else {
      const uploadsRoot = join(app.publicPath(), 'uploads')
      const { files: scanned, truncated } = await scanUploads(uploadsRoot)

      // Mapa url -> id dos registros rastreados na biblioteca.
      const trackedById = new Map<string, number>()
      const records = await MediaFile.query().select('id', 'url')
      for (const record of records) {
        if (record.url) trackedById.set(record.url, record.id)
      }

      let filtered = scanned
      if (type === 'image') {
        filtered = filtered.filter((f) => f.type === 'image')
      } else if (type === 'document') {
        filtered = filtered.filter((f) => f.type === 'document')
      }
      if (search) {
        const needle = search.toLowerCase()
        filtered = filtered.filter((f) => f.name.toLowerCase().includes(needle))
      }

      filtered.sort((a, b) => b.mtime - a.mtime)

      const perPage = 36
      const total = filtered.length
      const lastPage = Math.max(1, Math.ceil(total / perPage))
      const currentPage = Math.min(Math.max(1, page), lastPage)
      const start = (currentPage - 1) * perPage
      const pageItems = filtered.slice(start, start + perPage)

      allFiles = {
        data: pageItems.map((f) => ({
          path: f.path,
          url: f.url,
          name: f.name,
          size: f.size,
          mtime: new Date(f.mtime).toISOString(),
          type: f.type,
          tracked: trackedById.has(f.url),
          trackedId: trackedById.get(f.url) ?? null,
        })),
        meta: { total, per_page: perPage, current_page: currentPage, last_page: lastPage },
        truncated,
        scanned: scanned.length,
      }
    }

    return inertia.render('admin/media/index', {
      tab,
      filters: { type, search },
      library,
      allFiles,
    })
  }

  /**
   * Upload via multipart. Aceita campo "file" (único) e/ou "files" (múltiplos).
   * Endpoint consumido via fetch por outros módulos — responde SEMPRE JSON.
   */
  async upload({ request, response, auth }: HttpContext) {
    const incoming: MultipartFile[] = []

    const single = request.file('file', UPLOAD_OPTIONS)
    if (single) incoming.push(single)

    const multiple = request.files('files', UPLOAD_OPTIONS)
    if (multiple && multiple.length > 0) incoming.push(...multiple)

    if (incoming.length === 0) {
      return response.status(422).json({ error: 'Nenhum arquivo enviado.' })
    }

    const invalid = incoming.find((f) => !f.isValid)
    if (invalid) {
      return response.status(422).json({
        error: invalid.errors[0]?.message || 'Arquivo inválido.',
        filename: invalid.clientName,
      })
    }

    try {
      for (const file of incoming) {
        await assertSafeUpload(file, UPLOAD_OPTIONS.extnames)
      }
    } catch (error) {
      return response.status(422).json({
        error: error instanceof Error ? error.message : 'Arquivo bloqueado por validação de segurança.',
      })
    }

    const uploadDir = join(app.publicPath(), 'uploads', 'midia')
    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

    const uploadedBy = auth?.user?.id ?? null
    const saved: Array<{ id: number; url: string; filename: string }> = []

    try {
      for (const file of incoming) {
        let savedFile: { url: string; mimeType: string; size: number }

        if (isOptimizableImage(file)) {
          savedFile = await saveOptimizedImage(file, uploadDir, {
            prefix: 'midia',
            publicUrlBase: '/uploads/midia',
          })
        } else {
          const fileName = `${cuid()}.${file.extname}`
          await file.move(uploadDir, { name: fileName })
          if (file.state !== 'moved') {
            return response.status(500).json({
              error: 'Falha ao salvar o arquivo no servidor.',
              filename: file.clientName,
              files: saved,
            })
          }

          const path = join(uploadDir, fileName)
          const info = existsSync(path) ? await stat(path) : { size: file.size }
          savedFile = {
            url: `/uploads/midia/${fileName}`,
            mimeType:
              file.type && file.subtype
                ? `${file.type}/${file.subtype}`
                : 'application/octet-stream',
            size: info.size,
          }
        }

        const record = await MediaFile.create({
          filename: file.clientName,
          url: savedFile.url,
          mimeType: savedFile.mimeType,
          size: savedFile.size,
          uploadedBy,
        })

        saved.push({ id: record.id, url: record.url, filename: record.filename })
      }
    } catch (error) {
      console.error('Media upload error:', error)
      return response.status(500).json({ error: 'Erro ao processar o upload.', files: saved })
    }

    // Um único arquivo → objeto direto; múltiplos → { files: [...] }
    if (saved.length === 1) {
      return response.json(saved[0])
    }
    return response.json({ files: saved })
  }

  /** Apaga registro e tenta remover o arquivo físico */
  async destroy({ params, response, session }: HttpContext) {
    const media = await MediaFile.findOrFail(params.id)

    if (media.url) {
      const filePath = join(app.publicPath(), media.url)
      try {
        if (existsSync(filePath)) await unlink(filePath)
      } catch (error) {
        console.error('Error deleting media file from disk:', error)
      }
    }

    await media.delete()

    session.flash('success', 'Arquivo excluído!')
    return response.redirect().back()
  }

  /**
   * Exclui um arquivo do disco a partir de um caminho relativo (aba "Todos os
   * arquivos"). Responde JSON (consumido via fetch).
   *
   * SEGURANÇA (à prova de path traversal):
   *  1. Rejeita bytes nulos.
   *  2. Normaliza o caminho aceitando "/uploads/x", "uploads/x" ou "x".
   *  3. Resolve contra a raiz public/uploads e checa, via `path.relative`, que o
   *     alvo NÃO escapa da raiz (sem `..`, sem caminho absoluto) e não é a própria
   *     raiz.
   *  4. Repete a checagem com `realpath` (resolve symlinks) para impedir que um
   *     link aponte para fora da raiz.
   *  5. Exige que o alvo seja um arquivo regular (não diretório/symlink).
   * Se houver registro correspondente em media_files, remove também.
   */
  async destroyByPath({ request, response }: HttpContext) {
    const raw = String(request.input('path', '') || '')
    if (!raw) {
      return response.status(422).json({ error: 'Caminho não informado.' })
    }
    if (raw.includes('\0')) {
      return response.status(400).json({ error: 'Caminho inválido.' })
    }

    const uploadsRoot = resolve(app.publicPath(), 'uploads')

    // Aceita "/uploads/x", "uploads/x" ou "x" (e normaliza separadores).
    let rel = raw.replace(/\\/g, '/').replace(/^\/+/, '')
    if (rel === 'uploads' || rel === 'uploads/') {
      rel = ''
    } else if (rel.startsWith('uploads/')) {
      rel = rel.slice('uploads/'.length)
    }

    // Checagem léxica: o alvo precisa estar DENTRO da raiz de uploads.
    const target = resolve(uploadsRoot, rel)
    const relCheck = relative(uploadsRoot, target)
    if (relCheck === '' || relCheck.startsWith('..') || isAbsolute(relCheck)) {
      return response.status(403).json({ error: 'Caminho fora da pasta de uploads.' })
    }

    // Checagem física (resolve symlinks): impede escapar da raiz por link.
    let realTarget: string
    try {
      realTarget = await realpath(target)
    } catch {
      return response.status(404).json({ error: 'Arquivo não encontrado.' })
    }
    const realRoot = await realpath(uploadsRoot)
    const realRel = relative(realRoot, realTarget)
    if (realRel === '' || realRel.startsWith('..') || isAbsolute(realRel)) {
      return response.status(403).json({ error: 'Caminho fora da pasta de uploads.' })
    }

    // Só arquivos regulares (nunca diretórios ou symlinks).
    let info
    try {
      info = await lstat(realTarget)
    } catch {
      return response.status(404).json({ error: 'Arquivo não encontrado.' })
    }
    if (!info.isFile()) {
      return response.status(400).json({ error: 'Só é possível excluir arquivos.' })
    }

    try {
      await unlink(realTarget)
    } catch (error) {
      console.error('Error deleting file by path:', error)
      return response.status(500).json({ error: 'Falha ao excluir o arquivo do disco.' })
    }

    // Remove o registro correspondente em media_files, se existir.
    const publicUrl = `/uploads/${relCheck.split(sep).join('/')}`
    try {
      const record = await MediaFile.findBy('url', publicUrl)
      if (record) await record.delete()
    } catch (error) {
      console.error('Error deleting media_files record after path delete:', error)
    }

    return response.json({ success: true })
  }
}
