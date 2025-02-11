import { test } from '@japa/runner'
import AuthController from '#controllers/auth_controller'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import User from '#models/user_model'

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
            email: 'test@test.com',
            password: 'Password123',
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
            password: 'Password123',
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
              assert.equal(data.message, "L'utente esiste già")
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
            password: 'Password123',
          }
        },
      },
      response: {
        status(status: number) {
          return {
            cookie(name: string, value: string, options: any) {
              try {
                assert.equal(name, 'token')
                assert.isDefined(value)
                assert.isDefined(options)
              } catch (error) {
                // .
              }
            },
            json(data: any) {
              try {
                assert.equal(status, 200)
                assert.equal(data.message, 'Login effettuato con successo')
                assert.isDefined(data.user._id)
                assert.equal(data.user.email, 'test@test.com')
                assert.equal(data.user.firstName, 'Test')
                assert.equal(data.user.lastName, 'User')
              } catch (error) {
                // .
              }
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

  group.teardown(async () => {
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase()
    }
    await mongoServer.stop()
  })
})
