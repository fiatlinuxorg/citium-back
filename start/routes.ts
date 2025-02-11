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
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'

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

router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger);
})

// Renders Swagger-UI and passes YAML-output of /swagger
router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
  // return AutoSwagger.default.scalar("/swagger"); to use Scalar instead
  // return AutoSwagger.default.rapidoc("/swagger", "view"); to use RapiDoc instead (pass "view" default, or "read" to change the render-style)
})

router.get('/yaml', async () => {
  return AutoSwagger.default.jsonToYaml(router.toJSON())
})

// API routes
router
  .group(() => {
    // Auth routes
    router.post('/register', [AuthController, 'register'])
    router.post('/login', [AuthController, 'login'])
    //router.post('/refresh', [AuthController, 'refresh'])
    router.post('/logout', [AuthController, 'logout']).use(middleware.jwtAuth())

    /**
     * Construction Sites Routes
     * CRUD operations for managing construction sites
     */
    router
      .group(() => {
        router.get('/', [ConstructionSitesController, 'index']).use(middleware.dashboardView()) // List all construction sites
        router.get('/:query', [ConstructionSitesController, 'show']).use(middleware.dashboardView()) // Get a specific construction site
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
        router.get('/', [NotificationsController, 'getNotifications']).use(middleware.jwtAuth()) // List all notifications
        router.post('/read', [NotificationsController, 'markAsRead']).use(middleware.jwtAuth()) // Mark notifications as read
      })
      .prefix('/notifications') // Prefix for notifications routes

    /**
     * Subscriptions Routes
     */

    router
      .group(() => {
        router.post('/subscribe', [SubscriptionsController, 'subscribe']).use(middleware.jwtAuth()) // Subscribe to a construction site
        router
          .delete('/unsubscribe/:id', [SubscriptionsController, 'unsubscribe'])
          .use(middleware.jwtAuth()) // Unsubscribe from a construction site
      })
      .prefix('/subscriptions') // Prefix for subscriptions
  })

  .prefix('/api') // Prefix for all API routes
