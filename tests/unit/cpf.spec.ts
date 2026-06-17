import { test } from '@japa/runner'
import { isValidCpf, maskCpf, normalizeCpf } from '#helpers/cpf'

test.group('CPF helper', () => {
  test('normalizes formatted CPF values', ({ assert }) => {
    assert.equal(normalizeCpf('123.456.789-09'), '12345678909')
  })

  test('accepts valid CPF check digits', ({ assert }) => {
    assert.isTrue(isValidCpf('529.982.247-25'))
  })

  test('rejects repeated or invalid CPF values', ({ assert }) => {
    assert.isFalse(isValidCpf('111.111.111-11'))
    assert.isFalse(isValidCpf('123.456.789-00'))
  })

  test('masks stored CPF digits for display', ({ assert }) => {
    assert.equal(maskCpf('52998224725'), '529.982.247-25')
    assert.isNull(maskCpf('529'))
  })
})
