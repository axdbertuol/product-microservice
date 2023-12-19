import * as request from 'supertest'
import { CreatedCategoryDto } from '../src/dto/create-category.dto'
import { UpdateCategoryDto } from '../src/dto/update-category.dto'
import {
  categoriesCollection,
  createCategoryDto,
  createProductDto,
  dbConnection,
  httpServer,
  productCollection,
} from './setup'

describe('E2E Tests', () => {
  beforeEach(async () => {
    await Promise.all([
      productCollection.deleteMany({}),
      categoriesCollection.deleteMany({}),
    ])
  })

  describe('Product', () => {
    it('findAll', async () => {
      const cat = await categoriesCollection.insertOne(createCategoryDto)
      await productCollection.insertOne({
        ...createProductDto,
        category: cat.insertedId,
      })
      const response = await request(httpServer).get('/product')
      expect(response.status).toBe(200)
      expect(response.body).toMatchObject([{ name: 'teste' }])
    }, 500)

    it('find', async () => {
      await productCollection.insertOne(createProductDto)
      const cats = await productCollection.find().toArray()
      const response = await request(httpServer).get('/product/' + cats[0]._id)
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('name', 'teste')
    }, 500)

    it('should create a new product', async () => {
      const { insertedId } = await categoriesCollection.insertOne(
        createCategoryDto,
      )

      const res = await request(httpServer)
        .post('/product')
        .send({ ...createProductDto, category: 'Test Category' })
        .expect(201)

      const createdProduct = res.body[0]
      expect(createdProduct.name).toBe(createProductDto.name)
      console.log(createdProduct)
      expect(createdProduct).toBeDefined()
    }, 500)

    it('should return a 422 error if name is not provided', async () => {
      await productCollection.insertOne({ name: 'teste' })

      const res: request.Response = await request(httpServer)
        .post('/product')
        .send({})
        .expect(422)

      Object.keys(res.body.errors).map((key) => {
        expect(['category', 'description', 'name', 'price']).toContainEqual(key)
      })
    })
    it('should update the product', async () => {
      const productDto = {
        name: 'blabla',
      }
      await productCollection.insertOne({ name: 'teste' })
      const cats = await productCollection.find().toArray()
      const response = await request(httpServer)
        .patch(`/product/${cats[0]._id}`)
        .send(productDto)
        .expect(200)

      expect(response.body).toEqual(expect.objectContaining(productDto))
    }, 500)

    it('should not update the product if category is invalid ', async () => {
      const productDto = {
        name: 'blabla',
        category: 'invalid',
      }
      await productCollection.insertOne({ name: 'teste' })
      const prods = await productCollection.find().toArray()
      const response = await request(httpServer)
        .patch(`/product/${prods[0]._id}`)
        .send(productDto)
        .expect(422)
      expect(response.body.cause.error).toContain('invalidCategory')
    }, 500)

    it('should delete the product', async () => {
      await productCollection.insertOne({ name: 'teste' })
      const prods = await productCollection.find().toArray()

      const response = await request(httpServer)
        .delete(`/product/${prods[0]._id}`)
        .expect(200)

      expect(response.body).toMatchObject({})
    }, 500)
  })

  describe('Categories', () => {
    it('findAll', async () => {
      await categoriesCollection.insertOne({ name: 'teste' }).then(async () => {
        const response = await request(httpServer).get('/categories')
        expect(response.status).toBe(200)
        expect(response.body).toMatchObject([{ name: 'teste' }])
      })
    })

    it('find', async () => {
      await categoriesCollection.insertOne({ name: 'teste' }).then(async () => {
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
          const createdCategory = res.body[0] as CreatedCategoryDto
          expect(createdCategory.name).toBe(createCategoryDto.name)
          // expect(createdCategory._id).toBeDefined()
        })
      // .expect(201)
    })

    it('should return a 422 error if name is not provided', async () => {
      await categoriesCollection.insertOne({ name: 'teste' })

      const res: request.Response = await request(httpServer)
        .post('/categories')
        .send({ name: '' })
        .expect(422)
      // expect(res.body).toEqual(
      //   expect.objectContaining({ statusCode: 400, path: '/product' }),
      // )
      expect(res.body.errors).toHaveProperty('name')
    })
    it('should update the category', async () => {
      const categoryDto: UpdateCategoryDto = {
        name: 'blabla',
      }
      const cat = await categoriesCollection.insertOne({ name: 'teste' })

      const response = await request(httpServer)
        .patch(`/categories/${cat.insertedId.toString()}`)
        .send(categoryDto)
        .expect(200)
      expect(response.body).toEqual(
        expect.objectContaining({
          name: 'Blabla',
          id: cat.insertedId.toString(),
        }),
      )
    })

    it('should delete the category', async () => {
      const cat = await categoriesCollection.insertOne({ name: 'teste' })

      const response = await request(httpServer)
        .delete(`/categories/${cat.insertedId}`)
        .expect(200)
      expect(response.body).toMatchObject({})
    })
  })
})
