import * as schemas from '../schemas'
import type {FastifyInstance} from 'fastify'
import type {ProductService} from '@app/product/ProductService'


interface CreateSingleRequest {
  Body: schemas.entities.CreateSingleProduct
}


export async function createSingle(fastify: FastifyInstance, service: ProductService) {
  return fastify
    .route<CreateSingleRequest>(
      {
        method: 'POST',
        url: '/admin/product/SINGLE',
        schema: {
          summary: 'Создать SINGLE продукт',
          tags: ['Продукт'],
          body: schemas.entities.CreateSingleProduct,
          response: {
            [201]: {
              description: 'Созданный продукт',
              type: 'object',
              properties: {
                product: schemas.entities.SingleProduct
              },
              additionalProperties: false,
              required: ['product']
            }
          }
        },
        security: {
          auth: true,
          admin: true
        },
        handler: async function(request, reply) {
          const product = await service.createSingle(request.body)

          reply
            .code(201)
            .type('application/json')
            .send({product})
        }
      }
    )
}