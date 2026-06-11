import sharp from 'sharp'
import { join } from 'node:path'
import { mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'

/** Tamanho padrão das fotos de vereador (proporção 3:4 usada nos cards) */
export const COUNCILOR_PHOTO_WIDTH = 600
export const COUNCILOR_PHOTO_HEIGHT = 800

/**
 * Padroniza a foto do vereador: corte inteligente 3:4 (600x800) focado na
 * região mais relevante da imagem (rosto) e conversão para WebP.
 * Retorna a URL pública do arquivo gerado.
 */
export async function processCouncilorPhoto(sourcePath: string): Promise<string> {
  const uploadDir = join(app.publicPath(), 'uploads', 'vereadores')
  if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

  const fileName = `vereador-${cuid()}.webp`
  await sharp(sourcePath)
    .rotate() // aplica a orientação EXIF antes do corte
    .resize(COUNCILOR_PHOTO_WIDTH, COUNCILOR_PHOTO_HEIGHT, {
      fit: 'cover',
      position: sharp.strategy.attention,
    })
    .webp({ quality: 82 })
    .toFile(join(uploadDir, fileName))

  return `/uploads/vereadores/${fileName}`
}
