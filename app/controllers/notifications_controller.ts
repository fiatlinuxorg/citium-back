import type { HttpContext } from '@adonisjs/core/http'
import Notification from '../models/notification_model.js'

/**
 * @getNotifications
 * @operationId getNotifications
 * @description Get all unread notifications for the authenticated user
 * @responseBody 200 - { "notifications" : [ { "_id" : "67aa43801c22906f341e0880", "user_id" : "67aa43801c22906f341e0880", "message" : "Nuova notifica", "read" : "false" } ] }
 * @responseBody 400 - { "message" : "Errore durante il recupero delle notifiche" }
 * @responseBody 401 - { "message" : "Non autorizzato" }
 */
export default class NotificationsController {
  public async getNotifications({ request, response }: HttpContext) {
    try {
      let user = request.user
      let notifications = await Notification.find({ user_id: user?._id, read: false })
      return response.ok(notifications)
    } catch (error) {
      return response.badRequest(error)
    }
  }

  /**
   * @markAsRead
   * @operationId markAsRead
   * @description Mark all notifications as read for the authenticated user
   * @responseBody 200 - { "message" : "Notifications marked as read" }
   * @responseBody 400 - { "message" : "Errore durante la marcatura delle notifiche come lette" }
   * @responseBody 401 - { "message" : "Non autorizzato" }
   */
  public async markAsRead({ request, response }: HttpContext) {
    try {
      let user = request.user
      await Notification.updateMany({ user_id: user?._id }, { read: true })
      return response.ok({ message: 'Notifications marked as read' })
    } catch (error) {
      return response.badRequest(error)
    }
  }
}
