import { test } from '@japa/runner'
import AuthService from 'App/Services/AuthService'
import sinon from 'sinon'
test.group('Auth login', () => {
  test('success authenticate', async ({ client, assert }) => {
    const mock = sinon.mock(AuthService.prototype)
    mock
      .expects('login')
      .once()
      .withArgs({ email: 'testing@mail.com', password: '12345678' })
      .returns({
        type: 'bearer',
        token: 'Mg.sOsuxLioymm2yiEa9DbOh3i4e6DUFvqsJW1tHSIoREn52wr1kcU8UAR8fEyV',
        expires_at: '2023-01-10T03:29:26.912-03:00',
        user: {
          id: '1f32412c-eb4c-4f45-a3af-96bd05263c2e',
          first_name: 'Test',
          last_name: 'Account',
          email: 'testing@mail.com',
          created_at: '2023-01-09T03:26:36.000-03:00',
          updated_at: '2023-01-09T03:26:36.000-03:00',
        },
      })

    const response = await client.post('/api/auth/login').json({
      email: 'testing@mail.com',
      password: '12345678',
    })

    mock.verify()
    mock.restore()

    response.assertStatus(200)
    assert.equal(response.response.body.user.email, 'testing@mail.com')
  })
  test('failed authenticate invalid credentials', async ({ client, assert }) => {
    const mock = sinon.mock(AuthService.prototype)
    mock
      .expects('login')
      .once()
      .withArgs({ email: 'testing@mail.com', password: '12345678' })
      .throws()

    const response = await client.post('/api/auth/login').json({
      email: 'test@mail.com',
      password: 'error',
    })

    response.assertStatus(401)
    assert.equal(response.response.body.message, 'E-mail or password is invalid.')
  })
})
