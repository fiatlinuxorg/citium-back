import type { HttpContext } from '@adonisjs/core/http'
import ConstructionSite from '../models/construction_site_model.js'
import Subscription from '#models/subscription_model'
import Notification from '#models/notification_model'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'

export default class ConstructionSitesController {
  /**
   * @index
   * @operationId getAllConstructionSites
   * @description Get all construction sites and the user's subscriptions if authenticated
   * @responseBody 200 - { "constructionSites" : [ { "_id" : "67aa43801c22906f341e0880", "name" : "Cantiere", "street" : "Via del Brennero", "description" : "Costruzione di un nuovo cantiere", "impacts_road" : "true", "image_path" : "cantiere.png", "is_subscribed" : "true" } ] }
   */
  async index({ request, response }: HttpContext) {
    const user = request.user
    let userId = user?._id
    // Recupera tutti i cantieri
    const constructionSites = await ConstructionSite.find()
    if (userId) {
      // Recupera le iscrizioni dell'utente
      const subscriptions = await Subscription.find({ user_id: userId })
      // Estrai gli ID dei cantieri ai quali è iscritto
      const subscribedSites = new Set(
        subscriptions.map((sub) => sub.construction_site_id.toString())
      )
      // Aggiungi la proprietà is_subscribed ai cantieri
      const enrichedSites = constructionSites.map((site) => ({
        ...site.toObject(),
        is_subscribed: subscribedSites.has(site._id.toString()),
      }))

      return response.ok({ user, constructionSites: enrichedSites })
    }
    // Se l'utente non è autenticato, restituisci i cantieri senza is_subscribed
    return response.ok({ user, constructionSites })
  }

  /**
   * @show
   * @operationId getConstructionSites
   * @description Get construction sites by query and the user's subscriptions if authenticated
   * @requestParam query - string - Query to search for in the street and name fields
   * @responseBody 200 - { "constructionSites" : [ { "_id" : "67aa43801c22906f341e0880", "name" : "Cantiere", "street" : "Via del Brennero", "description" : "Costruzione di un nuovo cantiere", "impacts_road" : "true", "image_path" : "cantiere.png", "is_subscribed" : "true" } ] }
   */
  async show({ request, params, response }: HttpContext) {
    const user = request.user
    let userId = user?._id
    // Recupera tutti i cantieri prendendo la query come parametro sulla via e sul nome LIKE
    const constructionSites = await ConstructionSite.find({
      $or: [
        { street: { $regex: params.query, $options: 'i' } },
        { name: { $regex: params.query, $options: 'i' } },
      ],
    })
    if (userId) {
      // Recupera le iscrizioni dell'utente
      const subscriptions = await Subscription.find({ user_id: userId })
      // Estrai gli ID dei cantieri ai quali è iscritto
      const subscribedSites = new Set(
        subscriptions.map((sub) => sub.construction_site_id.toString())
      )
      // Aggiungi la proprietà is_subscribed ai cantieri
      const enrichedSites = constructionSites.map((site) => ({
        ...site.toObject(),
        is_subscribed: subscribedSites.has(site._id.toString()),
      }))

      return response.ok({ user, constructionSites: enrichedSites })
    }
    // Se l'utente non è autenticato, restituisci i cantieri senza is_subscribed
    return response.ok({ user, constructionSites })
  }

  /**
   * @store
   * @operationId createConstructionSite
   * @description Create a new construction site
   * @requestBody { "name" : "Cantiere", "street" : "Via del Brennero", "description" : "Costruzione di un nuovo cantiere", "impacts_road" : "true", "image" : "cantiere.png" }
   * @responseBody 201 - { "name" : "Cantiere", "street" : "Via del Brennero", "description" : "Costruzione di un nuovo cantiere", "impacts_road" : "true", "image_path" : "cantiere.png" }
   * @responseBody 400 - { "message" : "Errore nell'inserimento del cantiere" }
   * @responseBody 500 - { "message" : "Errore nell'inserimento del cantiere" }
   */
  async store({ request, response }: HttpContext) {
    const constructionSite = new ConstructionSite(request.all())
    const image = request.file('image', {
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })

    if (image) {
      // Save the image to the /storage/uploads/ directory
      let uniqueName = `${cuid()}.${image.extname}`
      await image.move(app.makePath('storage/uploads'), {
        name: uniqueName,
      })

      // Set the image path in the construction site
      constructionSite.image_path = uniqueName
    }
    try {
      await constructionSite.save()
      return response.created(constructionSite)
    } catch (error) {
      return response.badRequest("Errore nell'inserimento del cantiere")
    }
  }

  /**
   * @update
   * @operationId updateConstructionSite
   * @description Update a construction site by ID
   * @requestBody { "name" : "Cantiere", "street" : "Via del Brennero", "description" : "Costruzione di un nuovo cantiere", "impacts_road" : "true", "image" : "cantiere.png" }
   * @requestParam id - string - ID of the construction site
   * @responseBody 200 - { "name" : "Cantiere", "street" : "Via del Brennero", "description" : "Costruzione di un nuovo cantiere", "impacts_road" : "true", "image_path" : "cantiere.png" }
   * @responseBody 404 - { "message" : "Cantiere non trovato" }
   */
  async update({ params, request, response }: HttpContext) {
    try {
      let constructionSite = await ConstructionSite.findByIdAndUpdate(params.id, request.all())
      let subscribers = await Subscription.find({ construction_site_id: params.id })
      // Send a notification to all subscribers
      subscribers.forEach(async (sub) => {
        let notification = new Notification({
          user_id: sub.user_id,
          construction_site_id: params.id,
          message: `Il cantiere ${constructionSite?.name} è stato aggiornato`,
        })
        await notification.save()
      })
      return response.ok(constructionSite)
    } catch (error) {
      return response.notFound()
    }
  }

  /**
   * @destroy
   * @operationId deleteConstructionSite
   * @description Delete a construction site by ID
   * @requestParam id - string - ID of the construction site
   * @responseBody 204 - { "message" : "Cantiere eliminato con successo" }
   * @responseBody 404 - { "message" : "Cantiere non trovato" }
   */
  async destroy({ params, response }: HttpContext) {
    try {
      await ConstructionSite.findByIdAndDelete(params.id)
      // Also delete all subscriptions to this construction site
      await Subscription.deleteMany({ construction_site_id: params.id })
      return response.noContent()
    } catch (error) {
      return response.notFound()
    }
  }
}
