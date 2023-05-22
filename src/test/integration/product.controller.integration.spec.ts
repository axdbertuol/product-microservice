import { Test } from '@nestjs/testing'
import { HttpServer, INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../../app.module'
import { Connection } from 'mongoose'
import { DatabaseService } from '../../database/database.service'
import { UpdateCategoryDto } from 'src/products/dto/update-category.dto'
import { CreateProductDto } from 'src/products/dto/create-product.dto'

describe('Products e2e', () => {
  let app: INestApplication
  let dbConnection: Connection
  let httpServer: HttpServer
  const createProductDto: CreateProductDto = {
    name: 'teste',
    price: 0,
    category: 'bla',
  }

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    expect(moduleFixture).toBeDefined()
    app = moduleFixture.createNestApplication()
    await app.init()
    dbConnection = moduleFixture
      .get<DatabaseService>(DatabaseService)
      .getDbHandle()
    httpServer = app.getHttpServer()
  })

  afterAll(async () => {
    await dbConnection.collection('products').deleteMany({})
    await app.close()
  })

  beforeEach(async () => {
    await dbConnection.collection('products').deleteMany({})
  })

  it('findAll', async () => {
    await dbConnection.collection('products').insertOne(createProductDto)
    const response = await request(httpServer).get('/products')
    expect(response.status).toBe(200)
    expect(response.body).toMatchObject([{ name: 'teste' }])
  })

  it('find', async () => {
    await dbConnection.collection('products').insertOne(createProductDto)
    const cats = await dbConnection.collection('products').find().toArray()
    const response = await request(httpServer).get('/products/' + cats[0]._id)
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('name', 'teste')
  })

  it('should create a new category', async () => {
    const res = await request(httpServer)
      .post('/products')
      .send(createProductDto)
      .expect(201)

    // createdCategory = res.body
    // expect(createdCategory.name).toBe(createProductDto.name)
    // expect(createdCategory._id).toBeDefined()
  })

  it('should return a 400 error if name is not provided', async () => {
    await dbConnection.collection('products').insertOne({ name: 'teste' })

    const res: request.Response = await request(httpServer)
      .post('/products')
      .send({ name: '' })
      .expect(400)
    expect(res.body.message).toContain('name should not be empty')
  })
  it('should update the category', async () => {
    const categoryDto: UpdateCategoryDto = {
      name: 'blabla',
    }
    await dbConnection.collection('products').insertOne({ name: 'teste' })
    const cats = await dbConnection.collection('products').find().toArray()
    const response = await request(httpServer)
      .put(`/products/${cats[0]._id}`)
      .send(categoryDto)
      .expect(200)

    expect(response.body).toEqual(expect.objectContaining(categoryDto))
  })

  it('should delete the category', async () => {
    await dbConnection.collection('products').insertOne({ name: 'teste' })
    const cats = await dbConnection.collection('products').find().toArray()

    const response = await request(httpServer)
      .delete(`/products/${cats[0]._id}`)
      .expect(200)

    expect(response.body).toMatchObject({})
  })
})
