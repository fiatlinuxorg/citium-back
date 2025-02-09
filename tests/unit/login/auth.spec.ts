import { test } from '@japa/runner'
import AuthController from '#controllers/auth_controller'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import User from '#models/user_model'
import jwt from 'jsonwebtoken'
import env from '#start/env'
import TokenBlacklist from '#models/token_blacklist'

let mongoServer: MongoMemoryServer

test.group('Auth', (group) => {
  group.setup(async () => {
    mongoServer = await MongoMemoryServer.create()
  })

  test('register new user test', async ({ assert }) => {
    const controller = new AuthController()
    await controller.register({
      request: {
        body() {
          return {
            email: 'test1@test.com',
            password: 'password',
            firstName: 'Test',
            lastName: 'User',
          }
        },
      },
      response: {
        status(status: number) {
          return {
            json(data: any) {
              assert.equal(status, 201)
              assert.equal(data.message, 'Utente registrato correttamente')
            },
          }
        },
      },
    })
  })

  test('register existing user test', async ({ assert }) => {
    const controller = new AuthController()
    await controller.register({
      request: {
        body() {
          return {
            email: 'test@test.com',
            password: 'password',
            firstName: 'Test',
            lastName: 'User',
          }
        },
      },
      response: {
        status(status: number) {
          return {
            json(data: any) {
              assert.equal(status, 500)
              assert.equal(data.message, 'Errore durante la registrazione')
            },
          }
        },
      },
    })
  })

  test('login existing user test', async ({ assert }) => {
    const controller = new AuthController()
    const user = await User.findOne({ email: 'test@test.com' })
    if (!user) {
      throw new Error('User not found')
    }
    await controller.login({
      request: {
        body() {
          return {
            email: 'test@test.com',
            password: 'password',
            firstName: 'Test',
            lastName: 'User',
          }
        },
      },
      response: {
        status(status: number) {
          return {
            json(data: any) {
              assert.equal(status, 200)
              assert.equal(
                data.token,
                jwt.sign({ id: user._id }, env.get('JWT_SECRET'), { expiresIn: '1h' })
              )
            },
          }
        },
      },
    })
  })

  test('login wrong password test', async ({ assert }) => {
    const controller = new AuthController()
    await controller.login({
      request: {
        body() {
          return {
            email: 'test@test.com',
            password: 'notpassword',
            firstName: 'Test',
            lastName: 'User',
          }
        },
      },
      response: {
        status(status: number) {
          return {
            json(data: any) {
              assert.equal(status, 400)
              assert.equal(data.message, 'Credenziali invalide')
            },
          }
        },
      },
    })
  })

  test('login non existing user test', async ({ assert }) => {
    const controller = new AuthController()
    await controller.login({
      request: {
        body() {
          return {
            email: 'random@random.com',
            password: 'password',
            firstName: 'Test',
            lastName: 'User',
          }
        },
      },
      response: {
        status(status: number) {
          return {
            json(data: any) {
              assert.equal(status, 400)
              assert.equal(data.message, 'Credenziali invalide')
            },
          }
        },
      },
    })
  })

  test('logout test', async ({ assert }) => {
    const controller = new AuthController()
    const user = await User.findOne({ email: 'test@test.com' })
    if (!user) {
      throw new Error('User not found')
    }

    const token = jwt.sign({ id: user._id }, env.get('JWT_SECRET'), { expiresIn: '1h' })

    const request = {
      header(name: string) {
        if (name === 'Authorization') {
          return `Bearer ${token}`
        }
        return null
      },
    }

    const response = {
      status(status: number) {
        assert.equal(status, 200)
        return {
          json(data: any) {
            assert.equal(data.message, 'Logout effettuato con successo')
          },
        }
      },
    }

    await controller.logout({ request, response })

    const blacklistedToken = await TokenBlacklist.findOne({ token })
    assert.isNotNull(blacklistedToken, 'Token should be blacklisted')
  })

  group.teardown(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase()
    }
    await mongoServer.stop()
  })
})
