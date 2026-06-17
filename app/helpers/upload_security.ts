import type { MultipartFile } from '@adonisjs/core/bodyparser'
import { open } from 'node:fs/promises'

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'ico'])
const DOCUMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'odt', 'ods', 'zip'])

function normalizeExt(file: MultipartFile) {
  return String(file.extname || '').trim().replace(/^\./, '').toLowerCase()
}

async function readHeader(file: MultipartFile) {
  if (!file.tmpPath) return Buffer.alloc(0)
  const handle = await open(file.tmpPath, 'r')
  try {
    const buffer = Buffer.alloc(16)
    const result = await handle.read(buffer, 0, buffer.length, 0)
    return buffer.subarray(0, result.bytesRead)
  } finally {
    await handle.close()
  }
}

function startsWith(buffer: Buffer, bytes: number[]) {
  return bytes.every((byte, index) => buffer[index] === byte)
}

function hasValidSignature(ext: string, header: Buffer) {
  if (ext === 'pdf') return startsWith(header, [0x25, 0x50, 0x44, 0x46])
  if (ext === 'png') return startsWith(header, [0x89, 0x50, 0x4e, 0x47])
  if (ext === 'jpg' || ext === 'jpeg') return startsWith(header, [0xff, 0xd8, 0xff])
  if (ext === 'webp') return header.subarray(0, 4).toString('ascii') === 'RIFF' && header.subarray(8, 12).toString('ascii') === 'WEBP'
  if (ext === 'gif') return ['GIF87a', 'GIF89a'].includes(header.subarray(0, 6).toString('ascii'))
  if (ext === 'ico') return startsWith(header, [0x00, 0x00, 0x01, 0x00])
  if (['docx', 'xlsx', 'odt', 'ods', 'zip'].includes(ext)) return startsWith(header, [0x50, 0x4b])
  if (['doc', 'xls'].includes(ext)) return startsWith(header, [0xd0, 0xcf, 0x11, 0xe0])
  return ext === 'csv'
}

export async function assertSafeUpload(file: MultipartFile, allowedExtnames: string[]) {
  const ext = normalizeExt(file)
  const allowed = new Set(allowedExtnames.map((item) => item.toLowerCase()))

  if (!ext || !allowed.has(ext)) {
    throw new Error('Tipo de arquivo não permitido.')
  }

  if (ext === 'svg' || String(file.type || '').toLowerCase() === 'image/svg+xml') {
    throw new Error('Arquivos SVG não são permitidos por segurança.')
  }

  if (![...IMAGE_EXTENSIONS, ...DOCUMENT_EXTENSIONS].includes(ext)) {
    throw new Error('Tipo de arquivo não reconhecido.')
  }

  const header = await readHeader(file)
  if (!hasValidSignature(ext, header)) {
    throw new Error('O conteúdo do arquivo não corresponde ao tipo informado.')
  }
}
