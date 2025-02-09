import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user_model'
import jwt, { JwtPayload } from 'jsonwebtoken'
import env from '#start/env'

declare module '@adonisjs/core/http' {
  interface Request {
    user?: JwtPayload & { _id: string }
  }
}

export default class JwtAuthMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const token = request.cookie('token')
    if (!token) {
      return response.unauthorized('Token mancante')
    }

    try {
      const decoded = jwt.verify(token, env.get('JWT_SECRET')) as jwt.JwtPayload
      const user = await User.findById(decoded.id)

      if (!user) {
        return response.unauthorized('Utente non trovato')
      }

      request.user = { ...user.toObject(), _id: user._id.toString() } // Assegna l'utente completo al request
    } catch (error) {
      return response.unauthorized('Token non valido')
    }

    return next()
  }
}
