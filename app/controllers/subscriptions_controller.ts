import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '../models/subscription_model.js'

export default class SubscriptionsController {
  public async subscribe({ request, response }: HttpContext) {
    const user = request.user
    const constructionSiteId = request.body().construction_site_id
    if (!user?._id || !constructionSiteId) {
      return response.badRequest('Dati mancanti: user_id o construction_site_id null')
    }
    // Controlla se l'utente è già iscritto
    const existingSubscription = await Subscription.findOne({
      user_id: user._id,
      construction_site_id: constructionSiteId,
    })
    if (existingSubscription) {
      return response.conflict("L'utente è già iscritto a questo cantiere")
    }
    // Crea e salva la nuova iscrizione
    const subscription = new Subscription({
      user_id: user._id,
      construction_site_id: constructionSiteId,
    })
    await subscription.save()
    return response.created(subscription)
  }

  // ROTUE IS DELETE NOT POST
  public async unsubscribe({ params, request, response }: HttpContext) {
    let user = request.user
    let subscription = await Subscription.findOne({
      user_id: user?._id,
      construction_site_id: params.id,
    })

    if (subscription) {
      await subscription.deleteOne()
      return response.noContent()
    }
    return response.notFound()
  }
}
