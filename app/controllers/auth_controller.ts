import jwt from 'jsonwebtoken'
import User from '#models/user_model'
import TokenBlacklist from '#models/token_blacklist'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import env from '#start/env'

dotenv.config()

export default class AuthController {
  /**
   * Register a new user using email and password.
   * @returns HTTP status code + message
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
      console.error(error)
      return response.status(500).json({ message: 'Errore durante la registrazione' })
    }
  }
  /**
   * Login a user using email and password. If the user exists and the password is correct, a JWT token is generated.
   * @returns HTTP status code + message + JWT token
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
      const jwtRefreshSecret = env.get('JWT_REFRESH_SECRET')
      if (!jwtRefreshSecret) {
        return response.status(500).json({ message: 'JWT_REFRESH_SECRET non configurato' })
      }
      const refreshToken = jwt.sign({ id: user._id }, jwtRefreshSecret, { expiresIn: '7d' })

      return response
        .status(200)
        .cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: true })
        .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', secure: true })
        .json({ message: 'Login effettuato con successo' })
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
      console.log('Token aggiornato')

      return response
        .status(200)
        .cookie('token', token, { httpOnly: true, sameSite: 'strict', secure: true })
        .cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          sameSite: 'strict',
          secure: true,
        })
        .json({ message: 'Token aggiornato' })
    } catch (error) {
      return response.status(500).json({ message: "Errore durante l'aggiornamento del token" })
    }
  }

  public async logout({ request, response }: { request: any; response: any }) {
    try {
      const token = request.header('Authorization').replace('Bearer ', '')

      // Aggiungi il token alla blacklist
      const blacklistedToken = new TokenBlacklist({ token })
      await blacklistedToken.save()

      return response.status(200).json({ message: 'Logout effettuato con successo' })
    } catch (error) {
      console.error(error)
      return response.status(500).json({ message: 'Errore durante il logout' })
    }
  }
}
