import { test } from '@japa/runner'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { assertSafeUpload } from '#helpers/upload_security'

async function makeFile(extname: string, bytes: Buffer, type = 'application/octet-stream') {
  const dir = await mkdtemp(join(tmpdir(), 'upload-security-'))
  const tmpPath = join(dir, `file.${extname}`)
  await writeFile(tmpPath, bytes)
  return {
    file: { extname, tmpPath, type },
    cleanup: () => rm(dir, { recursive: true, force: true }),
  }
}

async function expectRejects(assert: any, callback: () => Promise<unknown>, message: RegExp) {
  try {
    await callback()
    assert.fail('Expected upload validation to fail')
  } catch (error) {
    assert.match(String((error as Error).message), message)
  }
}

test.group('Upload security', () => {
  test('accepts files whose signature matches the declared extension', async ({ assert }) => {
    const { file, cleanup } = await makeFile('png', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d]))
    try {
      await assertSafeUpload(file as any, ['png'])
      assert.isTrue(true)
    } finally {
      await cleanup()
    }
  })

  test('rejects SVG even when the extension is present in the allowed list', async ({ assert }) => {
    const { file, cleanup } = await makeFile('svg', Buffer.from('<svg></svg>'), 'image/svg+xml')
    try {
      await expectRejects(assert, () => assertSafeUpload(file as any, ['svg']), /SVG/)
    } finally {
      await cleanup()
    }
  })

  test('rejects files whose content does not match the extension', async ({ assert }) => {
    const { file, cleanup } = await makeFile('pdf', Buffer.from('not a pdf'))
    try {
      await expectRejects(assert, () => assertSafeUpload(file as any, ['pdf']), /conteúdo|conteudo/i)
    } finally {
      await cleanup()
    }
  })
})
