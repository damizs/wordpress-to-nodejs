import { test } from '@japa/runner'
import { getPublicAccessBlock, normalizePublicPath } from '#helpers/public_access'

test.group('Public access controls', () => {
  test('normalizes public paths', ({ assert }) => {
    assert.equal(normalizePublicPath('atas/minha-ata?x=1'), '/atas/minha-ata')
    assert.equal(normalizePublicPath('/pautas/'), '/pautas')
  })

  test('blocks a disabled public area and its detail pages', ({ assert }) => {
    const block = getPublicAccessBlock(
      { public_access_disabled_areas: '["atas"]' },
      '/atas/ata-da-1-sessao'
    )

    assert.isNotNull(block)
    assert.equal(block?.areaKey, 'atas')
    assert.equal(block?.title, 'Atas')
  })

  test('blocks explicit public paths', ({ assert }) => {
    const block = getPublicAccessBlock(
      { public_access_blocked_paths: '/historia-da-camara' },
      '/historia-da-camara'
    )

    assert.isNotNull(block)
    assert.equal(block?.matchedRule, '/historia-da-camara')
  })

  test('keeps unrelated public paths available', ({ assert }) => {
    const block = getPublicAccessBlock(
      { public_access_disabled_areas: '["pautas"]', public_access_blocked_paths: '/historia-da-camara' },
      '/atas'
    )

    assert.isNull(block)
  })
})
