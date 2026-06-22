import { test } from '@japa/runner'
import { sanitizeBlocks } from '#controllers/admin/pages_controller'

test.group('Page block sanitizer', () => {
  test('sanitizes rich text blocks and removes unsafe image blocks', ({ assert }) => {
    const blocks = sanitizeBlocks([
      { type: 'heading', text: '<strong>Carta</strong> de Serviços' },
      { type: 'text', text: '<p>ok</p><script>alert(1)</script>' },
      { type: 'image', url: 'https://example.test/logo.svg', caption: '<b>Logo</b>' },
      { type: 'video', url: 'javascript:alert(1)' },
    ])

    assert.deepEqual(blocks?.[0], { type: 'heading', text: 'Carta de Serviços' })
    assert.deepEqual(blocks?.[1], { type: 'text', text: '<p>ok</p>' })
    assert.lengthOf(blocks || [], 2)
  })

  test('accepts serialized block payloads from forms', ({ assert }) => {
    const blocks = sanitizeBlocks(
      JSON.stringify([{ type: 'buttons', items: [{ label: '<b>Acessar</b>', url: '/transparencia' }] }])
    )

    assert.deepEqual(blocks, [
      { type: 'buttons', items: [{ label: 'Acessar', url: '/transparencia', variant: 'primary' }] },
    ])
  })
})
