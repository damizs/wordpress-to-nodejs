import { test } from '@japa/runner'
import RuntimeCache from '#services/runtime_cache'

test.group('RuntimeCache', () => {
  test('reuses cached values inside the TTL window', async ({ assert }) => {
    let calls = 0

    const first = await RuntimeCache.getOrSet('test:reuse', 1_000, async () => {
      calls++
      return { value: calls }
    })

    const second = await RuntimeCache.getOrSet('test:reuse', 1_000, async () => {
      calls++
      return { value: calls }
    })

    assert.deepEqual(first, { value: 1 })
    assert.deepEqual(second, { value: 1 })
    assert.equal(calls, 1)
  })

  test('forgets keys by prefix', async ({ assert }) => {
    await RuntimeCache.getOrSet('test:forget:a', 1_000, async () => 'cached')
    RuntimeCache.forget('test:forget:')

    const value = await RuntimeCache.getOrSet('test:forget:a', 1_000, async () => 'fresh')

    assert.equal(value, 'fresh')
  })
})
