import jwt from 'jsonwebtoken'
import User from '#models/user_model'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import env from '#start/env'

dotenv.config()

export default class AuthController {
  /**
   * @register
   * @operationId register
   * @description Register a new user with email, password, first name and last name
   * @requestBody { "email" : "mariorossi@mail.com", "password" : "Password123", "firstName" : "Mario", "lastName" : "Rossi" }
   * @responseBody 201 - { "message" : "Utente registrato correttamente" }
   * @responseBody 400 - { "message" : "L'utente esiste già" }
   * @responseBody 500 - { "message" : "Errore durante la registrazione" }
   */
  public async register({ request, response }: { request: any; response: any }) {
    const { email, password, firstName, lastName } = request.body()
    try {
      // Check if user exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return response.status(400).json({ message: "L'utente esiste già" })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      const user = new User({ email, password: hashedPassword, firstName, lastName })
      await user.save()

      return response.status(201).json({ message: 'Utente registrato correttamente' })
    } catch (error) {
      return response.status(500).json({ message: 'Errore durante la registrazione' })
    }
  }
  /**
   * @login
   * @opetarionId login
   * @description Login a user with email and password and set a JWT token in a cookie
   * @requestBody { "email" : "mariorossi@mail.com", "password" : "Password123" }
   * @responseBody 200 - { "message" : "Login effettuato con successo", "user" : { "_id" : "string", "email" : "string", "firstName" : "string", "lastName" : "string" } }
   * @responseBody 400 - { "message" : "Credenziali invalide" }
   * @responseBody 500 - { "message" : "Errore durante il login" }
   * @cookie token - JWT token
   */
  public async login({ request, response }: { request: any; response: any }) {
    const { email, password } = request.body()
    try {
      // Check if user exists
      const user = await User.findOne({ email })
      if (!user) {
        return response.status(400).json({ message: 'Credenziali invalide' })
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return response.status(400).json({ message: 'Credenziali invalide' })
      }

      // Generate token
      const token = jwt.sign({ id: user._id }, env.get('JWT_SECRET'), { expiresIn: '1h' })
      /*
      const jwtRefreshSecret = env.get('JWT_REFRESH_SECRET')
      if (!jwtRefreshSecret) {
        return response.status(500).json({ message: 'JWT_REFRESH_SECRET non configurato' })
      }
      const refreshToken = jwt.sign({ id: user._id }, jwtRefreshSecret, { expiresIn: '7d' })
      .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', secure: true })
      */
      return response
        .status(200)
        .cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: true })
        .json({
          message: 'Login effettuato con successo',
          user: {
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        })
    } catch (error) {
      return response.status(500).json({ message: 'Errore durante il login' })
    }
  }

  public async refresh({ request, response }: { request: any; response: any }) {
    try {
      const refreshToken = request.cookie('refreshToken')
      if (!refreshToken) {
        return response.status(401).json({ message: 'Token mancante' })
      }

      const jwtRefreshSecret = env.get('JWT_REFRESH_SECRET')
      if (!jwtRefreshSecret) {
        return response.status(500).json({ message: 'JWT_REFRESH_SECRET non configurato' })
      }
      const decoded = jwt.verify(refreshToken, jwtRefreshSecret)
      const user = await User.findById((decoded as jwt.JwtPayload).id)
      if (!user) {
        return response.status(401).json({ message: 'Utente non trovato' })
      }

      const token = jwt.sign({ id: user._id }, env.get('JWT_SECRET'), { expiresIn: '1h' })
      const newRefreshToken = jwt.sign({ id: user._id }, jwtRefreshSecret, { expiresIn: '7d' })

      return response
        .status(200)
        .cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: true })
        .cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          sameSite: 'strict',
          secure: true,
        })
        .json({ message: 'Token aggiornato', user })
    } catch (error) {
      return response.status(500).json({ message: "Errore durante l'aggiornamento del token" })
    }
  }
  /**
   * @logout
   * @operationId logout
   * @description Logout a user and clear the JWT token from the cookie
   * @responseBody 200 - { "message" : "Logout effettuato con successo" }
   * @responseBody 500 - { "message" : "Errore durante il logout" }
   */
  public async logout({ response }: { response: any }) {
    try {
      await response.clearCookie('token')
      return response.status(200).json({ message: 'Logout effettuato con successo' })
    } catch (error) {
      return response.status(500).json({ message: 'Errore durante il logout' })
    }
  }
}
