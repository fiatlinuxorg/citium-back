import type { HttpContext } from '@adonisjs/core/http'
import Subscription from '../models/subscription_model.js'

export default class SubscriptionsController {
  /**
   * @subscribe
   * @operationId subscribe
   * @description Subscribe the authenticated user to a construction site
   * @requestBody { "construction_site_id" : "67aa43801c22906f341e0880" }
   * @responseBody 201 - { "user_id" : "67aa43801c22906f341e0880", "construction_site_id" : "67aa438
   * @responseBody 400 - { "message" : "Dati mancanti: user_id o construction_site_id null" }
   * @responseBody 409 - { "message" : "L'utente è già iscritto a questo cantiere" }
   */
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

  /**
   * @unsubscribe
   * @operationId unsubscribe
   * @description Unsubscribe the authenticated user from a construction site
   * @requestParam id - string - Construction site ID
   * @response 204
   * @response 404
   */
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
