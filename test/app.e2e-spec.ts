import { Test } from '@nestjs/testing'
import { HttpServer, INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { Collection, Connection } from 'mongoose'
import { DatabaseService } from '../src/database/database.service'
import { UpdateCategoryDto } from '../src/dto/update-category.dto'
import { CreateProductDto } from '../src/dto/create-product.dto'
import { CreateCategoryDto } from '../src/dto/create-category.dto'
import { Category } from '../src/entities/category.entity'

describe('E2E Tests', () => {
  let app: INestApplication
  let dbConnection: Connection
  let httpServer: HttpServer
  const createProductDto: CreateProductDto = {
    name: 'teste',
    price: 0,
    category: 'bla',
  }
  const createCategoryDto: CreateCategoryDto = {
    name: 'Test Category',
  }
  let createdCategory: Category
  let productsCollection: Collection<any>
  let categoriesCollection: Collection<any>
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
    productsCollection = dbConnection.collection('products')
    categoriesCollection = dbConnection.collection('categories')
  })

  afterAll(async () => {
    await productsCollection.deleteMany({})
    await app.close()
  })

  beforeEach(async () => {
    await productsCollection.deleteMany({})
    await categoriesCollection.deleteMany({})
  })

  describe('Products', () => {
    it('findAll', async () => {
      await productsCollection.insertOne(createProductDto)
      const response = await request(httpServer).get('/products')
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([{ name: 'teste' }])
    }, 500)

    it('find', async () => {
      await productsCollection.insertOne(createProductDto)
      const cats = await productsCollection.find().toArray()
      const response = await request(httpServer).get('/products/' + cats[0]._id)
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('name', 'teste')
    }, 500)

    it('should create a new product', async () => {
      await Promise.all([
        categoriesCollection.insertOne({ name: 'bla' }),
        categoriesCollection.find().toArray(),
      ]).then(async () => {
        const res = await request(httpServer)
          .post('/products')
          .send(createProductDto)
          .expect(201)

        const createdCategory = res.body
        expect(createdCategory.name).toBe(createProductDto.name)
        expect(createdCategory._id).toBeDefined()
      })
    }, 500)

    it('should return a 400 error if name is not provided', async () => {
      await productsCollection.insertOne({ name: 'teste' })

      const res: request.Response = await request(httpServer)
        .post('/products')
        .send({ name: '' })
        .expect(400)
      expect(res.body.message).toContain('name should not be empty')
    })
    it('should update the product', async () => {
      const productDto = {
        name: 'blabla',
      }
      await productsCollection.insertOne({ name: 'teste' })
      const cats = await productsCollection.find().toArray()
      const response = await request(httpServer)
        .put(`/products/${cats[0]._id}`)
        .send(productDto)
        .expect(200)

      expect(response.body).toEqual(expect.objectContaining(productDto))
    }, 500)

    it('should delete the product', async () => {
      await productsCollection.insertOne({ name: 'teste' })
      const cats = await productsCollection.find().toArray()

      const response = await request(httpServer)
        .delete(`/products/${cats[0]._id}`)
        .expect(200)

      expect(response.body).toMatchObject({})
    }, 500)
  })

  describe('Categories', () => {
    it('findAll', async () => {
      await categoriesCollection.insertOne({ name: 'teste' }).then(async () => {
        const cats = await dbConnection
          .collection('categories')
          .find()
          .toArray()
        const response = await request(httpServer).get('/categories')
        expect(response.status).toBe(200)
        expect(response.body).toMatchObject([{ name: 'teste' }])
      })
    })

    it('find', async () => {
      await categoriesCollection
        .insertOne({ name: 'teste' })
        .then(async (x) => {
          // console.log(x)
          const cats = await dbConnection
            .collection('categories')
            .find()
            .toArray()
          const response = await request(httpServer).get(
            '/categories/' + cats[0]._id,
          )
          expect(response.status).toBe(200)
          expect(response.body).toHaveProperty('name', 'teste')
        })
    })

    it('should create a new category', async () => {
      await request(httpServer)
        .post('/categories')
        .send(createCategoryDto)
        .then((res) => {
          // console.log(res)
          createdCategory = res.body
          expect(createdCategory.name).toBe(createCategoryDto.name)
          expect(createdCategory._id).toBeDefined()
        })
      // .expect(201)
    })

    it('should return a 400 error if name is not provided', async () => {
      await categoriesCollection.insertOne({ name: 'teste' })

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
      const aff = categoriesCollection
      await aff.insertOne({ name: 'teste' })
      const cats = await aff.find().toArray()
      const response = await request(httpServer)
        .put(`/categories/${cats[0]._id}`)
        .send(categoryDto)
        .expect(200)

      expect(response.body).toEqual(expect.objectContaining(categoryDto))
    })

    it('should delete the category', async () => {
      const po = categoriesCollection
      await po.insertOne({ name: 'teste' }).then(async (f) => {
        const cats = await categoriesCollection.find().toArray()

        const response = await request(httpServer)
          .delete(`/categories/${cats[0]._id}`)
          .expect(200)

        expect(response.body).toMatchObject({})
      })
    })
  })
})
