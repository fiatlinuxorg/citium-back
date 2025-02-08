/*
|--------------------------------------------------------------------------
| Routes File
|--------------------------------------------------------------------------
|
| This file is used for defining the HTTP routes for the application.
| Routes are organized into groups for better structure and clarity.
|
*/

import router from '@adonisjs/core/services/router'
import { sep, normalize } from 'node:path'
import app from '@adonisjs/core/services/app'
import { middleware } from './kernel.js'

// Import controllers
const AuthController = () => import('#controllers/auth_controller')
const ConstructionSitesController = () => import('#controllers/construction_sites_controller')
const NotificationsController = () => import('#controllers/notifications_controller')
const SubscriptionsController = () => import('#controllers/subscriptions_controller')

const PATH_TRAVERSAL_REGEX = /(?:^|[\\/])\.\.(?:[\\/]|$)/
router.get('/uploads/*', ({ request, response }) => {
  const filePath = request.param('*').join(sep)
  const normalizedPath = normalize(filePath)

  if (PATH_TRAVERSAL_REGEX.test(normalizedPath)) {
    return response.badRequest('Malformed path')
  }

  const absolutePath = app.makePath('storage/uploads', normalizedPath)
  return response.download(absolutePath)
})

// API routes
router
  .group(() => {
    // Health check route
    router.get('/test', () => {
      return { message: 'Hello world' }
    })

    router
      .get('/protected', () => {
        return { message: 'This is a protected route' }
      })
      .use(middleware.jwtAuth())

    // Auth routes
    router.post('/register', [AuthController, 'register'])
    router.post('/login', [AuthController, 'login'])
    router.post('/refresh', [AuthController, 'refresh'])
    router.post('/logout', [AuthController, 'logout'])

    /**
     * Construction Sites Routes
     * CRUD operations for managing construction sites
     */
    router
      .group(() => {
        router.get('/', [ConstructionSitesController, 'index']) // List all construction sites
        router.get('/:id', [ConstructionSitesController, 'show']) // Get a specific construction site
        router.post('/', [ConstructionSitesController, 'store']).use(middleware.jwtAuth()) // Create a new construction site
        router.put('/:id', [ConstructionSitesController, 'update']).use(middleware.jwtAuth()) // Update an existing construction site
        router.delete('/:id', [ConstructionSitesController, 'destroy']).use(middleware.jwtAuth()) // Delete a construction site
      })
      .prefix('/sites') // Prefix for construction sites routes

    /**
     * Notifications Routes
     */

    router
      .group(() => {
        router.get('/:user_id', [NotificationsController, 'getNotifications']) // List all notifications
        router.post('/read', [NotificationsController, 'markAsRead']) // Mark notifications as read
      })
      .prefix('/notifications') // Prefix for notifications routes

    /**
     * Subscriptions Routes
     */

    router
      .group(() => {
        router.post('/subscribe', [SubscriptionsController, 'subscribe']) // Subscribe to a construction site
        router.post('/unsubscribe', [SubscriptionsController, 'unsubscribe']) // Unsubscribe from a construction site
      })
      .prefix('/subscriptions') // Prefix for subscriptions
=======
      .prefix('/sites')
  })

  .prefix('/api') // Prefix for all API routes
