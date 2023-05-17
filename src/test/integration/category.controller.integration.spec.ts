import { Test } from '@nestjs/testing'
import { HttpServer, INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../../app.module'
import { Connection } from 'mongoose'
import { DatabaseService } from '../../database/database.service'
import { CreateCategoryDto } from 'src/products/dto/create-category.dto'
import { Category } from 'src/products/entities/category.entity'
import { UpdateCategoryDto } from 'src/products/dto/update-category.dto'

describe('CategoryController integration', () => {
  let app: INestApplication
  let dbConnection: Connection
  let httpServer: HttpServer
  const createCategoryDto: CreateCategoryDto = {
    name: 'Test Category',
  }
  let createdCategory: Category

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
    await dbConnection.collection('categories').deleteMany({})
    await app.close()
  })

  beforeEach(async () => {
    await dbConnection.collection('categories').deleteMany({})
  })

  it('findAll', async () => {
    await dbConnection.collection('categories').insertOne({ name: 'teste' })
    const response = await request(httpServer).get('/categories')
    expect(response.status).toBe(200)
    expect(response.body).toMatchObject([{ name: 'teste' }])
  })

  it('find', async () => {
    await dbConnection.collection('categories').insertOne({ name: 'teste' })
    const cats = await dbConnection.collection('categories').find().toArray()
    const response = await request(httpServer).get('/categories/' + cats[0]._id)
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('name', 'teste')
  })

  it('should create a new category', async () => {
    const res = await request(httpServer)
      .post('/categories')
      .send(createCategoryDto)
      .expect(201)

    createdCategory = res.body
    expect(createdCategory.name).toBe(createCategoryDto.name)
    expect(createdCategory._id).toBeDefined()
  })

  it('should return a 400 error if name is not provided', async () => {
    await dbConnection.collection('categories').insertOne({ name: 'teste' })

    const res: request.Response = await request(httpServer)
      .post('/categories')
      .send({ name: '' })
      .expect(400)
    expect(res.body.message).toContain('name should not be empty')
  })
  it('should update the category', async () => {
    const categoryDto: UpdateCategoryDto = {
      name: 'blabla',
    }
    await dbConnection.collection('categories').insertOne({ name: 'teste' })
    const cats = await dbConnection.collection('categories').find().toArray()
    const response = await request(httpServer)
      .put(`/categories/${cats[0]._id}`)
      .send(categoryDto)
      .expect(200)

    expect(response.body).toEqual(expect.objectContaining(categoryDto))
  })

  it('should delete the category', async () => {
    await dbConnection.collection('categories').insertOne({ name: 'teste' })
    const cats = await dbConnection.collection('categories').find().toArray()

    const response = await request(httpServer)
      .delete(`/categories/${cats[0]._id}`)
      .expect(200)

    expect(response.body).toMatchObject({})
  })
})
