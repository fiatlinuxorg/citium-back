import { test } from '@japa/runner'

test.group('Test', () => {
  test('example test', async ({ assert }) => {
    assert.isTrue(true)
  })
})
