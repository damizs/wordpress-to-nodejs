import type { MultipartFile } from '@adonisjs/core/bodyparser'
import sharp from 'sharp'
import { cuid } from '@adonisjs/core/helpers'
import { mkdir, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const OPTIMIZABLE_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp'])
const DEFAULT_MAX_WIDTH = 1920
const DEFAULT_MAX_HEIGHT = 1920
const DEFAULT_QUALITY = 92
const MAX_INPUT_MEGAPIXELS = 48

export interface OptimizedUpload {
  fileName: string
  url: string
  mimeType: string
  size: number
}

export interface ImageUploadOptions {
  prefix: string
  publicUrlBase: string
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

export function isOptimizableImage(file: MultipartFile): boolean {
  return OPTIMIZABLE_IMAGE_EXTENSIONS.has(String(file.extname || '').toLowerCase())
}

/**
 * Converts JPG/PNG/WebP uploads to high-quality WebP while constraining huge images.
 * This is intentionally light compression: the goal is smaller, predictable files
 * without visibly degrading institutional photos/logos.
 */
export async function saveOptimizedImage(
  file: MultipartFile,
  uploadDir: string,
  options: ImageUploadOptions
): Promise<OptimizedUpload> {
  if (!file.tmpPath) {
    throw new Error('Arquivo temporário não encontrado para otimização.')
  }

  if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true })

  const metadata = await sharp(file.tmpPath).metadata()
  const pixels = (metadata.width || 0) * (metadata.height || 0)
  if (pixels > MAX_INPUT_MEGAPIXELS * 1_000_000) {
    throw new Error(`Imagem grande demais. Limite: ${MAX_INPUT_MEGAPIXELS} megapixels.`)
  }

  const fileName = `${options.prefix}-${cuid()}.webp`
  const outputPath = join(uploadDir, fileName)

  await sharp(file.tmpPath, { animated: false })
    .rotate()
    .resize({
      width: options.maxWidth ?? DEFAULT_MAX_WIDTH,
      height: options.maxHeight ?? DEFAULT_MAX_HEIGHT,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality: options.quality ?? DEFAULT_QUALITY,
      effort: 4,
      smartSubsample: true,
    })
    .toFile(outputPath)

  const info = await stat(outputPath)
  return {
    fileName,
    url: `${options.publicUrlBase}/${fileName}`,
    mimeType: 'image/webp',
    size: info.size,
  }
}

