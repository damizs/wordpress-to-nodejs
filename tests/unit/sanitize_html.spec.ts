import { test } from '@japa/runner'
import { sanitizePlainText, sanitizeRichHtml } from '#helpers/sanitize_html'

test.group('HTML sanitizer', () => {
  test('removes scripts and event handlers from rich HTML', ({ assert }) => {
    const html = sanitizeRichHtml(
      '<p>Texto</p><script>alert(1)</script><img src="https://example.test/a.png" onerror="alert(1)">'
    )

    assert.include(html, '<p>Texto</p>')
    assert.notInclude(html, '<script')
    assert.notInclude(html, 'onerror')
    assert.include(html, 'loading="lazy"')
  })

  test('removes SVG images from rich HTML', ({ assert }) => {
    const html = sanitizeRichHtml('<img src="https://example.test/logo.svg"><p>ok</p>')

    assert.notInclude(html, '.svg')
    assert.include(html, '<p>ok</p>')
  })

  test('strips all HTML from plain text', ({ assert }) => {
    assert.equal(sanitizePlainText('<strong>Olá</strong> <em>Sumé</em>'), 'Olá Sumé')
  })
})
