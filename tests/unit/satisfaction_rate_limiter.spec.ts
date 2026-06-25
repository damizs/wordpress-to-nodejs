import { test } from '@japa/runner'
import {
  isSurveyRateLimited,
  recordSurveySubmission,
} from '#services/satisfaction_rate_limiter'

test.group('Satisfaction survey rate limiter', () => {
  test('limits excessive submissions from a single IP', ({ assert }) => {
    const ip = '203.0.113.50'

    for (let i = 0; i < 10; i++) {
      recordSurveySubmission(ip)
    }

    assert.isTrue(isSurveyRateLimited(ip))
  })
})
