import type { HttpContext } from '@adonisjs/core/http'
import Notification from '../models/notification_model.js'

export default class NotificationsController {
  public async getNotifications({ params }: HttpContext) {
    let notifications = Notification.find({ user_id: params.user_id })
    return notifications
  }

  public async markAsRead({ params }: HttpContext) {
    let notifications = Notification.updateMany({ user_id: params.user_id }, { read: true })
    return notifications
  }
}
