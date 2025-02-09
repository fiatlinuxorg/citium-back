import type { HttpContext } from '@adonisjs/core/http'
import ConstructionSite from '../models/construction_site_model.js'
import Subscription from '#models/subscription_model'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'

export default class ConstructionSitesController {
  /**
   * Main method for listing all construction sites.
   * @returns list of all construction sites
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
   * Method for showing a specific construction site.
   * @param params: id of the construction site
   * @returns list with the construction site with the given id
   */
  show({ params }: HttpContext) {
    let constructionSite = ConstructionSite.findById(params.id)
    return constructionSite
  }

  /**
   * Method for creating a new construction site.
   * @param request: construction site data. List can be found in app/models/construction_site_model.ts
   * @returns the created construction site
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
   * Method for updating an existing construction site.
   * @param params: id of the construction site, request: construction site data to update
   * @returns the updated construction site
   */
  update({ params, request }: HttpContext) {
    let constructionSite = ConstructionSite.findByIdAndUpdate(params.id, request.all())
    return constructionSite
  }

  /**
   * Method for deleting a construction site.
   * @param params: id of the construction site
   * @returns the deleted construction site
   */
  destroy({ params }: HttpContext) {
    let constructionSite = ConstructionSite.findByIdAndDelete(params.id)
    return constructionSite
  }
}
