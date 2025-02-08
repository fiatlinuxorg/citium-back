import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import jwt from 'jsonwebtoken'
import env from '#start/env'

declare module '@adonisjs/core/http' {
  interface Request {
    user?: any
  }
}

export default class JwtAuthMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    /**
     * Get the token from the request header
     */
    // get the token from the request cookie
    const token = request.cookie('token')
    if (!token) {
      return response.unauthorized('Token mancante')
    }

    try {
      const decoded = jwt.verify(token, env.get('JWT_SECRET'))
      request.user = decoded
    } catch (error) {
      return response.unauthorized('Token non valido')
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
