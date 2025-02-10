import type { HttpContext } from '@adonisjs/core/http'
import Notification from '../models/notification_model.js'

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
