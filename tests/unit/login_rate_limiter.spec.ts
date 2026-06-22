import { test } from '@japa/runner'
import {
  isLoginRateLimited,
  recordFailedLogin,
} from '#services/login_rate_limiter'

test.group('Login rate limiter', () => {
  test('limits repeated failures for the same account and IP', ({ assert }) => {
    const ip = '203.0.113.10'
    const email = ' Admin@CamaraDeSume.PB.GOV.BR '

    for (let i = 0; i < 5; i++) {
      recordFailedLogin(ip, email)
    }

    assert.isTrue(isLoginRateLimited(ip, 'admin@camaradesume.pb.gov.br'))
  })

  test('limits excessive failures from a single IP across accounts', ({ assert }) => {
    const ip = '203.0.113.11'

    for (let i = 0; i < 25; i++) {
      recordFailedLogin(ip, `usuario-${i}@example.test`)
    }

    assert.isTrue(isLoginRateLimited(ip, 'novo@example.test'))
  })
})
