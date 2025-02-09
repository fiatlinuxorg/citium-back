import { test } from '@japa/runner'
import ConstructionSitesController from '#controllers/construction_sites_controller'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { HttpContext } from '@adonisjs/core/http'

let mongoServer: MongoMemoryServer

test.group('ConstructionSitesController.store', (group) => {
    group.setup(async () => {
        mongoServer = await MongoMemoryServer.create()
      })

    test('should create a new construction site without an image', async ({ assert }) => {
        const request = {
          name: "test_name",
          description: "test",
          street: "test_street",
          number: "test_number",
          start_date:  new Date("2022-03-25"),
          end_date:  new Date("2022-03-26"),
          size: 3,
        }

        const httpContext = {
            request: request,
          } as unknown as HttpContext
          httpContext.request.all = () => request
          httpContext.request.file = () => null

        const controller = new ConstructionSitesController()

        const constructionSite = await controller.store(httpContext)

        assert.isDefined(constructionSite);
        assert.equal(constructionSite.name, request.name)
        assert.equal(constructionSite.description, request.description)
        assert.equal(constructionSite.street, request.street)
        assert.equal(constructionSite.number, request.number)
        assert.equal(constructionSite.start_date.toISOString(), request.start_date.toISOString())
        assert.equal(constructionSite.end_date.toISOString(), request.end_date.toISOString())
        assert.equal(constructionSite.size, request.size)
        assert.isUndefined(constructionSite.image_path)
    })


    /*test('should create a new construction site with an image', async ({ assert }) => {
      const request = {
        name: "test_name",
        description: "test",
        street: "test_street",
        number: "test_number",
        start_date:  new Date("2022-03-25"),
        end_date:  new Date("2022-03-26"),
        image_path: "test_image_path",
        size: 3,
      }

      const httpContext = {
          request: request,
        } as unknown as HttpContext
        httpContext.request.all = () => request
        httpContext.request.file = () => { return { clientName: "test_image_path" } }

      const controller = new ConstructionSitesController()

      const constructionSite = await controller.store(httpContext)

      assert.isDefined(constructionSite);
      assert.equal(constructionSite.name, request.name)
      assert.equal(constructionSite.description, request.description)
      assert.equal(constructionSite.street, request.street)
      assert.equal(constructionSite.number, request.number)
      assert.equal(constructionSite.start_date.toISOString(), request.start_date.toISOString())
      assert.equal(constructionSite.end_date.toISOString(), request.end_date.toISOString())
      assert.equal(constructionSite.size, request.size)
      assert.isUndefined(constructionSite.image_path)
  })*/

    group.teardown(async () => {
        if (mongoose.connection.db) {
          await mongoose.connection.db.dropDatabase()
        }
        await mongoServer.stop()
      })
})

