import { test } from '@japa/runner'

test.group('Public routes', () => {
  test('health endpoint responds with ok status', async ({ client }) => {
    const response = await client.get('/health')

    response.assertOk()
    response.assertBodyContains({ status: 'ok' })
  })

  test('open data rejects unknown datasets before querying the database', async ({ assert, client }) => {
    const response = await client.get('/dados-abertos/inexistente/json')

    response.assertNotFound()
    assert.isString(response.body().error)
    assert.include(response.body().error, 'Conjunto')
  })

  test('quick links reset endpoint is disabled', async ({ client }) => {
    const response = await client.get('/api/reset-quick-links')

    response.assertNotFound()
  })

  test('admin panel redirects unauthenticated visitors to login', async ({ client }) => {
    const response = await client.get('/painel').redirects(0)

    response.assertFound()
    response.assertHeader('location', '/login')
  })
})
