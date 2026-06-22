import { test } from '@japa/runner'
import shieldConfig from '#config/shield'

test.group('Shield CSP', () => {
  test('allows official external embeds used by the portal', ({ assert }) => {
    const directives = (shieldConfig as any).csp.directives

    assert.includeMembers(directives.frameSrc, [
      'https://portaldatransparencia.publicsoft.com.br',
      'https://transparencia.elmartecnologia.com.br',
      'https://getpublic.inf.br',
      'https://vlibras.gov.br',
      'https://www.vlibras.gov.br',
    ])
    assert.deepEqual(directives.childSrc, directives.frameSrc)
  })

  test('allows VLibras script mirror from jsdelivr', ({ assert }) => {
    const directives = (shieldConfig as any).csp.directives

    assert.include(directives.scriptSrcElem, 'https://cdn.jsdelivr.net')
  })
})
