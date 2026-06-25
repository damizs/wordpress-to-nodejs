import { test } from '@japa/runner'
import { hashCpf } from '#helpers/cpf_hash'

test.group('CPF hash', () => {
  test('produces stable hash for normalized input', ({ assert }) => {
    const first = hashCpf('529.982.247-25')
    const second = hashCpf('52998224725')
    assert.equal(first, second)
    assert.match(first, /^[a-f0-9]{64}$/)
  })

  test('does not return plaintext cpf', ({ assert }) => {
    const hash = hashCpf('52998224725')
    assert.notEqual(hash, '52998224725')
    assert.notInclude(hash, '529')
  })
})
