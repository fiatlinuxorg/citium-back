import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '../models/subscription_model.js'

export default class SubscriptionsController {
  public async subscribe({ request }: HttpContext) {
    // Get user's _id from the JWT token
    let user = request.user
    let subscription = new Subscription({
      user_id: user?._id,
      construction_site_id: request.body().construction_site_id,
    })
    subscription.save()
    return subscription
  }

  public async unsubscribe({ params }: HttpContext) {
    let subscription = Subscription.findOneAndDelete({
      user_id: params.user_id,
      construction_site_id: params.construction_site_id,
    })
    return subscription
  }
}
