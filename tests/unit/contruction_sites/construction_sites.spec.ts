import { test } from '@japa/runner'
import ConstructionSitesController from '#controllers/construction_sites_controller'
import { HttpContext } from '@adonisjs/core/http'

const controller = new ConstructionSitesController()

test.group('ConstructionSitesController.store', () => {

    test('create a new construction site', async ({ assert }) => {
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

        const constructionSite = controller.store(httpContext)

        assert.isDefined(constructionSite);
        assert.equal(constructionSite.name, request.name)
        assert.equal(constructionSite.description, request.description)
        assert.equal(constructionSite.street, request.street)
        assert.equal(constructionSite.number, request.number)
        assert.equal(constructionSite.start_date.toISOString(), request.start_date.toISOString())
        assert.equal(constructionSite.end_date.toISOString(), request.end_date.toISOString())
        assert.equal(constructionSite.size, request.size)
    })


    test('update a construction site', async ({ assert }) => {
      const request = {
        name: "test_name",
        description: "test",
        street: "test_street",
        number: "test_number",
        start_date:  new Date("2022-03-25"),
        end_date:  new Date("2022-03-26"),
        extension_to: new Date("2022-03-27"),
        image_path: "test_image_path",
        size: 3,
      }

      const httpContext = {
          request: request,
        } as unknown as HttpContext
        httpContext.request.all = () => request

      const constructionSite = await controller.update(httpContext)
      if (constructionSite) {
        constructionSite.save()
        assert.equal(constructionSite.name, request.name)
        assert.equal(constructionSite.description, request.description)
        assert.equal(constructionSite.street, request.street)
        assert.equal(constructionSite.number, request.number)
        assert.equal(constructionSite.start_date.toISOString(), request.start_date.toISOString())
        assert.equal(constructionSite.end_date.toISOString(), request.end_date.toISOString())
        assert.isDefined(constructionSite.extension_to)
        if (constructionSite.extension_to) {
          assert.equal(constructionSite.extension_to.toISOString(), request.extension_to.toISOString())
        }
        assert.equal(constructionSite.size, request.size)
      }

      assert.isDefined(constructionSite);
      
  })

  test('show a construction site', async ({ assert }) => {
    const request = {
      name: "test_name",
      description: "test",
      street: "test_street",
      number: "test_number",
      start_date:  new Date("2022-03-25"),
      end_date:  new Date("2022-03-26"),
      extension_to: new Date("2022-03-27"),
      image_path: "test_image_path",
      size: 3,
    }

    const httpContext = {
        request: request,
      } as unknown as HttpContext
      httpContext.request.all = () => request

    const constructionSite = controller.show(httpContext)

    assert.isDefined(constructionSite);
    assert.equal(constructionSite.name, request.name)
    assert.equal(constructionSite.description, request.description)
    assert.equal(constructionSite.street, request.street)
    assert.equal(constructionSite.number, request.number)
    assert.equal(constructionSite.start_date.toISOString(), request.start_date.toISOString())
    assert.equal(constructionSite.end_date.toISOString(), request.end_date.toISOString())
    assert.isDefined(constructionSite.extension_to)
    if (constructionSite.extension_to) {
      assert.equal(constructionSite.extension_to.toISOString(), request.extension_to.toISOString())
    }
    assert.equal(constructionSite.size, request.size)
  })


})

/*test('show all construction site', async ({ assert }) => {
  const request = {
    name: "test_name",
    description: "test",
    street: "test_street",
    number: "test_number",
    start_date:  new Date("2022-03-25"),
    end_date:  new Date("2022-03-26"),
    extension_to: new Date("2022-03-27"),
    image_path: "test_image_path",
    size: 3,
  }

  const httpContext = {
      request: request,
    } as unknown as HttpContext
    httpContext.request.all = () => request

  const constructionSite = controller.store(httpContext)

  assert.isDefined(constructionSite);
  assert.equal(constructionSite.name, request.name)
  assert.equal(constructionSite.description, request.description)
  assert.equal(constructionSite.street, request.street)
  assert.equal(constructionSite.number, request.number)
  assert.equal(constructionSite.start_date.toISOString(), request.start_date.toISOString())
  assert.equal(constructionSite.end_date.toISOString(), request.end_date.toISOString())
  assert.isDefined(constructionSite.extension_to)
  if (constructionSite.extension_to) {
    assert.equal(constructionSite.extension_to.toISOString(), request.extension_to.toISOString())
  }
  assert.equal(constructionSite.size, request.size)
})*/