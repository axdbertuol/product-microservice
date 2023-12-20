import { every } from 'lodash'
import * as request from 'supertest'
import { QueryProductDto } from '../src/dto/query-product.dto'
import { httpServer, mockProducts } from './setup'

describe('Pagination E2E', () => {
  it('should paginate correctly', async () => {
    const response = await request(httpServer)
      .post('/product/pag')
      .send({ page: 1, limit: 5 } as QueryProductDto)
    expect(response.status).toBe(200)
    expect(response.body.data.length).toBe(Math.floor(mockProducts.length / 2))
  }, 1500)
  it('should filter by name', async () => {
    const response = await request(httpServer)
      .post('/product/pag')
      .send({
        page: 1,
        limit: 5,
        filters: { name: 'test' },
      } as QueryProductDto)
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
      } as QueryProductDto)
    expect(response.status).toBe(200)
    expect(
      every(response.body.data, ({ price }) => {
        return price >= 10 && price <= 50
      }),
    ).toBeTruthy()
  }, 1500)
  it('should filter by category', async () => {
    const response = await request(httpServer)
      .post('/product/pag')
      .send({
        page: 1,
        limit: 12,
        filters: { category: 'Test Category' },
      } as QueryProductDto)
    expect(response.status).toBe(200)

    expect(
      every(response.body.data, {
        category: 'Test Category',
      }),
    ).toBeTruthy()
  }, 1500)
})
