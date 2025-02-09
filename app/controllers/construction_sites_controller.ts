import type { HttpContext } from '@adonisjs/core/http'
import ConstructionSite from '../models/construction_site_model.js'

export default class ConstructionSitesController {
  /**
   * Main method for listing all construction sites.
   * @returns list of all construction sites
   */
  index() {
    let constructionSites = ConstructionSite.find()
    return constructionSites
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
  store({ request }: HttpContext) {
    let constructionSite = new ConstructionSite(request.all())
    constructionSite.save()
    return constructionSite
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
