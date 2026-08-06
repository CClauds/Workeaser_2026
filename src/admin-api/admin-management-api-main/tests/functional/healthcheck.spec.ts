import { test } from '@japa/runner'

test('test', async (data) => {
  const result = await data.client.get('/')
  result.assertStatus(200)
  result.assertBodyContains({ hello: 'world' })
})
