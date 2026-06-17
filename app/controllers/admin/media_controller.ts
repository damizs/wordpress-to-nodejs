import type { HttpContext } from '@adonisjs/core/http'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import MediaFile from '#models/media_file'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir, stat, unlink } from 'node:fs/promises'
import { join } from 'node:path'
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

export default class MediaController {
  /** Listagem paginada com filtro por tipo e busca por nome */
  async index({ request, inertia }: HttpContext) {
    const page = Number(request.input('page', 1)) || 1
    const type = String(request.input('type', '') || '')
    const search = String(request.input('search', '') || '')

    const query = MediaFile.query().orderBy('created_at', 'desc')

    if (type === 'image') {
      query.whereILike('mime_type', 'image/%')
    } else if (type === 'document') {
      query.whereNot((q) => q.whereILike('mime_type', 'image/%'))
    }

    if (search) {
      query.whereILike('filename', `%${search}%`)
    }

    const files = await query.paginate(page, 24)

    return inertia.render('admin/media/index', {
      files: files.serialize(),
      filters: { type, search },
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
}
