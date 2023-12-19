import * as request from 'supertest'
import { QueryProductDto } from '../src/dto/query-product.dto'
import { httpServer, mockProducts, productCollection } from './setup'

describe('Pagination E2E', () => {
  // let mockProducts
  afterEach(async () => {
    expect((await productCollection.find().toArray()).length).toBe(
      mockProducts.length,
    )
  })
  it('should paginate correctly', async () => {
    const response = await request(httpServer)
      .post('/product/pag')
      .send({ page: 1, limit: 5 } as QueryProductDto)
    expect(response.status).toBe(200)
    expect(response.body.data.length).toBe(Math.floor(mockProducts.length / 2))
  }, 1500)
  it('should filter by name', async () => {
    expect((await productCollection.find().toArray()).length).toBe(11)
    const response = await request(httpServer)
      .post('/product/pag')
      .send({
        page: 1,
        limit: 5,
        filters: { name: 'test' },
      } as QueryProductDto)
    console.log(response.body)
    expect(response.status).toBe(200)
    expect(response.body.totalCount).toBe(mockProducts.length - 1)
  }, 1500)
  it('should filter by price', async () => {
    const response = await request(httpServer)
      .post('/product/pag')
      .send({
        page: 1,
        limit: 10,
        filters: { price: { min: 10, max: 50 } },
        inclusive: true,
      } as QueryProductDto)
    console.log()
    expect(response.status).toBe(200)
    expect(response.body.totalCount).toBe(
      response.body.data.filter(
        (pr: { price: number }) => pr.price >= 10 && pr.price <= 50,
      ).length,
    )
  }, 1500)
})
